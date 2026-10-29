import React from 'react';
import { LuPencil } from 'react-icons/lu';
import clsx from 'clsx';
import useHydroShareAuth from '@site/src/components/HydroShare/Auth/useHydroShareAuth';
import styles from './styles.module.css';

/**
 * A small floating card that holds the HydroShare login/logout control.
 * It is fixed to the top-right of the viewport, just below the navbar, so
 * it sits above the page content without taking a slot in the page flow.
 *
 * This is a UI counterpart to the HydroShareAuth provider: the provider owns the
 * auth state/logic (via useHydroShareAuth), this card renders it. All state comes
 * from the site-wide context, so a login started here returns the user to
 * whatever page they were on.
 *
 * Three states:
 *   - verifying:   a stored token is being checked, show a neutral placeholder
 *                  so the card doesn't flash "Log in" and then swap
 *   - logged out:  prompt + a "Log in to HydroShare" button
 *   - logged in:   who's signed in + a compact "Log out" button
 *
 * @param {string} [className] Extra class for the outer card (e.g. positioning overrides)
 */
export default function HydroShareAuthPopup({ className }) {
    const { authenticated, verifying, loginInProgress, userInfo, logIn, logOut } = useHydroShareAuth();

    // A friendly name for the signed-in user
    const displayName = userInfo?.username || userInfo?.email || 'your HydroShare account';

    let content;

    if (verifying)
    {
        // Checking authentication status
        content = (
            <div className={styles.row} role="status">
                <span className={styles.message}>Checking your HydroShare login…</span>
            </div>
        );
    }
    else
    if (authenticated)
    {
        // Logged in — compact: identity + log out
        content = (
            <div className={styles.row}>
                <span className={styles.message}>
                    Logged in as <strong>{displayName}</strong>
                </span>
                <button type="button" className={styles.logoutButton} onClick={logOut}>
                    Log out
                </button>
            </div>
        );
    }
    else
    {
        // Logged out — taller: prompt + reason + login button
        content = (
            <div className={styles.column}>
                <span className={styles.message}>
                    <LuPencil className={styles.icon} aria-hidden="true" />
                    <span className={styles.messageText}>Log in to HydroShare to edit your resources</span>
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

    return (
        <div
            className={clsx(styles.card, className)}
            role="region"
            aria-label="HydroShare account"
        >
            {content}
        </div>
    );
}
