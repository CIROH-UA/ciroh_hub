import React from 'react';
import styles from './PublicationCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonItemType} />
        <div className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonAuthors} />
        <div className={styles.skeletonDate} />
      </div>
      <div className={styles.skeletonFooter} />
    </div>
  );
}