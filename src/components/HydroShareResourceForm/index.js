import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import clsx from 'clsx';
import useHydroShareAuth from '@site/src/components/HydroShareAuth/useHydroShareAuth';
import styles from './styles.module.css';

const resourceTypeOptions = [
    { value: 'ciroh_hub_app', label: 'App' },
    { value: 'ciroh_hub_data', label: 'Dataset' },
    { value: 'ciroh_hub_module', label: 'Course' },
    { value: 'ciroh_hub_presentation', label: 'Presentation' },
    { value: 'ciroh_hub_notebook', label: 'Notebook' }
];

// Descriptions for each optional metadata key
const METADATA_DESCRIPTIONS = {
    docs_url: 'a link to any documentation for your resource',
    page_url: 'a link to the page where your resource is hosted',
    pres_path: 'the name of the presentation file uploaded as content',
    thumbnail_url: 'a link to an image to use as a thumbnail for your resource',
};

// The optional metadata keys to create for each resource type. Used to add them to a new resource created on HydroShare
const METADATA_KEYS_BY_TYPE = {
    ciroh_hub_app: ['docs_url', 'page_url', 'thumbnail_url'],
    ciroh_hub_data: ['docs_url', 'page_url', 'thumbnail_url'],
    ciroh_hub_module: ['page_url', 'thumbnail_url'],
    ciroh_hub_presentation: ['page_url', 'pres_path', 'thumbnail_url'],
    ciroh_hub_notebook: ['page_url', 'thumbnail_url'],
};

const urlBase = 'https://www.hydroshare.org/hsapi';

/* Key used to persist form input across the OAuth redirect */
const FORM_STATE_KEY = 'hydroshare-resource-form';
const FORM_STATE_MAX_AGE_MS = 30 * 60 * 1000;

export default function HydroShareResourceForm() {
    const { token, authenticated, verifying, loginInProgress, logIn, logOut } = useHydroShareAuth();

    const [title, setTitle] = useState('');
    const [resourceType, setResourceType] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');

    /* Restore form input saved before the HydroShare login redirect. The saved
       state only exists if the user clicked authenticate with the form filled */
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(FORM_STATE_KEY));
            if (saved && Date.now() - saved.timestamp < FORM_STATE_MAX_AGE_MS) {
                setTitle(saved.title || '');
                setResourceType(saved.resourceType || '');
            }
            localStorage.removeItem(FORM_STATE_KEY);
        } catch (err) {
            console.warn('Failed to restore form state:', err);
        }
    }, []);

    const handleAuthenticate = () => {
        // Save the form input so it survives the redirect to HydroShare
        localStorage.setItem(FORM_STATE_KEY, JSON.stringify({
            title,
            resourceType,
            timestamp: Date.now(),
        }));
        logIn();
    };

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setResourceUrl('');

        // Validate form state before sending to HydroShare
        if (!authenticated) { handleAuthenticate(); return; }
        if (!title.trim()) { setError('Title is required.'); return; }
        if (!resourceType) { setError('Resource type is required.'); return; }

        const formData = new FormData();
        formData.append('resource_type', 'CompositeResource');
        formData.append('title', title.trim());
        formData.append('keywords[0]', resourceType);
        // Pre-create the optional metadata keys (empty) so users can see
        // what to fill in on HydroShare; empty values are treated the same
        // as missing keys when CIROH Hub renders the resource. Only the
        // keys that make sense for the selected resource type are added.
        const metadataKeys = METADATA_KEYS_BY_TYPE[resourceType] || [];
        const extraMetadata = Object.fromEntries(metadataKeys.map((key) => [key, '']));
        formData.append('extra_metadata', JSON.stringify(extraMetadata));

        setLoading(true);
        try {
            const resp = await fetch(`${urlBase}/resource/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!resp.ok) {
                throw new Error((await resp.text()) || `Server error ${resp.status}`);
            }
            const { resource_id: resourceId } = await resp.json();
            if (!resourceId) throw new Error('No resource ID returned');

            setResourceUrl(`https://www.hydroshare.org/resource/${resourceId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const getButtonText = () => {
        if (loading) return 'Processing… ';
        if (verifying) return 'Verifying HydroShare session…';
        if (loginInProgress) return 'Redirecting…';
        if (!authenticated) return 'Authenticate with HydroShare to Create a Resource';
        return 'Create Resource';
    };

    return (
        <div className={styles.container}>
            {/* Subtitle */}
            <p className={styles.subtitle}>Use the form below to create a new CIROH HydroShare resource</p>

            {/* Logout Button */}
            {authenticated && (
                <div className={styles.authRow}>
                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={logOut}
                    >
                        Log out of HydroShare
                    </button>
                </div>
            )}

            {/* Resource Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
                {/* Title */}
                <label className={styles.label}>
                    Title
                    <input
                        type="text"
                        className={styles.input}
                        value={title}
                        placeholder="Resource Title"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>

                {/* Resource type */}
                <label className={styles.label}>
                    Resource Type
                    <select
                        className={styles.input}
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                    >
                        <option value="" disabled>Select a resource type…</option>
                        {resourceTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </label>

                {/* Post-creation checklist */}
                <details className={styles.checklistDetails}>
                    <summary>What to fill in on HydroShare after your resource is created</summary>
                    <ul className={styles.checklist}>
                        <li><strong>Sharing status</strong> — set to public in the "Manage who has access" menu</li>
                        <li><strong>Abstract</strong> — add a description of your resource</li>
                        <li><strong>Content</strong> — upload any files related to your resource</li>
                        <li><strong>Subject keywords</strong> — the necessary CIROH subject is added for you, but add any additional subjects related to your resource</li>
                        {(METADATA_KEYS_BY_TYPE[resourceType] || []).length > 0 && (
                            <li>
                                <strong>Additional metadata</strong> — fill in the entries created for you:
                                <ul>
                                    {METADATA_KEYS_BY_TYPE[resourceType].map((key) => (
                                        <li key={key}><code>{key}</code> — {METADATA_DESCRIPTIONS[key]}</li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </details>

                {/* Submit / Authenticate */}
                {!resourceUrl && (
                    <button
                        type={authenticated ? 'submit' : 'button'}
                        className={clsx(styles.button, styles.buttonPrimary)}
                        disabled={loading || loginInProgress || verifying}
                        onClick={!authenticated ? handleAuthenticate : undefined}
                        title={!authenticated ? 'Click to authenticate with HydroShare' : undefined}
                    >
                        {getButtonText()}
                        {loading && <FaSpinner className={styles.spinner} />}
                    </button>
                )}

                {/* View Resource */}
                {resourceUrl && (
                    <button
                        type='button'
                        className={clsx(styles.button, styles.buttonVisitResource)}
                        disabled={!resourceUrl}
                        onClick={() => window.open(resourceUrl, '_blank', 'noopener,noreferrer')}
                        title='View Resource'
                    >
                        Resource created successfully, finish editing it here
                    </button>
                )}
            </form>

            {/* Error Message */}
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
}
