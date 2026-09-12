import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { AuthContext, AuthProvider } from 'react-oauth2-code-pkce';

export const HS_API_BASE = 'https://www.hydroshare.org/hsapi';
const HS_LOGOUT_URL = 'https://www.hydroshare.org/accounts/logout/';

const RETURN_TO_KEY = 'hydroshare-auth-return-to';  // The key in sessionStorage that stores where the user was when they started logging in, so they can be sent back
const AUTH_PENDING_KEY = 'hydroshare-auth-pending'; // The key in localStorage that stores when a login redirect starts, so a page load with a fresh token can be recognized as a return from HydroShare rather than an ordinary visit
const AUTH_PENDING_MAX_AGE_MS = 10 * 60 * 1000;

// Default state: logged out with no-op actions. Used during SSR and by any component rendered outside the provider
const DEFAULT_AUTH_STATE = {
    token: '',
    authenticated: false,
    verifying: false,
    loginInProgress: false,
    returnedFromLogin: false,
    logIn: () => {},
    logOut: () => {},
    clearReturnedFromLogin: () => {},
};

export const HydroShareAuthContext = createContext(DEFAULT_AUTH_STATE);

/**
 * Layers CIROH Hub's authentication state on top of react-oauth2-code-pkce:
 * verifies stored tokens against HydroShare, tracks returns from the login
 * redirect, and wraps logIn/logOut with return-to and HydroShare session
 * logout behavior.
 */
function VerifiedAuthLayer({ children }) {
    const { token, logIn: pkceLogIn, logOut: pkceLogOut, loginInProgress } = useContext(AuthContext);
    const history = useHistory();

    const [tokenValid, setTokenValid] = useState(false);
    const [returnedFromLogin, setReturnedFromLogin] = useState(false);

    // react-oauth2-code-pkce trusts whatever token is in localStorage, so verify it against HydroShare and discard it if it's stale or foreign
    useEffect(() => {
        // No token exists, not verifying
        if (!token) { setTokenValid(false); return; }

        // Verify the token against HydroShare's userInfo endpoint
        let cancelled = false;
        fetch(`${HS_API_BASE}/userInfo/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((resp) => {
                if (cancelled) return;
                if (resp.ok) setTokenValid(true);
                else pkceLogOut();
            })
            .catch(() => { if (!cancelled) pkceLogOut(); });
        return () => { cancelled = true; };
    }, [token]);

    // Complete a return from the HydroShare login redirect: flag it for consumers and send the user back to the page they started on
    useEffect(() => {
        // No token exists, not returning from a login
        if (!token) return;

        // Check if a login redirect is pending and still within the allowed time window
        const pendingSince = parseInt(localStorage.getItem(AUTH_PENDING_KEY), 10);
        if (!pendingSince || Date.now() - pendingSince > AUTH_PENDING_MAX_AGE_MS) return;

        // A valid login redirect is detected; clear the pending flag and mark the return
        localStorage.removeItem(AUTH_PENDING_KEY);
        setReturnedFromLogin(true);

        // Redirect the user back to the page they started on, if possible
        try {
            // Attempt to retrieve the return-to URL from session storage
            const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
            sessionStorage.removeItem(RETURN_TO_KEY);

            // Navigate to the return-to URL if it exists and is different from the current path
            const currentPath = window.location.pathname + window.location.search;
            if (returnTo && returnTo !== currentPath) history.replace(returnTo);
        } catch {
            // Session storage unavailable; the user stays on the redirect page
        }
    }, [token]);

    // Wrapper to record the current page and time before redirecting to HydroShare
    const logIn = useCallback(() => {
        try {
            // Store the current page and time in session and local storage
            sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search);
            localStorage.setItem(AUTH_PENDING_KEY, Date.now().toString());
        } catch {
            // Storage unavailable; the login still works without return-to
        }
        // Redirect to HydroShare login
        pkceLogIn();
    }, [pkceLogIn]); 

    /* Clear our tokens, then end the hydroshare.org session in a short-lived
       popup: the logout request must be a top-level navigation for the browser
       to send HydroShare's session cookie, but this way the user stays here */
    const logOut = useCallback(() => {
        // Clear our local tokens before ending the HydroShare session
        pkceLogOut();

        // Open a short-lived popup to end the HydroShare session
        const win = window.open(HS_LOGOUT_URL, '_blank', 'width=500,height=550');
        if (!win) {
            // Popup blocked — fall back to navigating this page there
            window.location.assign(HS_LOGOUT_URL);
            return;
        }

        // Don't null win.opener: closing a cross-origin popup requires the intact opener relationship, or win.close() silently no-ops
        setTimeout(() => {
            if (!win.closed) win.close();
        }, 2500);
    }, [pkceLogOut]);

    // Clear the returned-from-login flag
    const clearReturnedFromLogin = useCallback(() => setReturnedFromLogin(false), []);

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(() => ({
        token,
        authenticated: Boolean(token) && tokenValid,
        verifying: Boolean(token) && !tokenValid,
        loginInProgress,
        returnedFromLogin,
        logIn,
        logOut,
        clearReturnedFromLogin,
    }), [token, tokenValid, loginInProgress, returnedFromLogin, logIn, logOut, clearReturnedFromLogin]);

    // Expose the auth state to consumers of HydroShareAuthContext
    return (
        <HydroShareAuthContext.Provider value={value}>
            {children}
        </HydroShareAuthContext.Provider>
    );
}

/**
 * Client-side HydroShare authentication provider. Wraps the AuthProvider
 * and ensures that the VerifiedAuthLayer is applied.
 */
function ClientHydroShareAuthProvider({ children }) {
    const { siteConfig: { customFields } } = useDocusaurusContext();
    const contributePath = useBaseUrl('/contribute');

    const authConfig = useMemo(() => ({
        clientId: customFields.hs_client_id,
        authorizationEndpoint: 'https://www.hydroshare.org/o/authorize/',
        tokenEndpoint: 'https://www.hydroshare.org/o/token/',
        // Must exactly match a redirect URI registered on the HydroShare OAuth app.
        // Pinned to /contribute: the provider is site-wide, so the login can complete
        // there from any page, after which the user is sent back to where they started
        redirectUri: `${window.location.origin}${contributePath}`,
        scope: 'read write',
        autoLogin: false,
        decodeToken: false, // HydroShare tokens are opaque, not JWTs
        clearURL: true,
    }), [customFields.hs_client_id, contributePath]);

    return (
        <AuthProvider authConfig={authConfig}>
            <VerifiedAuthLayer>{children}</VerifiedAuthLayer>
        </AuthProvider>
    );
}

/**
 * Site-wide HydroShare authentication provider. Mounted once in theme/Root.js;
 * components access the auth state through the useHydroShareAuth hook.
 *
 * react-oauth2-code-pkce touches window/localStorage, so during the
 * static build the children render without a provider and consumers get the
 * logged-out defaults.
 */
export default function HydroShareAuthProvider({ children }) {
    if (!ExecutionEnvironment.canUseDOM) return <>{children}</>;
    return <ClientHydroShareAuthProvider>{children}</ClientHydroShareAuthProvider>;
}
