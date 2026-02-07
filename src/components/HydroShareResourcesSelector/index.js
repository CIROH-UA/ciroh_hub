import React, { useEffect, useState, startTransition, useRef, useCallback, useMemo } from "react";
import clsx from "clsx";
import { FaThLarge, FaBars } from "react-icons/fa";
import styles from "./styles.module.css";
import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
import HydroShareResourcesCards from "@site/src/components/HydroShareResourcesCards";
import { fetchResourcesBySearch, fetchResourceCustomMetadata, getCommunityResources } from "@site/src/components/HydroShareImporter";
import { useColorMode } from "@docusaurus/theme-common"; // Hook to detect theme
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
  HiOutlineSearch,
} from 'react-icons/hi';

const PAGE_SIZE        = 40;
const SCROLL_THRESHOLD = 800;
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

export default function HydroShareResourcesSelector({
  keyword = "nwm_portal_app,ciroh_hub_app",
  defaultImage,
  variant = 'legacy',
  onResultsChange,
}) {
  const { colorMode } = useColorMode(); // Get the current theme
  const PLACEHOLDER_ITEMS = 10;

  // Initialize with placeholder objects so that the component renders immediately.
  const initialPlaceholders = Array.from({ length: PLACEHOLDER_ITEMS }).map((_, index) => ({
    resource_id: `placeholder-${index}`,
    title: "",
    authors: "",
    resource_type: "",
    resource_url: "",
    description: "",
    thumbnail_url: "",
    page_url: "",
    docs_url: "",
  }));

  const hs_icon = colorMode === 'dark' ? DatasetDarkIcon : DatasetLightIcon;
  
  // State
  const [resources, setResources] = useState(initialPlaceholders);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("row");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetching = useRef(false);

  // Search State
  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [sortType,       setSortType]       = useState('modified');
  const [sortDirection,  setSortDirection]  = useState('desc');



  const fetchResources = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        let resourceList = undefined;
        
        // Add placeholders for loading state (only for pagination, not first page)
        if (page > 1) {
          setResources(prev => [
            ...prev,
            ...Array.from({ length: PAGE_SIZE }, (_, i) => ({
              resource_id: `placeholder-page${page}-${i}`,
              title: "",
              authors: "",
              resource_type: "",
              resource_url: "",
              description: "",
              thumbnail_url: "",
              page_url: "",
              docs_url: "",
            }))
          ]);
        }

        // Start data fetching (while placeholders are already rendered)
        const ascending = sortDirection === 'asc' ? true : false;
        
        // For datasets, use getCommunityResources which combines group and keyword resources
        let communityResponse = null;
        if (keyword.includes('data')) {
          const firstKeyword = keyword.split(',')[0].trim();
          communityResponse = await getCommunityResources(firstKeyword, "4", filterSearch, ascending, sortType, undefined, page, PAGE_SIZE);
          resourceList = communityResponse.resources || [];
        } else {
          resourceList = await fetchResourcesBySearch(keyword, filterSearch, ascending, sortType, undefined, page);
        }

        const mappedList = resourceList.map((res) => ({
          resource_id: res.resource_id,
          title: res.resource_title,
          authors: res.authors.map(
            (author) => author.split(',').reverse().join(' ')
          ).join(' 🖊️ '),
          resource_type: res.resource_type,
          resource_url: res.resource_url,
          description: res.abstract || "No description available.",
          date_created: res.date_created,
          date_last_updated: res.date_last_updated,
          thumbnail_url: "",
          page_url: "",
          docs_url: "",
          embed_url: "",
        }));

        // Handle first page vs pagination
        if (page === 1) {
          setResources(mappedList); // Replace for first page
        } else {
          setResources(prev => [
            ...prev.filter(r => !r.resource_id.startsWith('placeholder-')),
            ...mappedList
          ]);
        }
        
        // Update hasMore based on API response
        if (communityResponse) {
          // For datasets using getCommunityResources
          setHasMore(communityResponse.groupResourcesPageData?.hasMorePages || communityResponse.extraResourcesPageData?.hasMorePages || false);
        } else {
          // For other resources using fetchResourcesBySearch
          setHasMore(mappedList.length === PAGE_SIZE);
        }
        setLoading(false);

        // Fetch metadata for each resource and update them individually
        for (let res of mappedList) {
          try {
            const customMetadata = await fetchResourceCustomMetadata(res.resource_id);
            const updatedResource = {
              ...res,
              thumbnail_url: customMetadata?.thumbnail_url || hs_icon,
              page_url: customMetadata?.page_url || "",
              docs_url: customMetadata?.docs_url || "",
            };

            setResources((current) =>
              current.map((item) =>
                item.resource_id === updatedResource.resource_id ? updatedResource : item
              )
            );
          } catch (metadataErr) {
            console.error(`Error fetching metadata: ${metadataErr.message}`);
          }
        }
      } catch (err) {
        console.error(`Error fetching resources: ${err.message}`);
        setError(err.message);
        setLoading(false);
      } finally {
        fetching.current = false;
      }
    },
    [keyword, filterSearch, sortDirection, sortType, hs_icon]
  );



  // Reset and load first page when filters change
  useEffect(() => {
    setResources(initialPlaceholders);
    setCurrentPage(1);
    setHasMore(true);
    
    // Reset the fetching flag to allow new requests (fixes race condition)
    fetching.current = false;
    
    fetchResources(1);
  }, [keyword, filterSearch, sortDirection, sortType, fetchResources]);

  const nonPlaceholderResources = useMemo(
    () => resources.filter(
      r => !String(r.resource_id || '').startsWith('placeholder-')
    ),
    [resources]
  );

  useEffect(() => {
    if (typeof onResultsChange !== 'function') return;
    onResultsChange(nonPlaceholderResources, {
      loading,
      hasMore,
      keyword,
      filterSearch,
      sortType,
      sortDirection,
      view,
    });
  }, [
    nonPlaceholderResources,
    loading,
    hasMore,
    keyword,
    filterSearch,
    sortType,
    sortDirection,
    view,
    onResultsChange,
  ]);

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      if (fetching.current || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchResources(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, fetchResources]);

  /* search helpers */
  const commitSearch = (q) => {
    clearTimeout(debounceTimer);
    setFilterSearch(String(q || '').trim());
  };

  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => commitSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  let resultLabel = 'Resources';

  if (keyword.includes('app')) resultLabel = 'Apps';
  else if (keyword.includes('module')) resultLabel = 'Courses';
  else if (keyword.includes('data')) resultLabel = 'Datasets';
  else if (keyword.includes('presentation')) resultLabel = 'Presentations';


  /* ---------------- render ---------------- */
  if (variant === 'modern') {
    return (
      <section className={clsx(styles.cardsContainer, 'tw-relative tw-z-20 tw-w-full tw-py-10')}>
        <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-center lg:tw-justify-between tw-gap-4 tw-mb-6">
            <div className="tw-text-sm sm:tw-text-base tw-text-slate-600 dark:tw-text-slate-300">
              {loading || fetching.current ? "Fetching " + resultLabel + "..." : (
                <>
                  Showing{' '}
                  <strong className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">
                    {nonPlaceholderResources.length}
                  </strong>{' '}
                  {resultLabel}
                </>
              )}
            </div>

            <form
              className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-gap-3 tw-w-full lg:tw-w-auto"
              onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }}
            >
              <div className="tw-relative tw-w-full md:tw-w-[28rem]">
                <span className="tw-pointer-events-none tw-absolute tw-left-3 tw-inset-y-0 tw-flex tw-items-center tw-text-slate-400 dark:tw-text-slate-500">
                  <HiOutlineSearch size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search by Title, Author, Description..."
                  className="tw-w-full tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-pl-10 tw-pr-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white placeholder:tw-text-slate-400 dark:placeholder:tw-text-slate-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitSearch(e.currentTarget.value);
                    }
                  }}
                  onBlur={(e) => commitSearch(e.currentTarget.value)}
                />
              </div>

              <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                <select
                  value={sortType}
                  onChange={e => setSortType(e.target.value)}
                  className="tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                >
                  <option value="modified">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title</option>
                  <option value="author">Authors</option>
                </select>

                <button
                  type="button"
                  aria-label={`Sort direction ${sortDirection}`}
                  className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-slate-700 dark:tw-text-slate-200 hover:tw-border-cyan-500/40 hover:tw-text-cyan-700 dark:hover:tw-text-cyan-300 tw-transition"
                  onClick={() =>
                    startTransition(() =>
                      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc')),
                    )
                  }
                >
                  {sortDirection === 'asc'
                    ? <HiOutlineSortAscending size={20} />
                    : <HiOutlineSortDescending size={20} />}
                </button>

                <div className="tw-flex tw-gap-2">
                  {/* <button
                    type="button"
                    className={clsx(
                      "tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-border tw-px-3 tw-py-3 tw-transition",
                      view === 'grid'
                        ? 'tw-border-cyan-500/40 tw-bg-cyan-500/10 tw-text-cyan-700 dark:tw-text-cyan-300'
                        : 'tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-text-slate-600 dark:tw-text-slate-300 hover:tw-border-cyan-500/40'
                    )}
                    onClick={() => setView('grid')}
                    title="Grid View"
                  >
                    <FaThLarge size={16} />
                  </button> */}
                  <button
                    type="button"
                    className={clsx(
                      "tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-border tw-px-3 tw-py-3 tw-transition",
                      view === 'row'
                        ? 'tw-border-cyan-500/40 tw-bg-cyan-500/10 tw-text-cyan-700 dark:tw-text-cyan-300'
                        : 'tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-text-slate-600 dark:tw-text-slate-300 hover:tw-border-cyan-500/40'
                    )}
                    onClick={() => setView('row')}
                    title="List View"
                  >
                    <FaBars size={16} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {view === 'grid' ? (
            <HydroShareResourcesTiles resources={resources} defaultImage={defaultImage} />
          ) : (
            <HydroShareResourcesCards resources={resources} defaultImage={defaultImage} />
          )}

          {!loading && nonPlaceholderResources.length === 0 && (
            <p className="tw-mt-10 tw-text-center tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">
              No {resultLabel} Found
            </p>
          )}
        </div>
      </section>
    );
  }

    /* legacy search helpers */
  const handleKeyUp   = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => commitSearch(searchInput), DEBOUNCE_MS);
  };
  const handleKeyPress = () => clearTimeout(debounceTimer);
  const handleKeyDown  = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSearch(searchInput);
    }
  };
  const handleBlur = () => commitSearch(searchInput);

  return (
    <div className={clsx(styles.wrapper)}>
      <div className={clsx("container", "margin-bottom--lg")}>
        {/* counter */}
      <div className={styles.counterRow}>
        {loading || fetching.current ? "Fetching " + resultLabel + "..." : (
        <>
          Showing&nbsp;<strong>{nonPlaceholderResources.length}</strong>
          &nbsp;{resultLabel}
        </>
        )}
      </div>

        {/* Search Form */}
        <form
          className={styles.filterForm}
          onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }}
        >
          <input
            type="text"
            placeholder="Search by Title, Author, Description..."
            className={styles.searchInput}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />

          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="modified">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="title">Title</option>
            <option value="author">Authors</option>
          </select>

          <button
            type="button"
            className={clsx('button', styles.button, styles.buttonPrimary)}
            aria-label={`Sort direction ${sortDirection}`}
            onClick={() =>
              startTransition(() =>
                setSortDirection(d => (d === 'asc' ? 'desc' : 'asc')),
              )
            }
          >
            {sortDirection === 'asc'
              ? <HiOutlineSortAscending size={25} className={styles.sortIcon} />
              : <HiOutlineSortDescending size={25} className={styles.sortIcon} />}
          </button>
        </form>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.viewToggle}>
            <button
              className={clsx(styles.toggleButton, { [styles.active]: view === "grid" })}
              onClick={() => setView("grid")}
              title="Grid View"
            >
              <FaThLarge size={18} />
            </button>
            <button
              className={clsx(styles.toggleButton, { [styles.active]: view === "row" })}
              onClick={() => setView("row")}
              title="List View"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>

        {/* Resources */}
        {view === "grid" ? (
          <HydroShareResourcesTiles resources={resources} defaultImage={defaultImage} />
        ) : (
          <HydroShareResourcesRows resources={resources} defaultImage={defaultImage} />
        )}

        {/* empty */}
        {!loading && nonPlaceholderResources.length === 0 && (
          <p className={styles.emptyMessage}>No&nbsp;Resources&nbsp;Found</p>
        )}
      </div>
    </div>
  );
}
