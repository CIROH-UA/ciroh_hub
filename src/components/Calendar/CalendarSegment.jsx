import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import CalendarEntry from "./CalendarEntry";
import styles from "./CalendarComponent.module.css";

// Displays one month of entries
const CalendarSegment  = ({ data, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  const groupedItems = groupItemsByTitle(data.items);

  return (
    <div className={styles.newsContainer}>
      <CalendarHeader
        date={data.date}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <div className={styles.newsContent}>
          <div className={styles.newsGrid}>
            {groupedItems.map((group, index) => (
              <CalendarEntry key={`${group.title}-${index}`} item={group} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarHeader = ({ date, isExpanded, onToggle }) => {

  return (
    <div className={styles.headerSection} onClick={onToggle}>

      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <span className={styles.titleText}>{date}</span>
        </div>
      </div>

      <div className={styles.expandIndicator}>
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ""}`}>
          {isExpanded ? "−" : "+"}
        </span>
        <span className={styles.expandText}>
          {isExpanded ? "Click to collapse" : "Click to expand"}
        </span>
      </div>
    </div>
  );
};

function groupItemsByTitle(items) {
  const grouped = {};

  items.forEach((item) => {
    const title = item.title;
    if (!grouped[title]) {
      grouped[title] = {
        type: item.type,
        title,
        links: [],
        linksText: [],
        description: item.description || "",
        date: item.date || "",
      };
    }

    const itemLinks = getLinksFromItem(item);
    grouped[title].links.push(...itemLinks);

    const itemLinksText = getLinksTextFromItem(item);
    grouped[title].linksText.push(...itemLinksText)

    if (item.description) {
      grouped[title].description = item.description;
    }
  });

  return Object.values(grouped).map((group) => ({
    ...group,
    links: [...new Set(group.links)],
  }));
}

function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} month${months > 1 ? "s" : ""} ago`;
  
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function getLinksFromItem(item) {
  if (item?.links && Array.isArray(item.links)) return item.links;
  if (item?.link) return [item.link];
  return [];
}

function getLinksTextFromItem(item) {
  if (item?.linksText && Array.isArray(item.linksText)) return item.linksText;
  if (item?.linkText) return [item.linkText];
  return [];
}

export default CalendarSegment;