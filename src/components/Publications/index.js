/* Publications.jsx – Zotero list with search, sort **and 1-collection filter** */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  startTransition,
  useMemo,
} from 'react';
import Zotero           from 'zotero-api-client';
import SelectCollection from './SelectCollection';
import PublicationCard  from './PublicationCard';
import SkeletonCard     from './SkeletonCard';
import styles           from './Publications.module.css';
import clsx             from 'clsx';
import {
  HiOutlineSortDescending,
  HiOutlineSortAscending,
} from 'react-icons/hi';

const PAGE_SIZE        = 50;
const SCROLL_THRESHOLD = 200;
let   debounceTimer    = null;
const DEBOUNCE_MS      = 1_000;

/* ----- helper: read “Total-Results” header -------------------------------- */
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

/* ------------------------------------------------------------------------- */
export default function Publications({ apiKey, groupId }) {
  console.log(apiKey, groupId);
  /* memoised Zotero client (doesn’t re-create on every render) */
  const zotero = useMemo(
    () => new Zotero(apiKey).library('group', groupId),
    [apiKey, groupId],
  );

  /* ---------------- state ---------------- */
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage,    setCurrentPage]    = useState(0);
  const [hasMore,        setHasMore]        = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const fetching = useRef(false);

  const [totalItems,     setTotalItems]     = useState(null);

  const [searchInput,    setSearchInput]    = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [filterItemType, setFilterItemType] = useState('all');
  const [sortType,       setSortType]       = useState('date');
  const [sortDirection,  setSortDirection]  = useState('desc');

  /* 💡 single selected collection (object | null) */
  const [selectedCollection, setSelectedCollection] = useState(null);

  /* stable key string for API paths & dependency arrays */
  const collectionKeyStr = selectedCollection?.value ?? '';  // '' ⇒ no filter

  /* -------- total-count header ----------------------------------- */
  const refreshTotal = useCallback(async () => {
    const params = {
      sort: sortType,
      direction: sortDirection,
      ...(filterSearch ? { q: filterSearch } : {}),
      ...(filterItemType !== 'all' ? { itemType: filterItemType } : {}),
    };
    try {
      setTotalItems(
        await fetchTotal(groupId, apiKey, params, collectionKeyStr),
      );
    } catch (e) {
      console.error('Total-Results header error:', e);
      setTotalItems(null);
    }
  }, [
    groupId,
    apiKey,
    filterSearch,
    filterItemType,
    sortType,
    sortDirection,
    collectionKeyStr,
  ]);

  /* -------- loader ----------------------------------------------- */
  const loadPublications = useCallback(
    async (page) => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        setLoading(true);
        setError(null);

        /* placeholders */
        setDisplayedItems(prev => [
          ...prev,
          ...Array.from({ length: PAGE_SIZE }, () => ({ placeholder: true })),
        ]);

        const query = {
          start: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          sort:  sortType,
          direction: sortDirection,
          include: 'data',
          qmode: 'titleCreatorYear',
          ...(filterSearch ? { q: filterSearch } : {}),
          ...(filterItemType !== 'all' ? { itemType: filterItemType } : {}),
        };

        /* build request chain */
        let api = zotero;
        api = collectionKeyStr ? api.collections(collectionKeyStr).items()
                               : api.items();

        const newItems = (await api.top().get(query)).getData();
        setHasMore(newItems.length === PAGE_SIZE);

        /* swap placeholders */
        setDisplayedItems(prev => {
          const upd   = [...prev];
          const first = upd.findIndex(i => i.placeholder);
          newItems.forEach((it, i) => (upd[first + i] = it));
          if (newItems.length < PAGE_SIZE) {
            upd.splice(first + newItems.length, PAGE_SIZE - newItems.length);
          }
          return upd;
        });
      } catch {
        if (apiKey === 'dummy') setError('Site administrator: Please provide a Zotero API key in this website\'s environment file.');
        else setError('Error retrieving the publications.');
      } finally {
        fetching.current = false;
        setLoading(false);
      }
    },
    [
      zotero,
      collectionKeyStr,
      filterSearch,
      filterItemType,
      sortType,
      sortDirection,
    ],
  );

  /* -- reload whenever filters OR selected collection change -------- */
  useEffect(() => {
    setDisplayedItems([]);
    setCurrentPage(0);
    setHasMore(true);
    loadPublications(0);
    refreshTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterSearch,
    filterItemType,
    sortType,
    sortDirection,
    collectionKeyStr,
  ]);

  /* infinite scroll */
  useEffect(() => {
    const onScroll = () => {
      if (fetching.current || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
        const next = currentPage + 1;
        setCurrentPage(next);
        loadPublications(next);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, hasMore, loadPublications]);

  /* search helpers */
  const commitSearch = q => {
    clearTimeout(debounceTimer);
    setFilterSearch(q.trim());
  };
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

  /* ---------------- render ---------------- */
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* counter */}
        <div className={styles.counterRow}>
          Loaded&nbsp;
          <strong>{displayedItems.filter(i => !i.placeholder).length}</strong>
          &nbsp;publications
          {totalItems !== null && <> of <strong>{totalItems}</strong></>}
        </div>

        {/* form */}
        <form
          className={styles.filterForm}
          onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }}
        >
          <input
            type="text"
            placeholder="Search by Title, Author, Year"
            className={styles.searchInput}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />

          <select
            value={filterItemType}
            onChange={e => setFilterItemType(e.target.value)}
            className={styles.typeSelect}
          >
            <option value="all">All types</option>
            <option value="book">Book</option>
            <option value="journalArticle">Journal Article</option>
            <option value="conferencePaper">Conference Paper</option>
            <option value="prePrint">Pre-print</option>
            <option value="document">Document</option>
            <option value="bookSection">Book Section</option>
          </select>

          <select
            value={sortType}
            onChange={e => setSortType(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="date">Published Date</option>
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="creator">Creator</option>
            <option value="itemType">Item Type</option>
            <option value="publisher">Publisher</option>
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

        {/* collection select (single) */}
        <div className={styles.collectionRow}>
          <SelectCollection
            zotero={zotero}
            onChange={opt => setSelectedCollection(opt || null)}
          />
        </div>
        <p></p>
        <p className={styles.hint}>
          <strong>🧪&nbsp;</strong>
          A result is returned only if the exact text you type occurs <em>anywhere</em> in the
          citation’s <em>title</em>, <em>author</em>, or <em>year</em>.
        </p>

        {/* error */}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.error}>{error}</div>
          </div>
        )}

        {/* grid */}
        <div className={styles.publicationsContainer}>
          {!error &&
            displayedItems.map((item, i) =>
              item.placeholder
                ? <SkeletonCard key={`ph-${i}`} />
                : <PublicationCard key={item.key || `pub-${i}`} publication={item} />,
            )}
        </div>

        {/* empty */}
        {!loading &&
          displayedItems.filter(i => !i.placeholder).length === 0 && (
            <p className={styles.emptyMessage}>No&nbsp;Publications&nbsp;Found</p>
          )}
      </div>
    </div>
  );
}
