import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function ContributeCallout() {
  const contributeUrl = useBaseUrl('/contribute#resources-documentation');
  
  return (
    <div className={styles.container}>
      <div className={styles.callout}>
        <h2 className={styles.title}>
          Share Your Resource with the Community
        </h2>
        <p className={styles.description}>
          Have a hydrologic tool, model, or software you'd like to share? Add your product to this collection 
          and help the community discover your work.
        </p>
        <a href={contributeUrl} className={styles.button}>
          Learn How to Contribute →
        </a>
      </div>
    </div>
  );
}