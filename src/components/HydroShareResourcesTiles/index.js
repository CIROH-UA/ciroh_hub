import React, { useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';

import styles from './styles.module.css';
import HydroShareResourceCard from './HydroShareResourceCard';

/**
 * Grid wrapper for HydroShareResourceCard.
 *  • Whenever the URL hash changes OR when cards finish rendering,
 *    scroll smoothly to the corresponding element.
 */
export default function HydroShareResourcesTiles({ resources, defaultImage }) {
  const location = useLocation();

  const scrollToHash = useCallback(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  /* run after mount, after hash change, after card list changes */
  useEffect(() => {
    scrollToHash();
  }, [scrollToHash, resources.length]);

  return (
    <div className={clsx('container', 'margin-bottom--lg')}>
      <div className={styles.gridContainer}>
        {resources.map(res => (
          <HydroShareResourceCard
            key={res.resource_id}
            resource={res}
            defaultImage={defaultImage}
          />
        ))}
      </div>
    </div>
  );
}
