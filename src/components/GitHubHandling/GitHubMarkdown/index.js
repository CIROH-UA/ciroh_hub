import React, { useEffect, useState } from 'react';

function GitHubMarkdown({ apiUrl, srcUrl, cwdUrl, trimTitle = 'false' }) {
    const [markdownContent, setMarkdownContent] = useState('');

    const applyHtmlTransformations = (html) => {
        const parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        // Transformations
        doc = unshellReadme(doc);
        doc = convertRelativePaths(doc);
        if (trimTitle === 'true') doc = trimFirstLine(doc); // Yes, this feels silly, but having it line up semantically with the JSX matters

        return doc.body.innerHTML;
    };

    // Converts GitHub paths to DocuHub paths, where appropriate.
    // References that jump to other parts of the page are
    // non-functional in DocuHub, so they are discarded.
    const convertRelativePaths = (doc) => {
        // Convert image sources
        doc.querySelectorAll('img[src]').forEach(img => {
            const src = img.getAttribute('src');
            if (!src.startsWith('http')) {
                const relativePath = src.replace(/^\//, '');
                img.src = `${cwdUrl}${relativePath}`;
            }
        });

        // Convert anchor href attributes
        doc.querySelectorAll('a[href]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                const relativePath = href.replace(/^\//, '');
                anchor.href = `${cwdUrl}${relativePath}`;
            }
            else if (href && href.startsWith('#')) {
                var span = doc.createElement("span");
                span.innerHTML = anchor.innerHTML;
                anchor.replaceWith(span);
            }
        });

        return doc;
    }

    // Removes much of the cruft from a GitHub README.
    const unshellReadme = (doc) => {
        const content = doc.querySelector("article").childNodes;
        var newContent = [];

        for (var i = 0; i < content.length; i++) {
            const node = content[i];
            if (node.className === "markdown-heading") {
                // The second element is a relative link that
                // does not work within our renderer,
                // so we simply discard it.
                newContent.push(node.childNodes[0]);
            }
            else newContent.push(node);
        }
        
        doc.body.innerHTML='';
        doc.body.replaceChildren(...newContent);
        return doc;
    }

    // Trims the first element of the HTML body.
    const trimFirstLine = (doc) => {
        if (doc.body.firstElementChild.tagName === "H1") {
            doc.body.removeChild(doc.body.firstElementChild);
        }
        return doc;
    }

    useEffect(() => {
        fetch(apiUrl, {
            headers: {
                Accept: 'application/vnd.github.v3.html',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch markdown');
                }
                return response.text();
            })
            .then(html => {
                // Apply transformations to html
                var processedHtml = applyHtmlTransformations(html);

                // Define the note markdown as a string
                const noteHtml = `
                <blockquote style='padding:20px;font-size:1.1rem;'>
                    <strong>NOTE</strong><br>
                    Below content is rendered from <a href='${srcUrl}'>${srcUrl}</a>.
                </blockquote>
                `;

                // Prepend the note markdown to the processed README content
                const combinedHtml = noteHtml + processedHtml;

                // Update the state with the combined content
                setMarkdownContent(combinedHtml);
            })
            .catch(err => console.error('Error fetching markdown:', err));
    }, [apiUrl, srcUrl, cwdUrl, trimTitle]);

    // Render the HTML content
    return <div dangerouslySetInnerHTML={{ __html: markdownContent }} />;
}

export default GitHubMarkdown;