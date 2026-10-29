import React from 'react';
import ResourceRow from './ResourceRow';
import styles from './styles.module.css';

/**
 * List wrapper: renders rows in a vertical stack.
 * Expects each resource object to have:
 *   id, title, description, authors, thumbnailUrl,
 *   pageUrl, docsUrl, resourceUrl, isPlaceholder (boolean)
 */
export default function ResourceList({ resources, defaultImage }) {
  return (
    <div className={styles.listContainer}>
      {resources.map(resource => (
        <ResourceRow
          key={resource.id}
            resource={resource}
            defaultImage={defaultImage}
        />
      ))}
    </div>
  );
}