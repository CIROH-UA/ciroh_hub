import React from 'react';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';

export default function DocBreadcrumbsWrapper(props) {
  return (
    <div style={{display: "flex", alignItems: "flex-start", alignContent: "flex-start", justifyContent: "space-between"}}>
      <DocBreadcrumbs {...props} />
    </div>
  );
}
