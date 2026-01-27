import React from 'react';
import clsx from 'clsx';
import styles from './PublicationCard.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import {
  HiOutlineExternalLink,
  HiOutlineDocumentText,
  HiOutlineCalendar,
} from 'react-icons/hi';

function addSpacesOnCaseTransition(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/([0-9])([a-z])/g, '$1 $2');
}

const typeIcons = {
  journalArticle: '📄',
  conferencePaper: '🎤',
  report: '📋',
  book: '📖',
  thesis: '🎓',
  dataset: '📊',
};

export default function PublicationCard({ publication, index }) {
  const { colorMode } = useColorMode();

  if (!publication) return null;

  const {
    title = 'Untitled Publication',
    creators = [],
    date,
    url,
    itemType,
    publicationTitle,
    DOI,
    abstractNote,
    tags = [],
  } = publication;

  // Format authors
  const authorList =
    creators.length > 0
      ? creators.slice(0, 3).map((creator) => creator.lastName || creator.name || 'Anonymous').join(', ') +
        (creators.length > 3 ? ` +${creators.length - 3} more` : '')
      : 'No authors listed';

  // Format date
  const pubDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'No date';

  // Get icon for publication type
  const typeIcon = typeIcons[itemType] || '📄';

  const CardContent = () => (
    <div
      className={clsx(
        styles.publicationCard,
        colorMode === 'dark' && styles.cardDark,
        styles.slideUp
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header with type icon and badge */}
      <div className={styles.cardHeader}>
        <div className={styles.typeBadge}>
          <span className={styles.typeIcon}>{typeIcon}</span>
          <span className={styles.typeText}>
            {addSpacesOnCaseTransition(itemType)}
          </span>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
            title="Open publication"
          >
            <HiOutlineExternalLink size={18} />
          </a>
        )}
      </div>

      {/* Title */}
      <h3 className={styles.cardTitle}>{title}</h3>

      {/* Authors */}
      <div className={styles.authorsSection}>
        <p className={styles.authors}>{authorList}</p>
      </div>

      {/* Publication details */}
      <div className={styles.metaInfo}>
        <div className={styles.metaItem}>
          <HiOutlineCalendar size={14} />
          <span>{pubDate}</span>
        </div>
        {publicationTitle && (
          <div className={styles.metaItem}>
            <HiOutlineDocumentText size={14} />
            <span className={styles.journal}>{publicationTitle}</span>
          </div>
        )}
      </div>

      {/* Abstract preview */}
      {abstractNote && (
        <div className={styles.abstractPreview}>
          <p>{abstractNote.substring(0, 150)}...</p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className={styles.tag}>
              {typeof tag === 'string' ? tag : tag.tag}
            </span>
          ))}
          {tags.length > 3 && <span className={styles.moreTag}>+{tags.length - 3}</span>}
        </div>
      )}

      {/* DOI link */}
      {DOI && (
        <a
          href={`https://doi.org/${DOI}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.doiLink}
        >
          View DOI →
        </a>
      )}

      {/* Call to action */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaButton}
        >
          Read Publication
          <HiOutlineExternalLink size={16} />
        </a>
      )}
    </div>
  );

  return <CardContent />;
}
