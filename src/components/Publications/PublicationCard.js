import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './PublicationCard.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import ModalImageViewer from '@site/src/components/Modal/ModalImageViewer';
import { FaRegImage } from 'react-icons/fa';


function addSpacesOnCaseTransition(str) {
  return str
    // Add space between lowercase and uppercase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Add space between uppercase and lowercase (for consecutive capitals)
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

export default function PublicationCard({ publication, index, resolveImageUrls }) {
  const { colorMode } = useColorMode();
  const [showImageModal, setShowImageModal] = useState(false);
  const [resolvedImageUrls, setResolvedImageUrls] = useState([]);
  const [openingModal, setOpeningModal] = useState(false);
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState(null);

  if (!publication) return null;

  const {
    title = 'Untitled Publication',
    creators = [],
    date,
    url,
    itemType,
    publicationTitle,
    DOI,
    thumbnailUrl,
    thumbnailLoading,
    images = [],
  } = publication;

  // Handle creators with a smaller separator between names
  const authorList =
    creators.length > 0
      ? creators.map((creator, i) => (
          <span key={i}>
            {creator.lastName || creator.name || 'Anonymous'}
            {i < creators.length - 1 && (
              <span className={styles.separator}> • </span>
            )}
          </span>
        ))
      : 'No authors listed';

  // Format the date
  const pubDate = date;

  // Resolve image URLs fresh when the user opens the modal. Done at click
  // time (not at page load) so Zotero's signed file URLs for imported_file
  // attachments don't expire while the user reads the page.
  const onOpenImageViewer = async () => {
    if (openingModal) return;
    setOpeningModal(true);
    try {
      const urls = resolveImageUrls && images.length > 0
        ? await resolveImageUrls(images)
        : [];
      setResolvedImageUrls(urls);
    } catch (err) {
      console.error(`Failed to resolve image URLs for "${title}":`, err);
      setResolvedImageUrls([]);
    } finally {
      setShowImageModal(true);
      setOpeningModal(false);
    }
  };

  // Card content component
  const CardContent = () => (
    <div
      className={clsx(
        styles.publicationCard,
        'card',
        colorMode === 'dark' && styles.cardDark
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 1. Item Type */}
      {itemType && (
        <div className={styles.itemType}>
          {addSpacesOnCaseTransition(itemType)}
        </div>
      )}

      {/* 2. Published on Date (below item type) */}
      {pubDate && (
        <div className={styles.publishDate}>Published on {pubDate}</div>
      )}

      {/* 3. Thumbnail */}
      {(thumbnailLoading || (thumbnailUrl && thumbnailUrl !== failedThumbnailUrl)) && (
        <div className={styles.thumbnailContainer}>
          {thumbnailUrl && thumbnailUrl !== failedThumbnailUrl ? (
            <>
              {/* Thumbnail Image */}
              <img
                src={thumbnailUrl}
                alt={`${title} thumbnail`}
                className={styles.thumbnail}
                onError={() => {
                  console.warn(`Failed to load thumbnail for "${title}"`);
                  setFailedThumbnailUrl(thumbnailUrl);
                }}
              />
              {/* Open Image Viewer Icon */}
              <button
                type="button"
                className={styles.imageIcon}
                onClick={onOpenImageViewer}
                disabled={openingModal}
                aria-label={`View images for ${title}`}
              >
                <FaRegImage size={40} />
              </button>
            </>
          ) : (
            <div className={styles.thumbnailSkeleton} />
          )}
        </div>
      )}

      <div className={styles.cardScroll}>
        {/* 4. Title */}
        { url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
            <h3 className={styles.cardTitle}>{title}</h3>
          </a>
        ) : (
          <h3 className={styles.cardTitle}>{title}</h3>
        )}

        {/* 5. Authors */}
        <div className={styles.authors}>{authorList}</div>

        {/* 6. Journal */}
        {publicationTitle && (
          <div className={styles.journal}>{publicationTitle}</div>
        )}

        {/* 7. DOI */}
        {DOI && (
          <div className={styles.doi}>
            doi{' '}
            <a
              href={`https://doi.org/${DOI}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {DOI}
            </a>
          </div>
        )}

        {/* 8. Images button when no thumbnail is available */}
        {(!thumbnailLoading && (!thumbnailUrl || thumbnailUrl === failedThumbnailUrl) && images.length > 0) && (
          <div className={styles.noThumbnail}>
            {/* Open Image Viewer Icon */}
            <button
              type="button"
              className={styles.imageIcon}
              onClick={onOpenImageViewer}
              disabled={openingModal}
              aria-label={`View images for ${title}`}
            >
              <FaRegImage size={25} />
            </button>
          </div>
        )}
      </div>
    <ModalImageViewer className="tw-absolute" open={showImageModal} onClose={() => setShowImageModal(false)} title={title} images={resolvedImageUrls} indicatorColorDark="#F5A424" />
    </div>
  );

  return <CardContent />;
}
