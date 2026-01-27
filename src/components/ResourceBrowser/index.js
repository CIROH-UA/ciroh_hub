import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { HiOutlineSortDescending, HiOutlineSortAscending } from 'react-icons/hi';
import ResourceList from './ResourceList';
import styles from './styles.module.css';

// Use wrapper API (re-exports HydroShareImporter functions)
import { fetchResourcesBySearch, fetchResourceCustomMetadata } from '../../api/hydroshareAPI';

const PAGE_SIZE = 40;            // HydroShare discoverapi per-page (default)
const SCROLL_THRESHOLD = 800;    // px from bottom before we load more (default)
const DEBOUNCE_MS = 1000;        // search debounce delay
const PLACEHOLDER_COUNT = 10;    // initial skeleton rows

export default function ResourceBrowser({
  keyword = 'nwm_portal_app',
  resourceLabel = 'Resources',
  defaultImage,
  pageSize = PAGE_SIZE,
  scrollThreshold = SCROLL_THRESHOLD,
}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchingRef = useRef(false);
  const debounceRef = useRef(null);

  const createPlaceholders = useCallback((count = PLACEHOLDER_COUNT, page = 1) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `placeholder-${page}-${i}`,
      title: '',
      description: '',
      authors: '',
      thumbnailUrl: '',
      isPlaceholder: true,
    }));
  }, []);

  const normalize = useCallback((res) => ({
    id: res.resource_id,
    title: res.resource_title || 'Untitled',
    description: res.abstract || '',
    authors: Array.isArray(res.authors) ? res.authors.join(' • ') : (res.authors || ''),
    thumbnailUrl: '', // will be populated by custom metadata
    pageUrl: '',
    docsUrl: '',
    resourceUrl: res.resource_url,
  }), []);

  const fetchPage = useCallback(async (page, replace = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (page === 1 && replace) {
        setResources(createPlaceholders());
        setLoading(true);
      } else if (page > 1) {
        setResources((prev) => [...prev, ...createPlaceholders(pageSize, page)]);
      }

      const ascending = sortDirection === 'asc';
      
      // Use fetchResourcesBySearch for keyword-specific filtering
      const response = await fetchResourcesBySearch(
        keyword,
        activeSearch,
        ascending,
        sortBy,
        undefined, // author filter
        page
      );

      // Extract resources from response
      const raw = response || [];
      const normalized = raw.map(normalize);

      if (page === 1 && replace) {
        setResources(normalized);
      } else {
        setResources((prev) => [...prev.filter((r) => !r.isPlaceholder), ...normalized]);
      }

      setHasMore(raw.length === pageSize);
      setLoading(false);

      // Lazy metadata enrichment
      for (const item of normalized) {
        try {
          const meta = await fetchResourceCustomMetadata(item.id);
          setResources((curr) => curr.map((r) => r.id === item.id ? {
            ...r,
            thumbnailUrl: meta?.thumbnail_url || r.thumbnailUrl,
            pageUrl: meta?.page_url || r.pageUrl,
            docsUrl: meta?.docs_url || r.docsUrl,
          } : r));
        } catch (err) {
          // Non-fatal enrichment failure; log for diagnostics.
          console.warn('Metadata fetch failed for resource', item.id, err);
        }
      }
    } catch (e) {
      setError(e.message || 'Unknown error');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [keyword, activeSearch, sortBy, sortDirection, createPlaceholders, normalize, pageSize]);

  // Reset + fetch whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchingRef.current = false;
    fetchPage(1, true);
  }, [keyword, activeSearch, sortBy, sortDirection, fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (fetchingRef.current || !hasMore || loading) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchPage(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, loading, fetchPage, scrollThreshold]);

  // Debounced search
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveSearch(val.trim());
    }, DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceRef.current);
      setActiveSearch(searchInput.trim());
    }
  };

  const toggleSort = () => setSortDirection((d) => d === 'asc' ? 'desc' : 'asc');

  const visible = resources.filter((r) => !r.isPlaceholder);

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={clsx('container', styles.errorBox)}>⚠️ Error loading {resourceLabel.toLowerCase()}: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className="container">
        <div className={styles.counter}>
          Showing <strong>{visible.length}</strong> {resourceLabel}
          {hasMore && ' (loading more…)'}
        </div>

        <form className={styles.filterForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Search title, author, description…"
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="modified">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>

          <button
            type="button"
            className={clsx(styles.button, styles.buttonPrimary)}
            aria-label={`Sort direction ${sortDirection}`}
            onClick={toggleSort}
            title={`Toggle sort (${sortDirection})`}
          >
            {sortDirection === 'asc' ? (
              <HiOutlineSortAscending size={22} />
            ) : (
              <HiOutlineSortDescending size={22} />
            )}
          </button>
        </form>

        <ResourceList resources={resources} defaultImage={defaultImage} />

        {!loading && visible.length === 0 && (
          <div className={styles.empty}>No {resourceLabel.toLowerCase()} found</div>
        )}
      </div>
    </div>
  );
}

ResourceBrowser.propTypes = {
  keyword: PropTypes.string,
  resourceLabel: PropTypes.string,
  defaultImage: PropTypes.string,
};

