import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import clsx from 'clsx';
import {
  HiOutlineClipboardList,
  HiOutlineLink,
  HiOutlineTag,
} from 'react-icons/hi';
import HydroShareResourceForm from '@site/src/components/HydroShareResourceForm';

export default function HydroShareCard() {
  const hydroshareUrl = 'https://www.hydroshare.org/oidc/authenticate/';
  const logo = useBaseUrl('/img/logos/HydroShareLogo.png');

  const { siteConfig } = useDocusaurusContext();
  const featuredAppsCollectionId = siteConfig.customFields.hs_featured_apps_collection_id || '';
  const featuredDatasetsCollectionId = siteConfig.customFields.hs_featured_datasets_collection_id || '';
  const featuredCoursesCollectionId = siteConfig.customFields.hs_featured_courses_collection_id || '';
  const featuredPresentationsCollectionId = siteConfig.customFields.hs_featured_presentations_collection_id || '';
  const featuredNotebooksCollectionId = siteConfig.customFields.hs_featured_notebooks_collection_id || '';

  return (
    <section className={styles.section}>
      {/* Title */}
      <div className={styles.header}>
        <img src={logo} alt="HydroShare" className={styles.logo} />
        <div className={styles.titleRow}>  
          <h2 className={styles.title}>Contribute to CIROH HydroShare Resources</h2>
        </div>
        <p className={styles.subtitle}>
          Publish your apps, datasets, notebooks, courses, and presentations on HydroShare to make them discoverable on CIROH Hub
        </p>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {/* Quick Steps Card */}
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

        {/* Use Tags Card */}
        <div className={styles.card}>
          <div className={styles.icon}><HiOutlineTag size={28} /></div>
          <h4>Use Tags</h4>
          <p>Choose the tag that matches your resource type.</p>
          <div className={clsx(styles.tags, "margin-bottom--sm")}>
            <span className={`${styles.tag} ${styles.tagApp}`} title="Products/Apps">ciroh_hub_app</span>
            <span className={`${styles.tag} ${styles.tagModule}`} title="Courses/Modules">ciroh_hub_module</span>
            <span className={`${styles.tag} ${styles.tagPresentation}`} title="Presentations">ciroh_hub_presentation</span>
            <span className={`${styles.tag} ${styles.tagData}`} title="Datasets">ciroh_hub_data</span>
            <span className={`${styles.tag} ${styles.tagNotebook}`} title="Notebooks">ciroh_hub_notebook</span>
          </div>
          <details>
              <summary>About deprecated tags...</summary>
              <p>The following tags are deprecated. Their content will still appear on CIROH Hub, but using them for new resources is discouraged.</p>
              <div className={styles.tags}>
                <span className={`${styles.tag} ${styles.tagDeprecated}`} title="Products/Apps (Deprecated)">nwm_portal_app</span>
                <span className={`${styles.tag} ${styles.tagDeprecated}`} title="Courses/Modules (Deprecated)">nwm_portal_module</span>
                <span className={`${styles.tag} ${styles.tagDeprecated}`} title="Presentations (Deprecated)">ciroh_portal_presentation</span>
                <span className={`${styles.tag} ${styles.tagDeprecated}`} title="Datasets (Deprecated)">ciroh_portal_data</span>
              </div>
            </details>
        </div>

        {/* Optional Metadata Card */}
        <div className={styles.card}>
          <div className={styles.icon}><HiOutlineLink size={28} /></div>
          <h4>Optional metadata</h4>
          <p>Enhance your card with metadata.</p>
          <div className={styles.codeRow}>
            <div><code className={styles.code}>page_url</code></div>
            <p>A URL for your resource's website.</p>
            <div><code className={styles.code}>docs_url</code></div>
            <p>A URL for your resource's documentation.</p>
            <div><code className={styles.code}>thumbnail_url</code></div>
            <p>A URL for a thumbnail image.</p>
            <div><code className={styles.code}>pres_path</code></div>
            <p>File path to a PDF within your resource.</p>
          </div>
        </div>
      </div>

      {/* Share on HydroShare Button */}
      <div className={styles.actions}>
        <a href={hydroshareUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
          Share on CIROH HydroShare
        </a>
      </div>

      {/* Create a HydroShare Resource Section*/}
      <div className={clsx(styles.header, styles.formSection)}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleRow}>  
              <h2 className={styles.title}>Create a CIROH HydroShare Resource</h2>
            </div>
            <p className={styles.subtitle}>
              Use the form below to create a new CIROH HydroShare resource.
            </p>
          </div>
          <HydroShareResourceForm />
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.subtitle}>
          Featured resources are drawn from <a href="https://help.hydroshare.org/hydroshare-resources/collections/">HydroShare Resource Collections</a>.
          To feature a resource, add it to one of the following collections:
          {' '}<a href={`https://www.hydroshare.org/resource/${featuredAppsCollectionId}`}>Apps</a>,
          {' '}<a href={`https://www.hydroshare.org/resource/${featuredDatasetsCollectionId}`}>Datasets</a>,
          {' '}<a href={`https://www.hydroshare.org/resource/${featuredCoursesCollectionId}`}>Courses</a>,
          {' '}<a href={`https://www.hydroshare.org/resource/${featuredPresentationsCollectionId}`}>Presentations</a>,
          {' '}or <a href={`https://www.hydroshare.org/resource/${featuredNotebooksCollectionId}`}>Notebooks</a>.
        </p>
      </div>
    </section>
  );
}
