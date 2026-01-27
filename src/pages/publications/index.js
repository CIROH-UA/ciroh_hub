import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from '@theme/Layout';
import Zotero from 'zotero-api-client';
import clsx from 'clsx';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineSortDescending,
  HiOutlineSortAscending,
} from 'react-icons/hi';
import PublicationCard from '@site/src/components/Publications/PublicationCard';
import SkeletonCard from '@site/src/components/Publications/SkeletonCard';
import styles from './Publications.module.css';

const PAGE_SIZE = 50;
const SCROLL_THRESHOLD = 200;
const DEBOUNCE_MS = 1000;

// Zotero group configuration
const GROUP_ID = '4961866';
const API_KEY = 'YOURKEY'; // Replace with actual key

export async function fetchTotal(groupId, apiKey, params, keyStr = '') {
  const path = keyStr ? `/collections/${keyStr}/items/top` : '/items/top';
  const url = new URL(`https://api.zotero.org/groups/${groupId}${path}`);
  Object.entries({ ...params, limit: 1 }).forEach(([k, v]) =>
    url.searchParams.append(k, v),
  );

  const resp = await fetch(url.href, { headers: { 'Zotero-API-Key': apiKey } });
  if (!resp.ok) return null;
  const hdr = resp.headers.get('Total-Results');
  return hdr ? Number(hdr) : null;
}

// Inner component that uses useColorMode (rendered inside Layout)
function PublicationsContent() {
  const { colorMode } = useColorMode();
  const zotero = useMemo(() => new Zotero(API_KEY).library('group', GROUP_ID), []);

  // State management
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetching = useRef(false);

  const [totalItems, setTotalItems] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterItemType, setFilterItemType] = useState('all');
  const [sortType, setSortType] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);
  let debounceTimer = null;

  // Refresh total count
  const refreshTotal = useCallback(async () => {
    const params = {
      sort: sortType,
      direction: sortDirection,
      ...(filterSearch ? { q: filterSearch } : {}),
      ...(filterItemType !== 'all' ? { itemType: filterItemType } : {}),
    };
    try {
      setTotalItems(await fetchTotal(GROUP_ID, API_KEY, params, ''));
    } catch (e) {
      console.error('Total-Results header error:', e);
      setTotalItems(null);
    }
  }, [filterSearch, filterItemType, sortType, sortDirection]);

  // Load publications
  const loadPublications = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;
      setLoading(true);
      setError(null);

      try {
        const params = {
          sort: sortType,
          direction: sortDirection,
          start: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          ...(filterSearch ? { q: filterSearch } : {}),
          ...(filterItemType !== 'all' ? { itemType: filterItemType } : {}),
        };

        const response = await zotero.items().top().get(params);
        const newItems = response.map((item) => ({
          key: item.key,
          title: item.title || 'Untitled',
          creators: item.creators || [],
          date: item.date || 'No date',
          url: item.url || item.DOI ? `https://doi.org/${item.DOI}` : null,
          itemType: item.itemType || 'document',
          publicationTitle: item.publicationTitle || '',
          DOI: item.DOI || '',
          abstractNote: item.abstractNote || '',
          tags: item.tags || [],
        }));

        setDisplayedItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
        setCurrentPage(page);
        setHasMore(newItems.length === PAGE_SIZE);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError(
          err.message || 'Failed to load publications. Please try again later.',
        );
      } finally {
        fetching.current = false;
        setLoading(false);
      }
    },
    [zotero, filterSearch, filterItemType, sortType, sortDirection],
  );

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setFilterSearch(value);
      setDisplayedItems([]);
      setCurrentPage(0);
      setHasMore(true);
    }, DEBOUNCE_MS);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'itemType') setFilterItemType(value);
    if (key === 'sort') setSortType(value);
    if (key === 'direction') setSortDirection(value);
    setDisplayedItems([]);
    setCurrentPage(0);
    setHasMore(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchInput('');
    setFilterSearch('');
    setFilterItemType('all');
    setSortType('date');
    setSortDirection('desc');
    setDisplayedItems([]);
    setCurrentPage(0);
    setHasMore(true);
  };

  // Load more on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !hasMore || loading || fetching.current) return;

    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadPublications(currentPage + 1);
    }
  }, [hasMore, loading, currentPage, loadPublications]);

  // Initial load
  useEffect(() => {
    loadPublications(0);
    refreshTotal();
  }, [filterSearch, filterItemType, sortType, sortDirection]);

  // Scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Load initial items
  useEffect(() => {
    if (displayedItems.length === 0 && !loading) {
      loadPublications(0);
    }
  }, []);

  const isFiltered = filterSearch || filterItemType !== 'all';

  return (
    <main className={clsx(styles.wrapper, 'tw-bg-white dark:tw-bg-slate-900')}>
      {/* Hero Banner */}
      <div className={clsx(styles.heroBanner, 'tw-bg-gradient-to-r tw-from-cyan-500 tw-to-blue-500')}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>CIROH Research Publications</h1>
          <p className={styles.heroSubtitle}>
            Discover peer-reviewed research, reports, and scientific contributions from CIROH
            and its collaborators
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className={clsx(styles.container, 'tw-px-4')}>
        {/* Search & Filter Section */}
        <div className={clsx(styles.searchFilterSection, colorMode === 'dark' && styles.darkMode)}>
          {/* Search Bar */}
          <div className={styles.searchBar}>
            <HiOutlineSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search publications by title, authors, or keywords..."
              value={searchInput}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Search publications"
            />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setFilterSearch('');
                    setDisplayedItems([]);
                  }}
                  className={styles.clearBtn}
                  aria-label="Clear search"
                >
                  <HiOutlineX />
                </button>
              )}
            </div>

            {/* Filter Toggle & Quick Stats */}
            <div className={styles.headerRow}>
              <button
                className={clsx(styles.filterToggle, showFilters && styles.active)}
                onClick={() => setShowFilters(!showFilters)}
              >
                <HiOutlineFilter size={18} />
                Filters
              </button>
              {totalItems !== null && (
                <div className={styles.resultCount}>
                  {totalItems} publication{totalItems !== 1 ? 's' : ''} found
                </div>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className={clsx(styles.filtersPanel, styles.slideIn)}>
                <div className={styles.filterRow}>
                  <div className={styles.filterGroup}>
                    <label htmlFor="itemType">Publication Type</label>
                    <select
                      id="itemType"
                      value={filterItemType}
                      onChange={(e) => handleFilterChange('itemType', e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="all">All Types</option>
                      <option value="journalArticle">Journal Article</option>
                      <option value="conferencePaper">Conference Paper</option>
                      <option value="report">Report</option>
                      <option value="book">Book</option>
                      <option value="thesis">Thesis</option>
                      <option value="dataset">Dataset</option>
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label htmlFor="sortType">Sort By</label>
                    <select
                      id="sortType"
                      value={sortType}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="date">Date</option>
                      <option value="title">Title</option>
                      <option value="creator">Author</option>
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label htmlFor="sortDirection">Order</label>
                    <button
                      id="sortDirection"
                      className={styles.sortButton}
                      onClick={() => handleFilterChange('direction', sortDirection === 'desc' ? 'asc' : 'desc')}
                    >
                      {sortDirection === 'desc' ? (
                        <HiOutlineSortDescending size={20} />
                      ) : (
                        <HiOutlineSortAscending size={20} />
                      )}
                      {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
                    </button>
                  </div>

                  {isFiltered && (
                    <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Publications Grid */}
          <div className={styles.publicationsGrid} ref={containerRef}>
            {error && (
              <div className={styles.errorContainer}>
                <p className={styles.error}>{error}</p>
              </div>
            )}

            {displayedItems.length === 0 && !loading && !error && (
              <div className={styles.emptyState}>
                <p>No publications found. Try adjusting your search or filters.</p>
              </div>
            )}

            {displayedItems.map((publication, index) => (
              <PublicationCard key={publication.key} publication={publication} index={index} />
            ))}

            {loading && (
              <>
                {[...Array(PAGE_SIZE / 10)].map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </>
            )}
          </div>

          {/* End of results message */}
          {displayedItems.length > 0 && !hasMore && !loading && (
            <div className={styles.endMessage}>
              <p>You've reached the end of publications. 🎉</p>
            </div>
          )}
        </div>
      </main>
    );
  }

export default function PublicationsPage() {
  return (
    <Layout title="Publications" description="CIROH Research Publications">
      <BrowserOnly>
        {() => <PublicationsContent />}
      </BrowserOnly>
    </Layout>
  );
}
