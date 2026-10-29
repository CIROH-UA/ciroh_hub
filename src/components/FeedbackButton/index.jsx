import { useState, useEffect } from 'react';
import Link from "@docusaurus/Link";
import clsx from "clsx";
import styles from "./styles.module.css";
import { FaCaretDown } from "react-icons/fa";
import { storageAvailable } from '@site/src/utils/localStorage';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function FeedbackButton() {

    const {siteConfig} = useDocusaurusContext();
    const [expanded, setExpanded] = useState(false);
    const [blockAnimation, setBlockAnimation] = useState(true);
    const [hidden, setHidden] = useState(true);
    const localStorageAvailable = useIsBrowser() && storageAvailable('localStorage');

    function toggleFeedbackCollapsible() {
        setExpanded(!expanded);
        setBlockAnimation(false);
        if (!localStorageAvailable) return;
        let prev = localStorage.getItem('feedback-collapse-date');
        if (!expanded) { // Note: this value hasn't refreshed yet
            localStorage.setItem('feedback-collapse-date', "");
        }
        else if (prev == null || prev === "") {
            localStorage.setItem('feedback-collapse-date', String(Date.now()));
        }
    };

    useEffect(() => {
        const ONE_DAY_MS = 86400000;
        let shouldCollapse = false;
        try {
            const prev = localStorage.getItem('feedback-collapse-date');
            if (prev != null && prev !== "") {
                if (+prev < Date.now() - ONE_DAY_MS) {
                    localStorage.setItem('feedback-collapse-date', "");
                } else {
                    shouldCollapse = true;
                }
            }
        } catch {
            // Continue without persistence when storage is unavailable.
        }
        setExpanded(!shouldCollapse);
        setHidden(false);
    }, []);

    return (
        <div className={clsx(styles.topright, styles.feedbackbutton, hidden ? styles.hidden : "")}>
            <span className={clsx(styles.collapsible, blockAnimation ? "" : styles.collapsibletransition, expanded ? styles.uncollapsed : styles.collapsed)}>
                <span className={styles.inner}>
                    <Link
                        to={siteConfig.customFields.externalLinks.feedbackForm}
                        className={styles.greytext}
                        tabIndex={expanded ? 0 : -1}
                        aria-hidden={!expanded}
                    >
                        SEND FEEDBACK
                    </Link>
                </span>
            </span>
            <button
                type="button"
                onClick={toggleFeedbackCollapsible}
                aria-label={expanded ? "Collapse feedback button" : "Expand feedback button"}
                aria-expanded={expanded}
                style={{ display: "inline-flex", padding: 0, border: 0, background: "none", color: "inherit", cursor: "pointer" }}
            >
                <FaCaretDown
                    aria-hidden="true"
                    className={clsx(styles.rotcarat, expanded ? styles.rotated : "")}
                />
            </button>
        </div>
    )
};