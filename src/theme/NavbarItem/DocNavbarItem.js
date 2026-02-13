// Ejected from Docusaurus 3.9.2 via Swizzle.
// Unsafely swizzled, so expect to update this whenever 4.0 releases.
// 02/13/2026: Edited to allow less aggressive highlighting of dropdown entries. ("navbarHighlightSubpages" field)

import React, {memo} from 'react'; // `memo` import added 02/13/2026
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // Import added 02/13/2026
import {
  useActiveDocContext,
  useLayoutDoc,
} from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';

// Function added 02/13/2026
function getReduceSubpageHighlights() {
  const {siteConfig} = useDocusaurusContext();
  if (typeof siteConfig.customFields == 'object') {
    let customFields = siteConfig.customFields;
    if (Array.isArray(customFields.navbarReduceSubpageHighlights)) {
      return customFields.navbarReduceSubpageHighlights;
    }
  }
  return [];
}

export default function DocNavbarItem({
  docId,
  label: staticLabel,
  docsPluginId,
  ...props
}) {
  const {activeDoc} = useActiveDocContext(docsPluginId);
  const reduceSubpageHighlightsList = getReduceSubpageHighlights();
  const doc = useLayoutDoc(docId, docsPluginId);
  const pageActive = activeDoc?.path === doc?.path;
  // Draft and unlisted items are not displayed in the navbar.
  if (doc === null || (doc.unlisted && !pageActive)) {
    return null;
  }
  return (
    <DefaultNavbarItem
      exact
      {...props}
      isActive={() => 
        pageActive ||
        (!!activeDoc?.sidebar && activeDoc.sidebar === doc.sidebar && !(reduceSubpageHighlightsList.includes(doc.sidebar)))
        // Last condition of above added 02/13/2026
      }
      label={staticLabel ?? doc.id}
      to={doc.path}
    />
  );
}
