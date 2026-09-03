import React from 'react';
import PropTypes from 'prop-types';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { MdDriveFileMove } from 'react-icons/md';
import { FaBookmark } from 'react-icons/fa';
import styles from './styles.module.css';

/**
 * Single resource row with thumbnail + overlay actions + text content.
 * Renders skeleton placeholders when isPlaceholder=true or title is empty.
 */
export default function ResourceRow({ resource, defaultImage }) {
  const {
    id,
    title,
    description,
    authors,
    pageUrl,
    docsUrl,
    resourceUrl,
    isPlaceholder,
  } = resource;

  // Derive authors list into chips without splitting on commas inside names
  // Prefer separators: bullet •, pipe |, semicolon ;
  const splitAuthors = (authors || '')
    .split(/[•|;]+/)
    .map((a) => a.trim())
    .filter(Boolean);

  // Reorder 'Last, First Middle' -> 'First Middle Last'
  const reorderName = (name) => {
    if (!name) return '';
    const parts = name.split(',');
    if (parts.length >= 2) {
      const last = parts[0].trim();
      const first = parts.slice(1).join(',').trim();
      return `${first} ${last}`.trim();
    }
    return name.trim();
  };

  const initialsFrom = (name) => {
    const cleaned = name.replace(/\s+/g, ' ').trim();
    const segs = cleaned.split(' ');
    const first = segs[0] || '';
    const last = segs[segs.length - 1] || '';
    const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    return initials || cleaned.charAt(0).toUpperCase();
  };

  const authorChips = splitAuthors.map((raw) => {
    const display = reorderName(raw);
    return {
      raw,
      display,
      initials: initialsFrom(display),
    };
  });

  const originLabel = resourceUrl ? 'HydroShare' : undefined;

  // Render skeleton placeholders while loading
  if (isPlaceholder || !title) {
    return (
      <div className={styles.row}>
        <div className={styles.content}>
          <div className={styles.titlePlaceholder} />
          <div className={styles.authorsPlaceholder} />
          <div className={styles.descPlaceholder} />
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={styles.row}>
      {/* Content: title, authors chips, description */}
      <div className={styles.content}>
        <h3 className={styles.title}>
          {resourceUrl ? (
            <a
              href={resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleLink}
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        {/* Meta row: origin + authors chips */}
        <div className={styles.metaRow}>
          {originLabel && (
            <span className={`${styles.chip} ${originLabel === 'HydroShare' ? styles.originChip : ''}`}>{originLabel}</span>
          )}
          {authorChips.length > 0 && (
            <div className={styles.chips} aria-label="Authors">
              {authorChips.map((a, idx) => (
                <span key={`${id}-author-${idx}`} className={styles.chip} title={a.display}>
                  <span className={styles.chipAvatar} aria-hidden="true">{a.initials}</span>
                  <span className={styles.chipText}>{a.display}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* Persistent actions on the right */}
      <div className={styles.actionsBar} aria-label="Resource actions">
        {pageUrl && (
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Visit website"
            aria-label="Visit website"
          >
            <LiaExternalLinkSquareAltSolid size={22} />
            <span className={styles.actionLabel}>Website</span>
          </a>
        )}
        {docsUrl && (
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Documentation"
            aria-label="Documentation"
          >
            <FaBookmark size={18} />
            <span className={styles.actionLabel}>Docs</span>
          </a>
        )}
        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionButton}
            title="Resource page"
            aria-label="Resource page"
          >
            <MdDriveFileMove size={22} />
            <span className={styles.actionLabel}>HydroShare</span>
          </a>
        )}
      </div>
    </div>
  );
}

ResourceRow.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    authors: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    pageUrl: PropTypes.string,
    docsUrl: PropTypes.string,
    resourceUrl: PropTypes.string,
    isPlaceholder: PropTypes.bool,
  }).isRequired,
  defaultImage: PropTypes.string,
};
