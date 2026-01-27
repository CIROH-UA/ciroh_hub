import React from 'react';
import clsx from 'clsx';
import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={clsx(styles.skeletonCard, styles.shimmer)}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBadge}></div>
        <div className={styles.skeletonIcon}></div>
      </div>

      <div className={styles.skeletonTitle}></div>

      <div className={styles.skeletonAuthors}></div>

      <div className={styles.skeletonMeta}>
        <div className={styles.skeletonMetaItem}></div>
        <div className={styles.skeletonMetaItem}></div>
      </div>

      <div className={styles.skeletonAbstract}>
        <div></div>
        <div></div>
      </div>

      <div className={styles.skeletonTags}>
        <div className={styles.skeletonTag}></div>
        <div className={styles.skeletonTag}></div>
        <div className={styles.skeletonTag}></div>
      </div>

      <div className={styles.skeletonButton}></div>
    </div>
  );
}
