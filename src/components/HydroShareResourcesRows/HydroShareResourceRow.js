import React, { useEffect, useState,useRef } from 'react';
import Link from '@docusaurus/Link';
import { MdDriveFileMove } from 'react-icons/md';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { FaBookmark } from "react-icons/fa";
import { IoTvOutline } from "react-icons/io5";
import clsx from 'clsx';
import styles from './styles.module.css';

export default function HydroShareResourceRow({ resource, defaultImage }) {

  const [showEmbed, setShowEmbed] = useState(false);
  const [embedSrc, setEmbedSrc] = useState(null);
  const objectUrlRef = useRef(null);

  const toggleShowEmbed = (e) => {
    e.preventDefault();
    setShowEmbed(!showEmbed);
  }
  const closeEmbed = () => setShowEmbed(false);

  const {
    resource_id,
    title = 'Untitled',
    authors = '',
    description,
    thumbnail_url,
    page_url,
    docs_url,
    resource_url,
    embed_url,
  } = resource;
  useEffect(() => {
    // 1. If the embed is requested, fetch the PDF and build a blob URL
    if (showEmbed && embed_url) {
      fetch(embed_url)
        .then(r => r.blob())
        .then(blob => {
          // Revoke any previous URL before replacing it
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
          }
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setEmbedSrc(url);
        });
    } else {
      // 2. If the panel is being hidden, clear the URL immediately
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setEmbedSrc(null);
    }

    // 3. Component-unmount (or dependency-change) cleanup
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [showEmbed, embed_url]);
  return (
    <div id={resource_id} className={styles.columnItem}>
      {/* Unlike tiles, the overarching structure is wrapped in a column to support embeds */}
      <div id={resource_id+"_content"} className={clsx(styles.rowItem, 'card')}>
        {/* ─── FULL-CARD OVERLAY ─── */}
        {/* Covers the whole card so any click that isn't on a "real" link            */}
        {/* triggers the hash–scroll. Not nested: it's a sibling in the DOM.          */}
        <Link
          to={`#${resource_id}`}
          className={styles.fullCardLink}
          title="Scroll to this resource"
        />
        {/* ─── THUMBNAIL ─── */}
        <div className={styles.imageWrapper}>
          {thumbnail_url ? (
            <img src={thumbnail_url} alt={title} className={styles.image} />
          ) : defaultImage ? (
            <img src={defaultImage} alt={title} className={styles.image} />
          ) : (
            <div className={clsx(styles.imagePlaceholder, styles.placeholder)} />
          )}

          <div className={styles.hoverOverlay}>
            <h5 className={styles.overlayTitle}>{title}</h5>
            <div className={styles.overlayIcons}>
              {page_url && (
                <a
                  href={page_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconLink}
                  title="Website"
                >
                  <LiaExternalLinkSquareAltSolid size={30} />
                </a>
              )}
              {docs_url && (
                <a
                  href={docs_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconLink}
                  title="Docs Page"
                >
                  <FaBookmark  size={20} />
                </a>
              )}
              {resource_url && (
                <a
                  href={resource_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.iconLink}
                  title="Resource Page"
                >
                  <MdDriveFileMove size={30} />
                </a>
              )}
              {embed_url && (
                  <a
                    href="#"
                    role="button"           
                    tabIndex={0}
                    onClick={toggleShowEmbed}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleShowEmbed(e);
                      }
                    }}
                    className={styles.iconLink}
                    title={showEmbed ? 'Hide PDF' : 'Display PDF'}
                  >
                  <IoTvOutline size={30} />

                  </a>
              )}
            </div>
          </div>
        </div>

        {/* ─── TEXT BLOCK ─── */}
        <div className={styles.textWrapper}>
          {title ? (
            <h1 className={styles.title}>
              {/* External link → page_url */}
              <a
                href={page_url || resource_url || '#'}
                target="_blank"
                rel="noreferrer"
                className={styles.pageLink}
              >
                {title}
              </a>
            </h1>
          ) : (
            <h1 className={styles.titlePlaceholder} />
          )}
          
          {authors ? (
            
            <p className={styles.authors}>{authors}</p>
          ) : (
            <p className={styles.authorsPlaceholder} />
          )}

          {description ? (
            <p className={styles.description}>{description}</p>
          ) : (
            <p className={styles.descriptionPlaceholder} />
          )}
        </div>
      </div>
      {showEmbed && (
        <div id={`${resource_id}_embed`} className={clsx(styles.rowItem, 'card')}>
          <button
            type="button"
            onClick={closeEmbed}
            aria-label="Close PDF"
            className={styles.closeButton}
          >
            ×
          </button>
          <div className={styles.embedCentering}>
            <div className={styles.embedWrapper}>
              {embedSrc && (
                <embed
                  src={embedSrc}
                  type="application/pdf"
                  className={styles.embedContent}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
