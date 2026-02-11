import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import {
  HiOutlineClipboardList,
  HiOutlineLink,
  HiOutlineTag,
} from 'react-icons/hi';

export default function HydroShareCard() {
  const hydroshareUrl = 'https://www.hydroshare.org/oidc/authenticate/';
  const logo = useBaseUrl('/img/logos/HydroShareLogo.png');
  const resourcesUrl = useBaseUrl('/resources');

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <img src={logo} alt="HydroShare" className={styles.logo} />
        <div className={styles.titleRow}>  
          <h2 className={styles.title}>Contribute to HydroShare Resources</h2>
        </div>
        <p className={styles.subtitle}>
          Publish your apps, datasets, notebooks, courses, and presentations on HydroShare
        </p>
      </div>

        <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.icon}><HiOutlineClipboardList size={28} /></div>
          <h4>Quick Steps</h4>
          <p>Create a new resource, add a CIROH tag, and publish.</p>
          <ol className={styles.steps}>
            <li>Sign in to HydroShare.</li>
            <li>Create a new Resource.</li>
            <li>Add one of the Tags shown here.</li>
          </ol>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}><HiOutlineTag size={28} /></div>
          <h4>Use Tags</h4>
          <p>Choose the tag that matches your resource type.</p>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.tagApp}`} title="Products/Apps">ciroh_hub_app</span>
            <span className={`${styles.tag} ${styles.tagModule}`} title="Courses/Modules">ciroh_hub_module</span>
            <span className={`${styles.tag} ${styles.tagPresentation}`} title="Presentations">ciroh_hub_presentation</span>
            <span className={`${styles.tag} ${styles.tagData}`} title="Datasets">ciroh_hub_data</span>
            <span className={`${styles.tag} ${styles.tagNotebook}`} title="Notebooks">ciroh_hub_notebook</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.icon}><HiOutlineLink size={28} /></div>
          <h4>Optional metadata</h4>
          <p>Enhance your card with metadata.</p>
          <div className={styles.codeRow}>
            <code className={styles.code}>page_url</code>
            <code className={styles.code}>docs_url</code>
            <code className={styles.code}>thumbnail_url</code>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <a href={hydroshareUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
          Share on CIROH HydroShare
        </a>
      </div>
    </section>
  );
}
