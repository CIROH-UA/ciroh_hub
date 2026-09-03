import React, { useEffect, useState } from 'react';
import GitHubMarkdown from './GitHubMarkdown'

function GitHubReadme({ repo, username, subfolder = '', readmeFileName = '', trimTitle = 'false' }) {
    // Construct the GitHub API URL to fetch the README as HTML
    let slug = '';
    if (subfolder !== '') {
        if (readmeFileName !== '') 
            slug = `${subfolder}/${readmeFileName}`;
        else
            slug = `${subfolder}/README.md`;
    } 
    else {
        if (readmeFileName !== '') 
            slug = `${readmeFileName}`;
        else
            slug = `README.md`;
    }

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${slug}?ref=main`;
    const srcUrl = `https://github.com/${username}/${repo}/blob/main/${slug}`;
    const cwdUrl = `https://github.com/${username}/${repo}/raw/main/${subfolder ? subfolder + '/' : ''}`;

    // Render the HTML content
    return <GitHubMarkdown apiUrl={apiUrl} srcUrl={srcUrl} cwdUrl={cwdUrl} trimTitle={trimTitle} />;
}

export default GitHubReadme;

React.Fragment;