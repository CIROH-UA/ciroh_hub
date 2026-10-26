import React from 'react';
import { LuPencil } from 'react-icons/lu';
import clsx from 'clsx';
import useHydroShareAuth from '@site/src/components/HydroShareAuth/useHydroShareAuth';
import styles from './styles.module.css';

/**
 * A horizontal bar that holds the HydroShare login/logout control plus a bit of
 * context about why logging in matters (editing your own resources). Meant to
 * sit below the featured-resources carousel and above the resources selector.
 *
 * This is the UI counterpart to the HydroShareAuth provider: the provider owns
 * the auth state/logic (via useHydroShareAuth), this bar renders it. All state
 * comes from the site-wide context, so a login started here returns the user to
 * whatever page they were on.
 *
 * Layout: a full-width band (colored to match the resources panel below, so the
 * backgrounds read as continuous) with the compact bar centered on it. The bar
 * is self-contained and makes no assumptions about what sits above it — spacing
 * between page sections is the page's responsibility, not the bar's. Pass
 * `className` if a consumer needs to add outer spacing.
 *
 * Three states:
 *   - verifying:   a stored token is being checked, show a neutral placeholder
 *                  so the bar doesn't flash "Log in" and then swap
 *   - logged out:  prompt + a "Log in to HydroShare" button
 *   - logged in:   who's signed in + a "Log out" button
 *
 * @param {string} [className] Extra class for the outer band (e.g. outer spacing)
 */
export default function HydroShareAuthBar({ className }) {
    const { authenticated, verifying, loginInProgress, userInfo, logIn, logOut } = useHydroShareAuth();

    // A friendly name for the signed-in user
    const displayName = userInfo?.username || userInfo?.email || 'your HydroShare account';

    // The bar contents vary by auth state; the band wrapper is the same for all
    let bar;

    if (verifying) {
        // Checking authentication status
        bar = (
            <div className={styles.bar} role="status">
                <span className={styles.message}>Checking your HydroShare login…</span>
            </div>
        );
    } else if (authenticated) {
        // Logged in
        bar = (
            <div className={styles.bar}>
                <span className={styles.message}>
                    {/* <LuPencil className={styles.icon} aria-hidden="true" /> */}
                    Logged in as <strong>{displayName}</strong>
                </span>
                <button type="button" className={styles.logoutButton} onClick={logOut}>
                    Log out
                </button>
            </div>
        );
    } else {
        // Logged out
        bar = (
            <div className={styles.bar}>
                <span className={styles.message}>
                    <LuPencil className={styles.icon} aria-hidden="true" />
                    Log in to HydroShare to edit your resources.
                </span>
                <button
                    type="button"
                    className={styles.loginButton}
                    onClick={logIn}
                    disabled={loginInProgress}
                >
                    {loginInProgress ? 'Redirecting…' : 'Log in to HydroShare'}
                </button>
            </div>
        );
    }

    return <div className={clsx(styles.band, className)}>{bar}</div>;
}
