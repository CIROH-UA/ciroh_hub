import React, { useState } from 'react';
import recentPosts from '@site/.docusaurus/recent-posts.json';
import styles from './CommunityImpact/CommunityImpact.module.css';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function BlogFilter() {
  const [activeTag, setActiveTag] = useState('*');
  
  // Extract unique tags from your posts
  const tags = ['AWS', 'Google Cloud', 'Conference', 'NextGen'];

  // Filter posts based on the selected tag
  const filteredPosts = activeTag === '*'
    ? recentPosts 
    : recentPosts.filter(post => 
        post.metadata.tags?.some(tag => tag.label.toLowerCase() === activeTag.toLowerCase())
      );

  // Base URL hack to circumvent issues with React re-rendering
  const baseURL = useBaseUrl('/');
  const safeUseBaseUrl = (rawURL) => {
    if (rawURL.indexOf('http') == 0) return rawURL;
    else if (rawURL.indexOf("/") == 0) return baseURL + rawURL.substring(1);
    else return baseURL + rawURL;
  };

  return (
    <div>
      <div className={`margin-bottom--lg ${styles.center}`}>
        <button
          className={`button button--secondary ${styles.btn} ${activeTag === '*' ? 'button--active' : ''}`}
          onClick={() => setActiveTag('*')}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`button button--secondary margin-left--sm ${styles.btn} ${
              activeTag.toLowerCase() === tag.toLowerCase() ? 'button--active' : ''
            }`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <ul style={{ 
        listStyleType: 'none', 
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {filteredPosts.map((post) => (
          <li key={post.id} className={clsx(styles.postCard, 'card')}>
            <div className={styles.postImage}>
              {post.metadata.frontMatter.image ? (
                <img
                    src={safeUseBaseUrl(post.metadata.frontMatter.image)}
                    alt={post.metadata.title}
                  />
              ) : (
                post.metadata.title.toLowerCase().includes('monthly news update') && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid #dee2e6',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '1rem',
                      color: '#007bff'
                    }}>
                      📰
                    </div>
                    <h3 style={{
                      margin: '0',
                      color: '#495057',
                      fontSize: '1.25rem'
                    }}>
                      Monthly News Update
                    </h3>
                    <small style={{
                      color: '#6c757d',
                      marginTop: '0.5rem'
                    }}>
                      {new Date(post.metadata.date).toLocaleDateString('en-US', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </small>
                  </div>
                )
              )}
            </div>
            <a href={post.metadata.permalink} className={styles.postLink}>
              <h3 style={{ margin: '0' , textAlign: 'center'}}>{post.metadata.title}</h3>
              <p style={{ margin: '0.5rem 0', textAlign: 'center' }}>{post.metadata.description}</p>
              <small style={{ color: '#6c757d', display:'block',textAlign: 'center' }}>
                Published on {new Date(post.metadata.date).toLocaleDateString()}
              </small>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
