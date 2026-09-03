import React, { useEffect, useState } from 'react';
import GitHubMarkdown from './GitHubMarkdown'
import MarkdownHooks from 'react-markdown'

// Unfortunately, the GitHub API doesn't support wiki pages.
// As such, this has to use a unique client-side rendering codepath.
// If the API ever adds this support, a simplified function is
// provided at the bottom of this file.
// - Nia Minor, 06/26/2026

function GitHubWikiPage({ repo, username, path = 'home' }) {
    const rawUrl = `https://raw.githubusercontent.com/wiki/${username}/${repo}/${path}.md`;
    const prettyUrl = `https://github.com/${username}/${repo}/wiki/${path}`;
    const [mdContent, setMdContent] = useState("");

    useEffect(() => {
        fetch(rawUrl, {
            headers: {
                Accept: 'application/vnd.github.v3.html',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch wiki page');
                }
                return response.text();
            })
            .then(md => {
                setMdContent(md);
            })
            .catch(err => console.error('Error fetching markdown:', err));
    }, [rawUrl]);

    return <>
        <blockquote style={{padding: "20px", fontSize: "1.1rem"}}>
            <strong>NOTE</strong><br />
            Below content is rendered from <a href={prettyUrl}>{prettyUrl}</a>.
        </blockquote>
        <MarkdownHooks>{mdContent}</MarkdownHooks>    
    </>;
}

/*
// Simplified function for if the GitHub API adds support for wiki pages.
// This is preferred because it offloads MD rendering to GitHub's service.
function GitHubWikiPage({ repo, username, path = 'home', trimTitle = 'false' }) {
    // Construct the GitHub API URL to fetch the wiki page as HTML
    const apiUrl = `api-url-here`;
    const srcUrl = `https://github.com/${username}/${repo}/wiki/${path}`;
    const cwdUrl = `https://github.com/${username}/${repo}/`; // This appears to be the documented behavior for image referencing (?)

    // Render the HTML content
    //return <GitHubMarkdown apiUrl={apiUrl} srcUrl={srcUrl} cwdUrl={cwdUrl} trimTitle={trimTitle} />;
    return "Unsupported pending a GitHub API update. See https://github.com/orgs/community/discussions/102891#discussioncomment-8340473";
}
*/

export default GitHubWikiPage;
