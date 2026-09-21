import { useState } from 'react';
import Link from "@docusaurus/Link";
import clsx from "clsx";
import styles from "./styles.module.css";
import { BiCaretDown } from "react-icons/bi";

export default function FeedbackButton() {
    const [expanded, setExpanded] = useState(true);

    return (
        <div class={clsx(styles.topright, styles.feedbackbutton)}>
            <span class={clsx(styles.hideable, expanded ? styles.unhidden : styles.hidden)}>
                <span class={styles.inner}>
                    <Link
                        to="https://forms.cloud.microsoft/Pages/DesignPageV2.aspx?origin=NeoPortalPage&subpage=design&id=jnIAKtDwtECk6M5DPz-8p4IIpHdEnmhNgjOa9FjrwGtUMkI0NDFOOVlTVURTRThKMFVaT1ZNQ0hHSy4u"
                        class={styles.greytext}
                    >
                        SEND FEEDBACK
                    </Link>
                </span>
            </span>
            <BiCaretDown
                onClick={() => setExpanded(!expanded)}
                class={clsx(styles.rotcarat, expanded ? styles.rotated : "")}
            />
        </div>
    )
};