import { useState, useEffect } from 'react';
import Link from "@docusaurus/Link";
import clsx from "clsx";
import styles from "./styles.module.css";
import { FaCaretDown } from "react-icons/fa";
import { storageAvailable } from '@site/src/utils/localStorage';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function FeedbackButton() {

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
            localStorage.setItem('feedback-collapse-date', toString(Date.now()));
        }
    };

    useEffect(() => {
        const ONE_DAY_MS = 86400000;
        let prev = localStorage.getItem('feedback-collapse-date');
        let shouldCollapse = false;
        if (prev != null && !(prev === "")) {
            if (+prev < Date.now() - ONE_DAY_MS) {
                localStorage.setItem('feedback-collapse-date', "");
            } else {
                shouldCollapse = true;
            }
        }
        setExpanded(!shouldCollapse);
        setHidden(false);
    });

    return (
        <div className={clsx(styles.topright, styles.feedbackbutton, hidden ? styles.hidden : "")}>
            <span className={clsx(styles.collapsible, blockAnimation ? "" : styles.collapsibletransition, expanded ? styles.uncollapsed : styles.collapsed)}>
                <span className={styles.inner}>
                    <Link
                        to="https://forms.cloud.microsoft/Pages/DesignPageV2.aspx?origin=NeoPortalPage&subpage=design&id=jnIAKtDwtECk6M5DPz-8p4IIpHdEnmhNgjOa9FjrwGtUMkI0NDFOOVlTVURTRThKMFVaT1ZNQ0hHSy4u"
                        className={styles.greytext}
                    >
                        SEND FEEDBACK
                    </Link>
                </span>
            </span>
            <FaCaretDown
                onClick={toggleFeedbackCollapsible}
                className={clsx(styles.rotcarat, expanded ? styles.rotated : "")}
            />
        </div>
    )
};