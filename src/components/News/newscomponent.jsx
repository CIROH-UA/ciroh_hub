import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./NewsComponent.module.css";

const NewsComponent = ({ data, isLatest }) => {
  const isNew = isNewFormat(data.date);
  return isNew ? (
    <NewNewsSection data={data} isLatest={isLatest} />
  ) : (
    <OldNewsSection data={data} isLatest={isLatest} />
  );
};

function isNewFormat(dateString) {
  if (!dateString || typeof dateString !== "string") return false;
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const match = dateString.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/
  );

  if (!match) return false;

  const monthName = match[1];
  const yearNum = parseInt(match[2], 10);
  const monthIndex = monthNames.indexOf(monthName);

  if (yearNum > 2025) return true;
  if (yearNum === 2025 && monthIndex >= 10) return true;

  return false;
}

// =====================================================
// =============== OLD LAYOUT (pre-Nov 2025) ===========
// =====================================================

const OldNewsSection = ({ data, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  return (
    <div className={styles.newsContainer}>
      <NewsHeader
        date={data.date}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <div className={styles.newsContent}>
          {data.items.map((item, index) => (
            <div key={index} className={styles.newsItem}>
              <div className={styles.itemHeader}>
                <span className={`${styles.badge} ${styles[`badge--${getBadgeClass(item.type)}`]}`}>
                  {item.type}
                </span>
                <h3 className={styles.itemTitle}>{item.title}</h3>
              </div>

              <div className={styles.itemDescription}>
                {renderDescription(item.description)}
              </div>

              {item.link && (
                <div className={styles.itemLink}>
                  <Link
                    to={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readMoreLink}
                  >
                    <span>Read more</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================
// =============== NEW LAYOUT (Nov 2025+) ==============
// =====================================================

const NewNewsSection = ({ data, isLatest }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  const groupedItems = groupItemsByTitle(data.items);

  return (
    <div className={styles.newsContainer}>
      <NewsHeader
        date={data.date}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <div className={styles.newsContent}>
          <div className={styles.newsGrid}>
            {groupedItems.map((group, index) => (
              <NewsCard key={`${group.title}-${index}`} item={group} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// =============== SHARED COMPONENTS ===================
// =====================================================

const NewsHeader = ({ date, isExpanded, onToggle }) => {
  const logoSafeUrl = useBaseUrl("/img/logos/ciroh-bgsafe.png");
  const sidelineDarkUrl = useBaseUrl("/img/graphics/news/sideline-dark.png");
  const sidelineLightUrl = useBaseUrl("/img/graphics/news/sideline-light.png");
  const underlinesDarkUrl = useBaseUrl("/img/graphics/news/underlines-dark.png");
  const underlinesLightUrl = useBaseUrl("/img/graphics/news/underlines-light.png");

  return (
    <div className={styles.headerSection} onClick={onToggle}>
      <div className={styles.logoSection}>
        <img className={`${styles.logo}`} alt="CIROH logo" src={logoSafeUrl} />
      </div>

      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <img className={`darkImage ${styles.waveIcon}`} alt="Wave graphic" src={sidelineDarkUrl} />
          <img className={`lightImage ${styles.waveIcon}`} alt="Wave graphic" src={sidelineLightUrl} />
          <span className={styles.titleText}>News</span>
          <img className={`darkImage ${styles.waveIcon}`} alt="Wave graphic" src={sidelineDarkUrl} />
          <img className={`lightImage ${styles.waveIcon}`} alt="Wave graphic" src={sidelineLightUrl} />
        </div>
        <h2 className={styles.dateTitle}>{date}s</h2>
        <div className={styles.underlineSection}>
          <img className={`darkImage ${styles.underline}`} alt="Wave graphic" src={underlinesDarkUrl} />
          <img className={`lightImage ${styles.underline}`} alt="Wave graphic" src={underlinesLightUrl} />
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

const NewsCard = ({ item }) => {
  const links = getLinksFromItem(item);
  const { releaseLinks, prLinks } = categorizeLinks(links);
  const versions = extractVersions(item, releaseLinks);
  const contributorsCount = item.contributors ?? 0;
  const releaseDate = item.release_date ? new Date(item.release_date) : null;
  const relativeTime = releaseDate ? formatRelativeTime(releaseDate) : null;

  return (
    <div className={styles.newsCard}>
      <div className={styles.cardHeader}>
        <span className={`${styles.cardBadge} ${styles[`cardBadge--${getBadgeClass(item.type)}`]}`}>
          {item.type}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>

        {item.description && (
          <div className={styles.cardDescription}>
            {renderDescription(item.description)}
          </div>
        )}

        {versions.length > 0 && (
          <div className={styles.cardVersions}>
            {versions.map((version, idx) => (
              <Link
                key={idx}
                to={version.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.versionTag}
              >
                {version.label}
              </Link>
            ))}
          </div>
        )}

        {prLinks.length > 0 && (
          <div className={styles.cardPRs}>
            {prLinks.map((pr, idx) => (
              <Link
                key={idx}
                to={pr.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.prTag}
              >
                {pr.label}
              </Link>
            ))}
          </div>
        )}

        <div className={styles.cardMeta}>
          {relativeTime && (
            <span className={styles.cardMetaItem}>
              <span className={styles.metaIcon}>🟢</span>
              {relativeTime}
            </span>
          )}

          {contributorsCount > 0 && (
            <span className={styles.cardMetaItem}>
              <span className={styles.metaIcon}>👥</span>
              {contributorsCount} contributor{contributorsCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// =============== UTILITY FUNCTIONS ===================
// =====================================================

function getBadgeClass(type) {
  const badgeMap = {
    bug: "danger",
    note: "info",
    feature: "success",
    news: "info",
    update: "warning",
    NGIAB: "info",
    NRDS: "primary",
    blog: "info",
  };
  return badgeMap[type] || "primary";
}

function renderDescription(description) {
  if (!description) return null;

  return (
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={styles.markdownLink}
            {...props}
          />
        ),
      }}
      urlTransform={safelyUseBaseUrl}
    >
      {description}
    </ReactMarkdown>
  );
}

function safelyUseBaseUrl(link) {
  const isWebLink = link.startsWith("http://") || link.startsWith("https://");
  return isWebLink ? link : useBaseUrl(link);
}

function getLinksFromItem(item) {
  if (item?.links && Array.isArray(item.links)) return item.links;
  if (item?.link) return [item.link];
  return [];
}

function categorizeLinks(links) {
  const releaseLinks = [];
  const prLinks = [];

  links.forEach((link) => {
    if (isPRLink(link)) {
      prLinks.push({
        link,
        label: extractPRNumber(link),
      });
    } else if (isReleaseLink(link)) {
      releaseLinks.push(link);
    }
  });

  return { releaseLinks, prLinks };
}

function isPRLink(link) {
  return link.includes("/pull/") || link.includes("/pr/");
}

function isReleaseLink(link) {
  return link.includes("/tag/") || link.includes("/releases/");
}

function extractPRNumber(link) {
  const match = link.match(/\/pull\/(\d+)|\/pr\/(\d+)/);
  if (match) {
    const prNumber = match[1] || match[2];
    return `PR #${prNumber}`;
  }
  return "PR";
}

function extractVersionFromLink(link) {
  if (!link) return null;
  const tagMatch = link.match(/\/tag\/([^\/]+)/);
  return tagMatch ? tagMatch[1] : null;
}

function extractVersions(item, releaseLinks) {
  const versions = [];

  // Check for explicit versions array
  if (item?.versions && Array.isArray(item.versions)) {
    item.versions.forEach((version, idx) => {
      versions.push({
        label: version,
        link: releaseLinks[idx] || "#",
      });
    });
    return versions;
  }

  // Extract from release links
  releaseLinks.forEach((link) => {
    const version = extractVersionFromLink(link);
    if (version) {
      versions.push({
        label: version,
        link: link,
      });
    }
  });

  // Fallback to single version
  if (versions.length === 0 && item?.version) {
    versions.push({
      label: item.version,
      link: item.link || "#",
    });
  }

  return versions;
}

function groupItemsByTitle(items) {
  const grouped = {};

  items.forEach((item) => {
    const title = item.title;
    if (!grouped[title]) {
      grouped[title] = {
        type: item.type,
        title,
        links: [],
        description: item.description || "",
        contributors: item.contributors ?? null,
        release_date: item.release_date ?? null,
      };
    }

    const itemLinks = getLinksFromItem(item);
    grouped[title].links.push(...itemLinks);

    if (item.description) {
      grouped[title].description = item.description;
    }

    if (item.contributors !== undefined) {
      grouped[title].contributors = item.contributors;
    }

    if (item.release_date !== undefined) {
      grouped[title].release_date = item.release_date;
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

export default NewsComponent;