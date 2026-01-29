import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function HydroShareCard() {
  const hydroshareUrl = 'https://www.hydroshare.org/oidc/authenticate/';
  const logo = useBaseUrl('/img/logos/HydroShareLogo.png');

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <img src={logo} alt="HydroShare" className={styles.logo} />
        <h3 className={styles.title}>Contribute to HydroShare resources, presentations, datasets, and courses</h3>
      </div>

            <p className={styles.body}>
        Publish your apps, datasets, courses, and presentations on HydroShare — they'll automatically appear under <strong>Community Resources</strong> in the top navigation menu.
      </p>

      <div className={styles.grid}>
        <div>
          <div className={styles.label}>Use these subject tags</div>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.tagApp}`} title="Products/Apps">ciroh_hub_app</span>
            <span className={`${styles.tag} ${styles.tagModule}`} title="Courses/Modules">ciroh_hub_module</span>
            <span className={`${styles.tag} ${styles.tagPresentation}`} title="Presentations">ciroh_hub_presentation</span>
            <span className={`${styles.tag} ${styles.tagData}`} title="Datasets">ciroh_hub_data</span>
          </div>
          <div className={styles.tip}>Choose the tag that matches your resource type.</div>
        </div>
        <div>
          <div className={styles.label}>Steps</div>
          <ol className={styles.steps}>
            <li>Sign in to HydroShare and create a new Resource.</li>
            <li>Add one of the subject tags shown at left.</li>
            <li>
              Optional: add custom metadata
              <code className={styles.code}> page_url</code>,
              <code className={styles.code}> docs_url</code>, and
              <code className={styles.code}> thumbnail_url</code>.
            </li>
            <li>Make your resource discoverable under Community Resources.</li>
          </ol>
        </div>
      </div>

      <div>
        <a href={hydroshareUrl} target="_blank" rel="noopener noreferrer" className={styles.cta}>
          Share on CIROH HydroShare →
        </a>
      </div>
    </section>
  );
}
