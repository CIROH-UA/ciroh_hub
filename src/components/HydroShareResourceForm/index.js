import React, { useState, useEffect, useContext } from 'react';
import { FaSpinner } from 'react-icons/fa';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AuthContext, AuthProvider } from 'react-oauth2-code-pkce';
import styles from './styles.module.css';

const resourceTypeOptions = [
    { value: 'ciroh_hub_app', label: 'App' },
    { value: 'ciroh_hub_data', label: 'Dataset' },
    { value: 'ciroh_hub_module', label: 'Course' },
    { value: 'ciroh_hub_presentation', label: 'Presentation' },
    { value: 'ciroh_hub_notebook', label: 'Notebook' }
];

const urlBase = 'https://www.hydroshare.org/hsapi';

/* Keys used to persist form state across the OAuth redirect */
const FORM_STATE_KEY = 'hydroshare-resource-form';
const AUTH_PENDING_KEY = 'hydroshare-resource-form-auth-pending';

function ResourceForm() {
    const { token, logIn, logOut, loginInProgress } = useContext(AuthContext);

    const [title, setTitle] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [tokenValid, setTokenValid] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressMessage, setProgressMessage] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');

    /* The library trusts whatever token is in localStorage, so verify it
       against HydroShare and discard it if it's stale or foreign */
    useEffect(() => {
        if (!token) { setTokenValid(false); return; }
        let cancelled = false;
        fetch(`${urlBase}/userInfo/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((resp) => {
                if (cancelled) return;
                if (resp.ok) setTokenValid(true);
                else logOut();
            })
            .catch(() => { if (!cancelled) logOut(); });
        return () => { cancelled = true; };
    }, [token]);

    /* Restore form state when returning from HydroShare authentication */
    useEffect(() => {
        if (!token) return;
        const pendingSince = parseInt(localStorage.getItem(AUTH_PENDING_KEY), 10);
        if (!pendingSince || Date.now() - pendingSince > 10 * 60 * 1000) return;

        try {
            const saved = JSON.parse(localStorage.getItem(FORM_STATE_KEY));
            if (saved && Date.now() - saved.timestamp < 30 * 60 * 1000) {
                setTitle(saved.title || '');
                setResourceType(saved.resourceType || '');
            }
        } catch (err) {
            console.warn('Failed to restore form state:', err);
        }
        localStorage.removeItem(AUTH_PENDING_KEY);
        localStorage.removeItem(FORM_STATE_KEY);
    }, [token]);

    const handleLogout = () => {
        logOut();
        // End the hydroshare.org session in a short-lived popup: the logout
        // request must be a top-level navigation for the browser to send
        // HydroShare's session cookie, but this way the user stays on this page.
        const logoutUrl = 'https://www.hydroshare.org/accounts/logout/';
        const win = window.open(logoutUrl, '_blank', 'width=500,height=550');
        if (!win) {
            // Popup blocked — fall back to navigating this page there
            window.location.assign(logoutUrl);
            return;
        }
        // Don't null win.opener: closing a cross-origin popup requires the
        // intact opener relationship, or win.close() silently no-ops
        setTimeout(() => {
            if (!win.closed) win.close();
        }, 2500);
    };

    const handleAuthenticate = () => {
        localStorage.setItem(FORM_STATE_KEY, JSON.stringify({
            title,
            resourceType,
            timestamp: Date.now(),
        }));
        localStorage.setItem(AUTH_PENDING_KEY, Date.now().toString());
        logIn();
    };

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setProgressMessage('');
        setResourceUrl('');

        // Validate form state before sending to HydroShare
        if (!token || !tokenValid) { handleAuthenticate(); return; }
        if (!title.trim()) { setError('Title is required.'); return; }
        if (!resourceType) { setError('Resource type is required.'); return; }

        const formData = new FormData();
        formData.append('resource_type', 'CompositeResource');
        formData.append('title', title.trim());
        formData.append('keywords[0]', resourceType);
        // Pre-create the optional metadata keys (empty) so users can see
        // what to fill in on HydroShare; empty values are treated the same
        // as missing keys when CIROH Hub renders the resource. Only seed
        // the keys that make sense for the selected resource type.
        const extraMetadata = { page_url: '', thumbnail_url: '' };
        if (resourceType === 'ciroh_hub_app' || resourceType === 'ciroh_hub_data') {
            extraMetadata.docs_url = '';
        }
        if (resourceType === 'ciroh_hub_presentation') {
            extraMetadata.pres_path = '';
        }
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
            setProgressMessage('Resource created successfully! View it ');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    /* Authenticated means having a token that HydroShare accepted */
    const authenticated = Boolean(token) && tokenValid;
    const verifying = Boolean(token) && !tokenValid;

    const getButtonText = () => {
        if (loading) return 'Processing…';
        if (verifying) return 'Verifying HydroShare session…';
        if (loginInProgress) return 'Redirecting…';
        if (!authenticated) return 'Authenticate with HydroShare to Create a Resource';
        return 'Create Resource';
    };

    return (
        <div className={styles.container}>
            {/* Subtitle */}
            <p className={styles.subtitle}>Use the form below to create a new CIROH HydroShare resource.</p>

            {/* Logout Button */}
            {authenticated && (
                <div className={styles.authRow}>
                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={handleLogout}
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

                {/* Submit / Authenticate */}
                <button
                    type={authenticated ? 'submit' : 'button'}
                    className={clsx(styles.button, styles.buttonPrimary)}
                    disabled={loading || loginInProgress || verifying}
                    onClick={!authenticated ? handleAuthenticate : undefined}
                    title={!authenticated ? 'Click to authenticate with HydroShare' : undefined}
                >
                    {getButtonText()}
                </button>
            </form>
            
            {/* Progress Message */}
            {progressMessage && (
                <div className={styles.progressMessage}>
                    {loading && <FaSpinner className={styles.spinner} />}
                    <span>
                        {progressMessage}
                        {!loading && resourceUrl && (
                            <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                                here
                            </a>
                        )}
                    </span>
                </div>
            )}

            {/* Error Message */}
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
}

function ResourceFormWithAuth() {
    const { siteConfig: { customFields } } = useDocusaurusContext();
    const contributePath = useBaseUrl('/contribute');

    const authConfig = {
        clientId: customFields.hs_client_id,
        authorizationEndpoint: 'https://www.hydroshare.org/o/authorize/',
        tokenEndpoint: 'https://www.hydroshare.org/o/token/',
        redirectUri: `${window.location.origin}${contributePath}`,
        scope: 'read write',
        autoLogin: false,
        decodeToken: false, // HydroShare tokens are opaque, not JWTs
        clearURL: true,
    };

    return (
        <AuthProvider authConfig={authConfig}>
            <ResourceForm />
        </AuthProvider>
    );
}

/* AuthProvider touches window/localStorage, so it can only render client-side */
export default function HydroShareResourceForm() {
    return (
        <BrowserOnly fallback={<div />}>
            {() => <ResourceFormWithAuth />}
        </BrowserOnly>
    );
}
