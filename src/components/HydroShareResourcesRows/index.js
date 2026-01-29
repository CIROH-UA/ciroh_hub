import React, {useEffect, useCallback} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';

import styles from './styles.module.css';
import HydroShareResourceRow from './HydroShareResourceRow';

export default function HydroShareResourcesRows({resources, defaultImage}) {
  const location = useLocation();

  /** Scroll helper – safe even if element is not yet rendered */
  const scrollToHash = useCallback(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1)); // remove '#'
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, [location.hash]);

  /* Run once on mount + whenever hash or resources-list changes */
  useEffect(() => {
    scrollToHash();
  }, [scrollToHash, resources.length]);   // ← added dependency

  return (
    <div className={clsx('container', 'margin-bottom--lg')}>
      <div className={styles.rowContainer}>
        {resources.map(res => (
          <HydroShareResourceRow
            key={res.resource_id}
            resource={res}
            defaultImage={defaultImage}
          />
        ))}
      </div>
    </div>
  );
}
