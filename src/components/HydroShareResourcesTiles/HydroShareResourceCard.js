import React from 'react';
import { MdDriveFileMove } from 'react-icons/md';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { LuLayers3 } from 'react-icons/lu';
import { FaBookmark  } from "react-icons/fa";
import { IoTvOutline } from "react-icons/io5";

import styles from './styles.module.css';

/**
 * Small square/rectangular “tile” card.
 *  • Outer div gets id={resource_id}        → target for #hash
 *  • Overlay title is a <Link to={`#id`}>   → clicking updates URL & scrolls
 */
export default function HydroShareResourceCard({ resource, defaultImage }) {
  const {
    resource_id,
    title = 'Untitled',
    thumbnail_url,
    page_url,
    docs_url,
    resource_url,
    embed_url,
  } = resource;

  return (
    <div id={resource_id} className={styles.gridItem}>
      <div className={styles.imageWrapper}>
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} className={styles.image} />
        ) : defaultImage ? (
          <img src={defaultImage} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <div className={styles.iconPlaceholder}>
              <LuLayers3 size={50} />
            </div>
          </div>
        )}

        {/* ───── hover overlay ───── */}
        <div className={styles.hoverOverlay}>


          <h5 className={styles.overlayTitle}>
            {/* Title now links to the external page */}
            {page_url ? (
              <a
                href={page_url}
                target="_blank"
                rel="noreferrer"
                className={styles.titleLink}
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h5>

          <div className={styles.overlayIcons}>
            {page_url && (
              <a
                href={page_url}
                target="_blank"
                rel="noreferrer"
                className={styles.iconLink}
                title="Website"
              >
                <LiaExternalLinkSquareAltSolid size={40} />
              </a>
            )}
            {docs_url && (
              <a
                href={docs_url}
                target="_blank"
                rel="noreferrer"
                className={styles.iconLink}
                title="Docs"
              >
                <FaBookmark  size={30} />
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
                <MdDriveFileMove size={40} />
              </a>
            )}
            {embed_url && (
              <a
                href={embed_url}
                target="_blank"
                rel="noreferrer"
                className={styles.iconLink}
                title="Embed Link"
              >
                <IoTvOutline size={30} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
