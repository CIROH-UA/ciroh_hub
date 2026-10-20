import React, { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaWindowClose } from 'react-icons/fa';
import styles from './styles.module.css';

// Selector for the elements inside the panel that can receive keyboard focus
const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Generic modal that renders arbitrary content in a panel above the page.
 * @param {boolean} open - Whether the modal is open or not.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {string} title - Optional title to display at the top of the modal.
 * @param {boolean} fullScreen - Whether the panel should fill the viewport below the navbar. Defaults to false (panel sized to its content).
 * @param {React.ReactNode} children - Content to render inside the modal.
 */
export default function ModalGeneric({ open, onClose, title, fullScreen = false, children }) {
    const panelRef = useRef(null);  // Ref to the panel element so we can manage focus and keyboard events
    const titleId = useId();        // Unique ID for the title element so we can reference it with aria-labelledby

    // Prevent background scrolling while the modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Dismiss the modal when the user presses Escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    // Move focus into the panel on open and restore it to the previously
    // focused element (usually the trigger button) on close
    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement;
        panelRef.current?.focus();
        return () => {
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [open]);

    // Trap Tab / Shift+Tab inside the panel while the modal is open
    const handleKeyDown = (e) => {
        // Only handle Tab key presses and only if the panel is mounted
        if (e.key !== 'Tab' || !panelRef.current) return;

        // Find all focusable elements inside the panel
        const focusable = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) {
            e.preventDefault();
            return;
        }

        // Get the first and last focusable elements
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        // Wrap focus to the last element when shift-tabbing past the first element
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
            e.preventDefault();
            last.focus();
        }
        else
        // Wrap focus to the first element when tabbing forward past the last element
        if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    // Don't render the modal at all if it's not open
    if (!open) return null;

    // Fill the viewport below the navbar, or size the panel to its content
    const panelSizing = fullScreen
        ? 'tw-w-full tw-h-full'
        : 'tw-w-full tw-max-w-xl tw-max-h-full';

    // Render the modal as a portal to ensure it appears outside its parent
    return ReactDOM.createPortal(
        // Modal Backdrop (click to dismiss)
        <div
            className={`tw-fixed tw-inset-0 tw-z-[150] tw-flex tw-items-center tw-justify-center tw-bg-slate-900/70 tw-backdrop-blur-sm tw-p-4 ${styles.modalBelowNavbar}`}
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                className={`tw-relative tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-auto tw-rounded-xl tw-shadow-2xl tw-bg-slate-100 dark:tw-bg-slate-900 tw-p-6 tw-outline-none ${panelSizing}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="tw-absolute tw-top-4 tw-right-4 tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-400 tw-bg-white/80 tw-p-2 tw-text-slate-700 hover:tw-text-cyan-700 hover:tw-border-cyan-600 dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-shadow-md tw-transition"
                >
                    <FaWindowClose />
                </button>

                {/* Modal title */}
                {title && (
                    <h2
                        id={titleId}
                        className={`tw-font-bold tw-self-center tw-mb-0 tw-px-10 tw-text-center tw-text-cyan-700 dark:tw-text-cyan-300 ${styles.title}`}
                    >
                        {title}
                    </h2>
                )}

                {/* Modal content */}
                <div className="tw-min-h-0 tw-flex-1">
                    {children}
                </div>
            </div>
        </div>
        , document.body);
}
