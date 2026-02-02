import React, { useEffect, useMemo, useRef, useState } from 'react';
import recentPosts from '@site/.docusaurus/recent-posts.json';
import styles from './BlogFilter.module.css';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';

export default function BlogFilter() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loadingHidden, setLoadingHidden] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const cardsGridRef = useRef(null);

  const filters = useMemo(
    () => [
      { key: 'all', label: '✨ All' },
      { key: 'aws', label: '☁️ AWS' },
      { key: 'google', label: '🔷 Google Cloud' },
      { key: 'conference', label: '🎤 Conference' },
      { key: 'nextgen', label: '🚀 NextGen' },
    ],
    []
  );

  const tagToCategory = (tagLabel) => {
    const label = String(tagLabel || '').toLowerCase();
    if (label === 'aws') return 'aws';
    if (label === 'google cloud' || label === 'google') return 'google';
    if (label === 'conference') return 'conference';
    if (label === 'nextgen') return 'nextgen';
    return null;
  };

  const getPostCategory = (post) => {
    const tags = post?.metadata?.tags || [];
    for (const tag of tags) {
      const category = tagToCategory(tag?.label);
      if (category) return category;
    }
    return 'conference';
  };

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return recentPosts.filter((post) => {
      const category = getPostCategory(post);
      const matchesCategory = activeFilter === 'all' ? true : category === activeFilter;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const title = String(post?.metadata?.title || '').toLowerCase();
      const description = String(post?.metadata?.description || '').toLowerCase();
      return title.includes(normalizedQuery) || description.includes(normalizedQuery);
    });
  }, [activeFilter, query]);

  // Base URL hack to circumvent issues with React re-rendering
  const baseURL = useBaseUrl('/');
  const safeUseBaseUrl = (rawURL) => {
    if (rawURL.indexOf('http') == 0) return rawURL;
    else if (rawURL.indexOf("/") == 0) return baseURL + rawURL.substring(1);
    else return baseURL + rawURL;
  };

  useEffect(() => {
    const t = setTimeout(() => setLoadingHidden(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const onFilterClick = (next) => {
    if (next === activeFilter) return;
    setIsFiltering(true);
    setTimeout(() => {
      setActiveFilter(next);
      setIsFiltering(false);
    }, 250);
  };

  const onGridMouseMove = (e) => {
    const grid = cardsGridRef.current;
    if (!grid) return;
    const cardNodes = grid.querySelectorAll('[data-blog-card="true"]');
    cardNodes.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
    });
  };

  const categoryLabel = (category) => {
    switch (category) {
      case 'aws':
        return 'AWS';
      case 'google':
        return 'Google Cloud';
      case 'conference':
        return 'Conference';
      case 'nextgen':
        return 'NextGen';
      default:
        return 'Update';
    }
  };

  const fallbackImageDataUrl =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#19a7ce" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#117590" stop-opacity="0.15"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="600" fill="#060010"/>
        <rect x="0" y="0" width="1200" height="600" fill="url(#g)"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="44" font-family="Inter, Arial, sans-serif">CIROH Blog</text>
      </svg>`
    );

  return (
    <section className={styles.blogSection}>
      <div className={clsx(styles.loadingOverlay, loadingHidden && styles.loadingOverlayHidden)} aria-hidden="true">
        <div className={styles.loader} />
      </div>

      <div className={styles.bgAnimation} aria-hidden="true" />

      <div className={styles.particles} aria-hidden="true">
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      <div className={styles.main}>
        <header className={styles.hero}>
          <h2 className="tw-text-blue-800 dark:tw-text-white">
            Discover Our{' '}
            <span className="tw-text-blue-800 dark:tw-text-cyan-400">Impact & Insights</span>
          </h2>
          <p>
            To learn more about our projects and the impact we’re making, check out our blogs for in-depth insights,
            research updates, and community stories!
          </p>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={clsx(styles.filterBtn, activeFilter === f.key && styles.filterBtnActive)}
                onClick={() => onFilterClick(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <input
                className={styles.searchInput}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search blog articles"
              />
            </div>
          </div>
        </header>

        <div className={styles.cardsContainer}>
          <div ref={cardsGridRef} className={styles.cardsGrid} onMouseMove={onGridMouseMove}>
            {filteredPosts.map((post) => {
              const category = getPostCategory(post);
              const badge = categoryLabel(category);
              const imageSrc = post?.metadata?.frontMatter?.image
                ? safeUseBaseUrl(post.metadata.frontMatter.image)
                : fallbackImageDataUrl;

              return (
                <article
                  key={post.id}
                  data-blog-card="true"
                  data-category={category}
                  className={clsx(styles.card, isFiltering && styles.cardDisappear)}
                >
                  <div className={styles.glowEffect} aria-hidden="true" />
                  <span className={styles.cardBadge}>{badge}</span>

                  <div className={styles.cardImage}>
                    <img src={imageSrc} alt={post.metadata.title} loading="lazy" />
                  </div>

                  <Link to={post.metadata.permalink} className={styles.cardLink}>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{post.metadata.title}</h3>
                      <p className={styles.cardDescription}>{post.metadata.description}</p>

                      <div className={styles.cardMeta}>
                        <div className={styles.cardDate}>{new Date(post.metadata.date).toLocaleDateString()}</div>
                        <div className={styles.readMore}>Read more</div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
