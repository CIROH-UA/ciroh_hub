import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from './styles.module.css';
import { splitAuthors } from './shared';
import { updateResourceScimeta, updateResourceCustomMetadata, uploadResourceFile } from '@site/src/components/HydroShareImporter';
import useHydroShareAuth from '@site/src/components/HydroShareAuth/useHydroShareAuth';
import SegmentedToggle from '@site/src/components/SegmentedToggle';

// Maps a resource's keyword to a type, which decides what metadata fields are editable
const TAGS = {
    nwm_portal_app: 'app',
    ciroh_hub_app: 'app',
    nwm_portal_module: 'course',
    ciroh_hub_module: 'course',
    ciroh_portal_presentation: 'presentation',
    ciroh_hub_presentation: 'presentation',
    ciroh_portal_data: 'dataset',
    ciroh_hub_data: 'dataset',
    ciroh_hub_notebook: 'notebook',
    ciroh_hub_event: 'event',
    ciroh_hub_group: 'group',
};

/**
 * Determine the resource type from its keywords/subjects
 * @param {string[]} keywords 
 * @returns {string} The determined resource type, or an empty string if unknown
 */
function getKeywordType(keywords) {
    // Trim and lower-case all keywords for consistent comparison
    const normalized = (Array.isArray(keywords) ? keywords : [])
        .map((k) => (typeof k === 'string' ? k.trim().toLowerCase() : ''))
        .filter(Boolean);

    // Check each tag in order and return the corresponding type if found
    for (const tag of Object.keys(TAGS)) {
        if (normalized.includes(tag.toLowerCase())) return TAGS[tag];
    }

    // If no known tag is found, return an empty string to indicate an unknown type
    return '';
}

/**
 * The edit form for a resource card.
 * Owns the draft state and saves to HydroShare (science metadata, custom
 * metadata, and thumbnail upload), then reports the change up via
 * onResourceUpdated and closes via onClose.
 *
 * @param {Object} resource The resource being edited
 * @param {function} onResourceUpdated Called with (resourceId, patch) after a successful save so the card updates in place
 * @param {function} onClose Called to leave edit mode (after save, cancel, or a no-op save)
 */
export default function ResourceEditForm({ resource, onResourceUpdated, onClose }) {
    const { token } = useHydroShareAuth();

    // Current values the drafts are compared against
    const title = resource?.title || 'Untitled';
    const description = resource?.description || '';
    const authors = splitAuthors(resource?.authors);
    const keywords = Array.isArray(resource?.keywords)
        ? resource.keywords
        : (Array.isArray(resource?.subjects) ? resource.subjects : []);
    const rawThumbnailUrl = resource?.thumbnail_url ?? ''; // The actual value, no display fallback
    const pageUrl = resource?.page_url;
    const docsUrl = resource?.docs_url;
    const presPath = resource?.pres_path;
    const keywordType = getKeywordType(keywords);

    // Draft state — Initialized from the current values on mount (the form only mounts when editing starts, so these are always fresh)
    const [saving, setSaving] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editAuthorsText, setEditAuthorsText] = useState(authors.join(', ')); // Authors are edited as a single comma-separated string
    const [editDescription, setEditDescription] = useState(description);
    const [editDocsUrl, setEditDocsUrl] = useState(docsUrl ?? '');
    const [editPageUrl, setEditPageUrl] = useState(pageUrl ?? '');
    const [editPresPath, setEditPresPath] = useState(presPath ?? '');
    const [editThumbnailUrl, setEditThumbnailUrl] = useState(rawThumbnailUrl);
    const [editThumbnailFile, setEditThumbnailFile] = useState(null); // An image file to upload as the thumbnail, if the user picks one
    const [thumbnailMode, setThumbnailMode] = useState('url'); // Which thumbnail input to show: 'url' or 'upload'

    /**
     * Save the edits to HydroShare, then update the card in place and close.
     */
    async function handleSave(e) {
        e.preventDefault();

        const attributeChanges = {};    // The changed fields to send to updateResourceScimeta
        const metadataChanges = {};     // The changed fields to send to updateResourceCustomMetadata
        const displayPatch = {};        // The shape used to update the card in place

        // Add title if it has changed
        if (editTitle.trim() !== title) {
            attributeChanges.title = editTitle.trim();
            displayPatch.title = editTitle.trim();
        }

        // Add updated authors if they have changed
        if (editAuthorsText.trim() !== authors.join(', ')) {
            // Split the edited authors text into an array of individual author names
            const authorNames = editAuthorsText.split(',').map(a => a.trim()).filter(Boolean);
            attributeChanges.authors = authorNames;

            // Join the author names with the 🖊 separator for display purposes
            displayPatch.authors = authorNames.join(' 🖊 ');
        }

        // Add description if it has changed (HydroShare's abstract)
        if (editDescription.trim() !== description) {
            attributeChanges.description = editDescription.trim();
            displayPatch.description = editDescription.trim();
        }

        // Add page_url metadata if it has changed
        if (editPageUrl != null && editPageUrl.trim() !== (pageUrl ?? '')) {
            metadataChanges.page_url = editPageUrl.trim();
            displayPatch.page_url = editPageUrl.trim();
        }

        // Add docs_url metadata if it has changed
        if (editDocsUrl != null && editDocsUrl.trim() !== (docsUrl ?? '')) {
            metadataChanges.docs_url = editDocsUrl.trim();
            displayPatch.docs_url = editDocsUrl.trim();
        }

        // Add thumbnail_url metadata if the pasted URL changed and no image file was chosen
        if (!editThumbnailFile && editThumbnailUrl != null && editThumbnailUrl.trim() !== rawThumbnailUrl) {
            metadataChanges.thumbnail_url = editThumbnailUrl.trim();
            displayPatch.thumbnail_url = editThumbnailUrl.trim();
        }

        // Add pres_path metadata if it has changed
        if (editPresPath != null && editPresPath.trim() !== (presPath ?? '')) {
            metadataChanges.pres_path = editPresPath.trim();
            displayPatch.pres_path = editPresPath.trim();
        }

        // Nothing changed, just leave edit mode without a request
        if (Object.keys(attributeChanges).length === 0 && Object.keys(metadataChanges).length === 0 && !editThumbnailFile) {
            onClose?.();
            return;
        }

        // Show visual feedback to user that the save operation is in progress
        setSaving(true);

        try {
            // Upload a chosen thumbnail image to the resource and point thumbnail_url at it
            if (editThumbnailFile) {
                // Determine the file extension for the uploaded thumbnail
                const ext = editThumbnailFile.name.includes('.') ? editThumbnailFile.name.split('.').pop() : 'img';

                // Generate a unique name for the uploaded thumbnail
                const uniqueName = `thumbnail_${crypto.randomUUID()}.${ext}`;

                // Create a new File object with the unique name for upload
                const namedFile = new File([editThumbnailFile], uniqueName, { type: editThumbnailFile.type });

                // Upload the named file to HydroShare and get its public URL
                const uploadedUrl = await uploadResourceFile(resource?.resource_id, token, namedFile);

                // Update the metadata changes and display patch with the uploaded thumbnail URL
                metadataChanges.thumbnail_url = uploadedUrl;
                displayPatch.thumbnail_url = uploadedUrl;
            }

            // Send the science metadata changes
            if (Object.keys(attributeChanges).length > 0) {
                await updateResourceScimeta(resource?.resource_id, token, attributeChanges);
            }

            // Send the custom metadata changes
            if (Object.keys(metadataChanges).length > 0) {
                await updateResourceCustomMetadata(resource?.resource_id, token, metadataChanges);
            }

            // Update the card in place through the parent, then leave edit mode
            if (typeof onResourceUpdated === 'function') {
                onResourceUpdated(resource?.resource_id, displayPatch);
            }
            onClose?.();
        }
        catch (error) {
            console.error('Error updating resource:', error);
            // Keep the form open so the user can retry; don't close on failure
        }
        finally {
            setSaving(false);
        }
    }

    // Events are HydroShare collections, which can't host uploaded files. Show only the URL field for thumbnails when editing an Event card
    const allowThumbnailUpload = keywordType !== 'event';

    // The URL text input, reused in both the toggle and the events-only case
    const thumbnailUrlInput = (
        <input
            type="text"
            className={styles.editInput}
            placeholder="Image URL"
            value={editThumbnailUrl}
            onChange={(e) => setEditThumbnailUrl(e.target.value)}
        />
    );

    // Thumbnail Field. Shows toggle between URL input and file upload.
    // Event cards only show the URL input. (Events are HydroShare collections which can't host uploaded files)
    const thumbnailField = (
        <div className={styles.editField}>
            <span className={styles.editLabel}>Thumbnail</span>

            {/* Only show the toggle if thumbnail uploads are allowed (i.e., not an event card) */}
            {allowThumbnailUpload ? (
                <>
                    {/* Toggle between URL input and file upload */}
                    <SegmentedToggle
                        style={{ marginBottom: '0.25rem' }}
                        ariaLabel="Thumbnail source"
                        value={thumbnailMode}
                        onChange={(mode) => {
                            setThumbnailMode(mode);
                            // Discard a picked file when switching back to URL mode
                            if (mode === 'url') setEditThumbnailFile(null);
                        }}
                        options={[
                            { label: 'URL', value: 'url' },
                            { label: 'Upload', value: 'upload' },
                        ]}
                    />

                    {/* Show URL input or file upload based on the selected mode */}
                    {thumbnailMode === 'url' ? (
                        // URL input
                        thumbnailUrlInput
                    ) : (
                        <>
                            {/* File upload input */}
                            <input
                                type="file"
                                accept="image/*"
                                className={styles.editFileInput}
                                onChange={(e) => setEditThumbnailFile(e.target.files?.[0] || null)}
                            />
                            {editThumbnailFile && (
                                <span className={styles.editFileHint}>Will upload: {editThumbnailFile.name}</span>
                            )}
                        </>
                    )}
                </>
            ) : (
                // Show URL input when thumbnail uploads are not allowed
                thumbnailUrlInput
            )}
        </div>
    );

    // page_url Field/Input
    const pageUrlField = (
        <label className={styles.editField}>
            <span className={styles.editLabel}>Page URL</span>
            <input
                type="text"
                className={styles.editInput}
                value={editPageUrl}
                onChange={(e) => setEditPageUrl(e.target.value)}
            />
        </label>
    );

    return (
        <form className={styles.editForm} onSubmit={handleSave}>
            {/* Title Field */}
            <label className={styles.editField}>
                <span className={styles.editLabel}>Title</span>
                <input
                    type="text"
                    className={styles.editInput}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                />
            </label>

            {/* Authors Field */}
            <label className={styles.editField}>
                <span className={styles.editLabel}>Authors</span>
                <input
                    type="text"
                    className={styles.editInput}
                    value={editAuthorsText}
                    onChange={(e) => setEditAuthorsText(e.target.value)}
                    placeholder="Separate authors with commas"
                />
            </label>

            {/* Description Field */}
            <label className={styles.editField}>
                <span className={styles.editLabel}>Description</span>
                <textarea
                    className={`${styles.editInput} ${styles.scrollbar}`}
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                />
            </label>

            {/* Custom metadata fields, which vary by resource type */}
            {keywordType === 'app' || keywordType === 'dataset' ? (
                <>
                {/* Documentation URL Field */}
                <label className={styles.editField}>
                    <span className={styles.editLabel}>Documentation URL</span>
                    <input
                        type="text"
                        className={styles.editInput}
                        value={editDocsUrl}
                        onChange={(e) => setEditDocsUrl(e.target.value)}
                    />
                </label>
                {pageUrlField}
                {thumbnailField}
                </>
            ) : keywordType === 'course' || keywordType === 'notebook' || keywordType === 'event' ? (
                <>
                {pageUrlField}
                {thumbnailField}
                </>
            ) : keywordType === 'presentation' && (
                <>
                {pageUrlField}
                {/* Presentation Path Field */}
                <label className={styles.editField}>
                    <span className={styles.editLabel}>Presentation Path</span>
                    <input
                        type="text"
                        className={styles.editInput}
                        value={editPresPath}
                        onChange={(e) => setEditPresPath(e.target.value)}
                    />
                </label>
                {thumbnailField}
                </>
            )}

            {/* Cancel and Save Buttons */}
            <div className={styles.editActions}>
                <button type="button" className={styles.editCancel} onClick={onClose} disabled={saving}>
                    Cancel
                </button>
                <button type="submit" className={styles.editSave} disabled={saving}>
                    {saving ? (
                        <>
                            <FaSpinner className={styles.spinner} />
                            Saving…
                        </>
                    ) : 'Save'}
                </button>
            </div>
        </form>
    );
}
