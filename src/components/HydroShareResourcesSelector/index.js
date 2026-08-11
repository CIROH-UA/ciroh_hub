import React, { useEffect, useState, startTransition, useRef, useCallback, useMemo } from "react";
import clsx from "clsx";
import { FaThLarge, FaBars } from "react-icons/fa";
import styles from "./styles.module.css";
import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
import HydroShareResourcesCards from "@site/src/components/HydroShareResourcesCards";
import { fetchResourcesBySearch, fetchResourceCustomMetadata, getCommunityResources, fetchResourcesFromCollection, fetchResourceMetadata } from "@site/src/components/HydroShareImporter";
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
  HiOutlineSearch,
} from 'react-icons/hi';

const PAGE_SIZE        = 40;
const SCROLL_THRESHOLD = 800;
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

// Sort a mapped resource list in place. Needed because datasets combines group resources
// with keyword search results so they must be sorted after the fact
const sortResources = (resourceList, sortType, sortDirection) => {
  return resourceList.sort((a, b) => {
    // Keep placeholders at the beginning during loading
    if (a.resource_id.startsWith('placeholder-')) return -1;
    if (b.resource_id.startsWith('placeholder-')) return 1;

    let comparison = 0;

    switch (sortType) {
      case 'lastModified':
        comparison = a.date_last_updated.localeCompare(b.date_last_updated);
        break;
      case 'dateCreated':
        comparison = a.date_created.localeCompare(b.date_created);
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'creatorName':
        comparison = a.authors.localeCompare(b.authors);
        break;
      default:
        comparison = 0;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

export default function HydroShareResourcesSelector({
  keyword = "nwm_portal_app,ciroh_hub_app",
  defaultImage,
  variant = 'legacy',
  onResultsChange,
  cardsComponent: CardsComponent = HydroShareResourcesCards,
}) {
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
    embed_url: "",
  }));

  // State
  const [resources, setResources] = useState(initialPlaceholders);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("row");
  const [hasMore, setHasMore] = useState(true);
  const fetching = useRef(false);

  // Pagination state
  const groupPageNumberRef = useRef(undefined);   // For getCommunityResources group pagination
  const communityTokenRef = useRef(undefined);    // For getCommunityResources discovery-atlas pagination
  const searchTokenRef = useRef(undefined);       // For fetchResourcesBySearch pagination
  const placeholderBatchRef = useRef(0);          // Counter that produces unique IDs for placeholder resources across paginated fetches

  // Search State
  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [sortType,       setSortType]       = useState('lastModified');
  const [sortDirection,  setSortDirection]  = useState('desc');
  const [ecosystems, setEcosystems] = useState([]);
  const [ecosystem, setEcosystem] = useState('');


  const fetchResources = useCallback(
    async ({ reset = false } = {}) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        let resourceList = undefined;

        // Reset pagination state on a filter-change refetch
        if (reset) {
          groupPageNumberRef.current = undefined;
          communityTokenRef.current = undefined;
          searchTokenRef.current = undefined;
          placeholderBatchRef.current = 0;
        } else {
          // Add placeholders for loading state on subsequent pages
          placeholderBatchRef.current += 1;
          const batchId = placeholderBatchRef.current;
          setResources(prev => [
            ...prev,
            ...Array.from({ length: PAGE_SIZE }, (_, i) => ({
              resource_id: `placeholder-batch${batchId}-${i}`,
              title: "",
              authors: "",
              resource_type: "",
              resource_url: "",
              description: "",
              thumbnail_url: "",
              page_url: "",
              docs_url: "",
              embed_url: "",
            }))
          ]);
        }

        // Start data fetching (while placeholders are already rendered)
        const ascending = sortDirection === 'asc' ? true : false;

        // For datasets, use getCommunityResources which combines group and keyword resources
        let communityResponse = null;
        let searchResponse = null;
        const ecosystemSelected = Boolean(ecosystem);

        if (ecosystemSelected) {
          // Fetch resources from the selected ecosystem collection
          searchResponse = await fetchResourcesFromCollection(ecosystem) || [];
          resourceList = searchResponse;
          searchTokenRef.current = searchResponse?.nextPaginationToken;
        }
        else
        if (keyword.includes('data')) {
          // Fetch resources using the community endpoint which handles both group and keyword resources, along with pagination tokens
          communityResponse = await getCommunityResources(keyword, "4", filterSearch, ascending, sortType, undefined, groupPageNumberRef.current, communityTokenRef.current, PAGE_SIZE);
          resourceList = communityResponse.resources || [];

          // Advance pagination state for the next fetch.
          groupPageNumberRef.current = (communityResponse.groupResourcesPageData?.pageNumber || 1) + 1;
          communityTokenRef.current = communityResponse.extraResourcesPageData?.nextPaginationToken;
        } else {
          // For other resource types, use the standard search endpoint
          searchResponse = await fetchResourcesBySearch(keyword, filterSearch, ascending, sortType, undefined, searchTokenRef.current, PAGE_SIZE);
          resourceList = searchResponse?.resources || [];
          searchTokenRef.current = searchResponse?.nextPaginationToken;
        }

        let mappedList = resourceList.map((res) => ({
          resource_id: res.resource_id,
          title: res.resource_title,
          authors: res.authors.map(
            (author) => author.split(',').reverse().join(' ')
          ).join(' 🖊 '),
          resource_type: res.resource_type,
          resource_url: res.resource_url,
          description: res.abstract || "No description available.",
          date_created: res.date_created,
          date_last_updated: res.date_last_updated,
          keywords: res.subjects,
          thumbnail_url: "",
          page_url: "",
          docs_url: "",
          embed_url: "",
        }));

        // Search and filter locally when ecosystem is selected
        if (ecosystemSelected) {
          const searchTerm = filterSearch.trim().toLowerCase();
          if (searchTerm) {
            mappedList = mappedList.filter(resource =>
              resource.title?.toLowerCase().includes(searchTerm) ||
              resource.authors?.toLowerCase().includes(searchTerm) ||
              resource.description?.toLowerCase().includes(searchTerm)
            );
          }

          // Keep only resources tagged with one of the current page's keywords (e.g. "ciroh_hub_app")
          const pageKeywords = new Set(keyword.split(',').map(k => k.trim().toLowerCase()).filter(Boolean));
          mappedList = mappedList.filter(resource =>
            resource.keywords?.some(k => pageKeywords.has(k.trim().toLowerCase()))
          );
        }

        // Sort locally when fetching datasets (or an ecosystem) to account for curated resources being combined with searched resources
        if (keyword.includes('data') || ecosystemSelected) {
          mappedList = sortResources(mappedList, sortType, sortDirection);
        }

        // Handle first page vs pagination
        if (reset) {
          setResources(mappedList); // Replace for first page
        } else {
          setResources(prev => {
            const existing = prev.filter(r => !String(r.resource_id).startsWith('placeholder-'));
            const seen = new Set(existing.map(r => r.resource_id));
            const newItems = mappedList.filter(r => !seen.has(r.resource_id));
            return [...existing, ...newItems];
          });
        }

        // Update hasMore based on API response
        if (communityResponse) {
          setHasMore(Boolean(communityResponse.hasMorePages));
        } else {
          setHasMore(Boolean(searchResponse?.hasMorePages));
        }
        setLoading(false);

        // Fetch metadata for each resource and update them individually
        for (let res of mappedList) {
          try {
            const customMetadata = await fetchResourceCustomMetadata(res.resource_id);
            let embedUrl = "";
            if (customMetadata?.pres_path) embedUrl = `https://www.hydroshare.org/resource/${res.resource_id}/data/contents/${customMetadata.pres_path}`;
            // Extract keywords/subjects from metadata, unless the resource already has them
            let keywords = res.keywords;
            if (!keywords) {
              const metadata = await fetchResourceMetadata(res.resource_id);
              keywords = [];
              if (metadata?.subjects) {
                for (let subject of metadata.subjects) {
                  if (subject?.value) keywords.push(subject.value);
                }
              }
            }
            const updatedResource = {
              ...res,
              thumbnail_url: customMetadata?.thumbnail_url || "",
              page_url: customMetadata?.page_url || "",
              docs_url: customMetadata?.docs_url || "",
              embed_url: embedUrl,
              keywords: keywords,
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
    [keyword, filterSearch, sortDirection, sortType, ecosystem]
  );

  // Fetch ecosystem resources and extract their titles for the ecosystem selector
  useEffect(() => {
    try {
      let cancelled = false;

      // Fetch ecosystem resources asynchronously
      (async () => {
        try {
          // Fetch ecosystem resources from HydroShare using the search API
          const ecosystemsResponse = await fetchResourcesBySearch('ciroh_hub_ecosystem', '');

          // Make sure the component has not been unmounted before updating state
          if (!cancelled)
          {
            // Extract the titles from the ecosystem resources
            let ecosystems = [{'name': 'All', 'id': ''}];

            for (let resource of ecosystemsResponse.resources) {
              if (resource?.resource_title && resource?.resource_id) {
                ecosystems.push({name: resource.resource_title, id: resource.resource_id});
              }
            }

            // Update the state with the extracted ecosystem titles
            setEcosystems(ecosystems);
          }
        } catch (error) {
          if (!cancelled) console.error(error.message);
        }
      })();

      // Cleanup function to mark the fetch as cancelled if the component unmounts
      return () => { cancelled = true; };
    } 
    catch (error) {
      console.error(`Error fetching ecosystem resources: ${error.message}`);
    }
  }, []);

  // Reset and load first page when filters change
  useEffect(() => {
    setResources(initialPlaceholders);
    setHasMore(true);

    // Reset the fetching flag to allow new requests (fixes race condition)
    fetching.current = false;

    fetchResources({ reset: true });
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
      ecosystem,
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
    ecosystem,
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
        fetchResources();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasMore, fetchResources]);

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
  else if (keyword.includes('event')) resultLabel = 'Events';


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
                  value={ecosystem}
                  onChange={e => setEcosystem(e.target.value)}
                  className="tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                >
                  {ecosystems.map(({name, id}) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
                <select
                  value={sortType}
                  onChange={e => setSortType(e.target.value)}
                  className="tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white/80 dark:tw-bg-slate-900/50 tw-backdrop-blur tw-px-3 tw-py-3 tw-text-sm tw-text-slate-900 dark:tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-500/30"
                >
                  <option value="lastModified">Last Updated</option>
                  <option value="dateCreated">Date Created</option>
                  <option value="name">Title</option>
                  <option value="creatorName">Authors</option>
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
            <CardsComponent resources={resources} defaultImage={defaultImage} />
          )}

          {!loading && !fetching.current && nonPlaceholderResources.length === 0 && (
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
            <option value="lastModified">Last Updated</option>
            <option value="dateCreated">Date Created</option>
            <option value="name">Title</option>
            <option value="creatorName">Authors</option>
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
        {!loading && !fetching.current && nonPlaceholderResources.length === 0 && (
          <p className={styles.emptyMessage}>No&nbsp;Resources&nbsp;Found</p>
        )}
      </div>
    </div>
  );
}
