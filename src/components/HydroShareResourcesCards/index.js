import React, { useEffect, useRef, useState } from 'react';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { FaGraduationCap } from 'react-icons/fa';
import { IoTvOutline } from 'react-icons/io5';
import { LuLayers3, LuPencil } from 'react-icons/lu';
import { HiOutlineGlobeAlt, HiOutlineUserGroup } from 'react-icons/hi';
import styles from './styles.module.css';
import { isPlaceholder, splitAuthors, StatTag, ActionLink, ActionButton } from './shared';
import { updateResourceScimeta } from '@site/src/components/HydroShareImporter';
import useHydroShareAuth from '@site/src/components/HydroShareAuth/useHydroShareAuth';


export function ResourceCard({ resource, defaultImage, onResourceUpdated }) {
    const placeholder = isPlaceholder(resource);
    const [showEmbed, setShowEmbed] = useState(false);
    const [embedSrc, setEmbedSrc] = useState(null);
    const objectUrlRef = useRef(null);

    const title = resource?.title || 'Untitled';
    const description = resource?.description || '';
    const authors = splitAuthors(resource?.authors);
    const keywords = Array.isArray(resource?.keywords)
        ? resource.keywords
        : (Array.isArray(resource?.subjects) ? resource.subjects : []);

    const thumbnailUrl = resource?.thumbnail_url || defaultImage;
    const pageUrl = resource?.page_url;
    const docsUrl = resource?.docs_url;
    const resourceUrl = resource?.resource_url;
    const embedUrl = resource?.embed_url;
    const resourceType = resource?.resource_type;

    const { authenticated, token } = useHydroShareAuth();

    // Stores the user's edits for the resource fields until either saved or canceled
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editAuthorsText, setEditAuthorsText] = useState(authors.join(', ')); // Authors are edited as a single comma-separated string
    const [editDescription, setEditDescription] = useState(description);

    useEffect(() => {
        if (!showEmbed || !embedUrl) {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setEmbedSrc(null);
            return;
        }

        let cancelled = false;
        fetch(embedUrl)
            .then(r => r.blob())
            .then(blob => {
                if (cancelled) return;
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                }
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setEmbedSrc(url);
            })
            .catch(() => {
                if (!cancelled) setEmbedSrc(null);
            });

        return () => {
            cancelled = true;
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [showEmbed, embedUrl]);

    useEffect(() => {
        if (!showEmbed) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowEmbed(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showEmbed]);

    /**
     * Puts the component into edit mode, allowing the user to modify the resource fields.
     */
    function enableEditing() {
        // Sync drafts to the current values each time editing starts
        setEditTitle(title);
        setEditAuthorsText(authors.join(', '));
        setEditDescription(description);
        setIsEditing(true);
    }

    /**
     * Cancels edit mode, discarding any unsaved changes.
     */
    function cancelEditing() {
        setIsEditing(false);
    }

    /**
     * Handles saving the edits made to the resource fields.
     * Prevents the default form submission and updates the resource with the edited values.
     */
    async function handleSave(e) {
        e.preventDefault();

        const changes = {};         // The changed fields to send to updateResourceScimeta
        const displayPatch = {};    // The shape used to update the card in place

        // Add title if it has changed
        if (editTitle.trim() !== title) {
            changes.title = editTitle.trim();
            displayPatch.title = editTitle.trim();
        }

        // Add updated authors if they have changed
        if (editAuthorsText.trim() !== authors.join(', ')) {
            // Split the edited authors text into an array of individual author names
            const authorNames = editAuthorsText.split(',').map(a => a.trim()).filter(Boolean);
            changes.authors = authorNames;

            // Join the author names with the 🖊 separator for display purposes
            displayPatch.authors = authorNames.join(' 🖊 ');
        }

        // Add description if it has changed (HydroShare's abstract)
        if (editDescription.trim() !== description) {
            changes.description = editDescription.trim();
            displayPatch.description = editDescription.trim();
        }

        // Nothing changed — just leave edit mode without a request
        if (Object.keys(changes).length === 0) {
            setIsEditing(false);
            return;
        }

        try {
            // Send the changes to HydroShare to update the resource's science metadata
            await updateResourceScimeta(resource?.resource_id, token, changes);

            // Update the card in place through the parent so the new values
            // persist in the list; the card re-renders from the updated prop
            if (typeof onResourceUpdated === 'function') {
                onResourceUpdated(resource?.resource_id, displayPatch);
            }

            // Close the edit mode after successfully updating the resource
            setIsEditing(false);
        }
        catch (error) {
            console.error('Error updating resource:', error);
            // Keep the form open so the user can retry; don't close on failure
        }
    }

    return (
        <>
            <article
                id={resource?.resource_id}
                className="tw-group tw-flex tw-h-full tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border-2 tw-border-slate-400 dark:tw-border-slate-500 tw-bg-slate-100 dark:tw-bg-slate-900 tw-shadow-md hover:tw-shadow-xl hover:tw-border-cyan-500 tw-transition"
            >
            <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-4 tw-p-5">
                {isEditing ? (
                    /* Edit Mode */
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

                        {/* Cancel and Save Buttons */}
                        <div className={styles.editActions}>
                            <button type="button" className={styles.editCancel} onClick={cancelEditing}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.editSave}>
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Thumbnail, Title, and Edit Button */}
                        <div className="tw-flex tw-items-start tw-gap-4">
                            {/* Thumbnail */}
                            <div className="tw-relative tw-shrink-0 tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 tw-rounded-lg tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
                                {placeholder ? (
                                    <div className="tw-h-full tw-w-full tw-animate-pulse tw-bg-slate-200 dark:tw-bg-slate-800" />
                                ) : thumbnailUrl ? (
                                    <img
                                        src={thumbnailUrl}
                                        alt={title}
                                        className="tw-h-full tw-w-full tw-object-fill"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-text-slate-400 dark:tw-text-slate-500">
                                        <LuLayers3 size={28} />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="tw-min-w-0 tw-flex-1">
                                {placeholder ? (
                                    <div className="tw-space-y-3">
                                        <div className="tw-h-5 tw-w-2/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                        <div className="tw-h-4 tw-w-1/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                    </div>
                                ) : (
                                    <h3 className="tw-text-base sm:tw-text-lg tw-font-semibold tw-leading-snug tw-text-slate-900 dark:tw-text-white tw-line-clamp-2">
                                        {pageUrl || resourceUrl ? (
                                            <a
                                                href={pageUrl || resourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={title}
                                                className="tw-no-underline tw-text-black hover:tw-text-cyan-700 dark:tw-text-white dark:hover:tw-text-cyan-300"
                                            >
                                                {title}
                                            </a>
                                        ) : (
                                            <div title={title}>{title}</div>
                                        )}
                                    </h3>
                                )}
                            </div>

                            {/* Edit Button */}
                            {authenticated && (
                                <div className={styles.editButton} onClick={enableEditing}>
                                    <LuPencil size={16} />
                                </div>
                            )}
                        </div>

                        {/* Authors */}
                        {placeholder ? (
                            <div className="tw-h-4 tw-w-1/2 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                        ) : (
                            authors.length > 0 && (
                                <div className="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-text-slate-600 dark:tw-text-slate-300 tw-whitespace-normal tw-break-words">
                                    <span className="tw-mt-[1px] tw-shrink-0 tw-text-slate-500 dark:tw-text-slate-400" aria-hidden="true">
                                        <HiOutlineUserGroup size={16} />
                                    </span>
                                    <span>
                                        {authors.join(' • ')}
                                    </span>
                                </div>
                            )
                        )}

                        {/* Description */}
                        {placeholder ? (
                            <div className="tw-space-y-3">
                                <div className="tw-h-4 tw-w-full tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                <div className="tw-h-4 tw-w-5/6 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                <div className="tw-h-4 tw-w-3/4 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                            </div>
                        ) : (
                            description && (
                                <p className={`tw-text-sm tw-leading-relaxed tw-text-slate-600 dark:tw-text-slate-300 tw-overflow-y-auto tw-max-h-36 ${styles.scrollbar}`}>
                                    {description}
                                </p>
                            )
                        )}
                    </>
                )}
            </div>

            {/* Resource Type and Action Buttons */}
            <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-slate-200/70 tw-text-black dark:tw-text-white dark:tw-border-slate-700/70 tw-bg-cyan-400 dark:tw-bg-slate-800 tw-px-5 tw-py-3">
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {resourceType && !placeholder && <StatTag>{resourceType}</StatTag>}
                    {!resourceType && !placeholder && <StatTag>Resource</StatTag>}
                </div>

                <div className="tw-flex tw-items-center tw-gap-2">
                    <ActionLink href={pageUrl} title="Website">
                        <LiaExternalLinkSquareAltSolid size={18} />
                    </ActionLink>
                    <ActionLink href={docsUrl} title="Learning / Docs">
                        <FaGraduationCap size={16} />
                    </ActionLink>
                    <ActionLink href={resourceUrl} title="HydroShare Resource">
                        <HiOutlineGlobeAlt size={18} />
                    </ActionLink>
                    {embedUrl && (
                        <ActionButton
                            onClick={(e) => {
                                e.preventDefault();
                                setShowEmbed(true);
                            }}
                            title="View PDF"
                        >
                            <IoTvOutline size={18} />
                        </ActionButton>
                    )}
                </div>
            </div>
            </article>

            {/* Embed PDF Modal */}
            {showEmbed && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/70 tw-backdrop-blur-sm"
                    onClick={() => setShowEmbed(false)}
                >
                    <div
                        className="tw-relative tw-h-[85vh] tw-w-[92vw] tw-max-w-5xl tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowEmbed(false)}
                            aria-label="Close PDF"
                            className="tw-absolute tw-right-3 tw-top-3 tw-z-10 tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-full tw-bg-slate-900/70 tw-text-white hover:tw-bg-slate-900"
                        >
                            ×
                        </button>
                        <div className="tw-h-full tw-w-full tw-p-4">
                            {embedSrc ? (
                                <embed
                                    src={embedSrc}
                                    type="application/pdf"
                                    className="tw-h-full tw-w-full tw-rounded-lg"
                                />
                            ) : (
                                <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-lg tw-bg-slate-100 dark:tw-bg-slate-800">
                                    Loading PDF...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function HydroShareResourcesCards({ resources, defaultImage, onResourceUpdated }) {
    return (
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 2xl:tw-grid-cols-3 tw-gap-6">
            {resources.map(resource => (
                <ResourceCard
                    key={resource.resource_id}
                    resource={resource}
                    defaultImage={defaultImage}
                    onResourceUpdated={onResourceUpdated}
                />
            ))}
        </div>
    );
}
