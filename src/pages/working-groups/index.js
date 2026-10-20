import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { gsap } from 'gsap';
import { FiTarget, FiSearch, FiUsers } from 'react-icons/fi';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { fetchResourcesFromCollection, fetchResourceCustomMetadata, fetchResourceImageUrls } from '@site/src/components/HydroShareImporter';

import styles from './styles.module.css';
import { workingGroups } from '@site/src/data/workingGroupsData';
import { ReducedMotionContext } from '@theme/Contexts';
import ModalResourceCards from '@site/src/components/ModalResourceCards';

const normalize = (s) => (s ?? '').toLowerCase().trim();

/**
 * Load working group reports for a given collection.
 * @param {string} collectionId 
 * @returns {Promise<Array>} List of working group report cards
 */
async function loadWorkingGroupReports(collectionId) {
    // Fetch working group reports in the collection
    const resources = await fetchResourcesFromCollection(collectionId);

    // Map to card format and enrich with custom metadata and images
    const mapped = resources.map(resource => ({
        authors: (resource.authors || [])
            .map(a => a.split(',').reverse().join(' '))
            .join(' 🖊 '),
        description: resource.abstract || '',
        docs_url: '',
        embed_url: '',
        page_url: '',
        resource_id: resource.resource_id,
        resource_type: resource.resource_type,
        resource_url: resource.resource_url,
        date_created: resource.date_created || '',
        date_last_updated: resource.date_last_updated || '',
        thumbnail_url: '',
        title: resource.resource_title,
        images: [],
    }));
    
    // Update each report card with custom metadata and images
    await Promise.all(
        mapped.map(async (card) => {
            try {
                // Fetch custom metadata and images for each report
                const [customMetadata, imageUrls] = await Promise.all([
                    fetchResourceCustomMetadata(card.resource_id).catch(() => null),
                    fetchResourceImageUrls(card.resource_id).catch(() => []),
                ]);

                // Update card with fetched metadata, falling back to existing values if not available
                if (customMetadata?.pres_path) {
                    card.embed_url = `https://www.hydroshare.org/resource/${card.resource_id}/data/contents/${customMetadata.pres_path}`;
                }
                card.thumbnail_url = customMetadata?.thumbnail_url || card.thumbnail_url;
                card.page_url = customMetadata?.page_url || card.page_url;
                card.docs_url = customMetadata?.docs_url || card.docs_url;
                card.images = imageUrls || [];
            } catch (err) {
                console.error(`Error enriching report ${card.resource_id}:`, err);
            }
        })
    );

    return mapped;
}

function WorkingGroupCard({ group, index }) {

  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Load reports when modal is opened for the first time
  useEffect(() => {
      // Only load if modal is being shown and we haven't already loaded children
      if (!showModal || reports !== null) return;

      // Load reports for the working group
      let cancelled = false;
      setLoadError(null);
      loadWorkingGroupReports(group.resource_id)
          .then(list => {
              if (!cancelled) setReports(list);
          })
          .catch(err => {
              if (!cancelled) {
                  console.error(`Error loading reports for ${group.resource_id}:`, err);
                  setLoadError(err.message || 'Failed to load reports.');
                  setReports([]);
              }
          });
      return () => { cancelled = true; };
  }, [showModal, group.resource_id, reports]);

  // Close modal on Escape key press
  useEffect(() => {
      if (!showModal) return;
      const onKeyDown = (e) => { if (e.key === 'Escape') setShowModal(false); };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);
  
  return (
    <>
    <article
      className={clsx(
        styles.card,
        styles.glass,
        'tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70',
        'tw-bg-white/70 dark:tw-bg-slate-900/50',
        'tw-shadow-[0_10px_30px_-18px_rgba(2,6,23,0.35)] dark:tw-shadow-[0_10px_30px_-18px_rgba(0,0,0,0.70)]',
        'tw-p-6 tw-h-full tw-flex tw-flex-col'
      )}
      data-animate="card"
      data-index={index}
    >
      {/* Title Section */}
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
        <div>
          <div className={clsx(styles.kicker, 'tw-text-cyan-700 dark:tw-text-cyan-300')}>
            Working Group
          </div>
          <h2 className="tw-mt-2 tw-text-2xl tw-font-extrabold tw-tracking-tight tw-text-slate-900 dark:tw-text-white">
            {group.title}
          </h2>
        </div>
        <span
          className={clsx(
            styles.badge,
            'tw-bg-slate-900/5 dark:tw-bg-white/10',
            'tw-text-slate-700 dark:tw-text-slate-200'
          )}
          aria-label={`Group number ${index + 1}`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      
      {/* Summary Section */}
      {group.summary ? (
        <p className="tw-mt-4 tw-text-[15px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
          {group.summary}
        </p>
      ) : null}

      {/* Objectives Section */}
      {group.objectives?.length ? (
        <div className="tw-mt-5">
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-900 dark:tw-text-white tw-font-semibold">
            <FiTarget />
            Objectives
          </div>
          <ul className="tw-mt-2 tw-space-y-2 tw-pl-5 tw-list-disc tw-text-[14px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
            {group.objectives.map((obj) => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Leads Section */}
      {group.leads?.length ? (
        <div className="tw-mt-5">
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-900 dark:tw-text-white tw-font-semibold">
            <FiUsers />
            Leads
          </div>
          <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-2">
            {group.leads.map((lead) => (
              <span
                key={lead}
                className="tw-rounded-full tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-900/40 tw-px-3 tw-py-1 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200"
              >
                {lead}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Working Group Reports Button */}
      <div className="tw-mt-auto tw-pt-5 tw-flex tw-justify-end">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="tw-appearance-none tw-border-0 tw-cursor-pointer tw-font-[inherit] tw-inline-flex tw-items-center tw-gap-2 tw-rounded tw-bg-cyan-600 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-cyan-700 dark:tw-bg-slate-900 dark:hover:tw-bg-slate-700"
        >
          View Reports
        </button>
      </div>
    </article>

    {/* Modal for Working Group Reports */}
    <ModalResourceCards
        show={showModal}
        onClose={() => setShowModal(false)}
        title={group.title}
        cards={reports}
        itemLabel="Reports"
        loadError={loadError}
    />
    </>
  );
}

export default function WorkingGroupsPage() {
  const { siteConfig } = useDocusaurusContext();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  const wgIntakeFormUrl = siteConfig?.customFields?.externalLinks?.wgIntakeForm || 'https://app.smartsheet.com/b/form/019f1f425a1d717180af65a76b9fa26f';
  const { reducedMotionMode } = useContext(ReducedMotionContext);

  const filteredGroups = useMemo(() => {
    const q = normalize(query);
    if (!q) return workingGroups;
    return workingGroups.filter((g) => {
      const haystack = [g.title, g.summary, ...(g.objectives ?? []), ...(g.leads ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotionMode === 'enabled') return;

    let ctx;
    let cancelled = false;

    (async () => {
      const root = containerRef.current;
      if (!root) return;

      const mod = await import('gsap/ScrollTrigger');
      if (cancelled) return;

      gsap.registerPlugin(mod.ScrollTrigger);

      const cards = Array.from(root.querySelectorAll('[data-animate="card"]'));

      ctx = gsap.context(() => {
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 18, opacity: 0, filter: 'blur(6px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.8,
              ease: 'power3.out',
              delay: Math.min(i * 0.04, 0.25),
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        gsap.fromTo(
          '[data-animate="hero"]',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        );

        gsap.to('[data-animate="orbA"]', {
          x: 20,
          y: -12,
          duration: 6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        gsap.to('[data-animate="orbB"]', {
          x: -18,
          y: 16,
          duration: 7,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [filteredGroups.length, reducedMotionMode]);

  return (
    <Layout
      title="Working Groups"
      description="CIROH Working Groups: descriptions, objectives, and focus areas"
    >
      <main ref={containerRef} className="tw-pb-16">
        <div className="container tw-mt-8">
          {/* Hero Section */}
          <section
            className={clsx(
              styles.hero,
              styles.glass,
              'tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70',
              'tw-bg-white/60 dark:tw-bg-slate-900/40',
              'tw-p-8 md:tw-p-10'
            )}
            data-animate="hero"
          >
            <div className={clsx(styles.orb, styles.orbA)} data-animate="orbA" />
            <div className={clsx(styles.orb, styles.orbB)} data-animate="orbB" />

            <div className="tw-relative">
              <div className={clsx(styles.kicker, 'tw-text-slate-700 dark:tw-text-slate-300')}>
                CIROH Community
              </div>
              <h1 className="tw-mt-2 tw-text-4xl md:tw-text-5xl tw-font-black tw-tracking-tight tw-text-slate-900 dark:tw-text-white">
                Working Groups
              </h1>
              <p className="tw-mt-4 tw-max-w-3xl tw-text-[16px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
                CIROH's Working Groups drive innovation and collaboration across critical research areas, from hydrologic modeling and flood inundation mapping to artificial intelligence and early career development. Discover the groups shaping the future of water research, their 2025-2026 objectives, and the leaders guiding each initiative.
              </p>
              <div className="tw-mt-5">
                <a href={wgIntakeFormUrl} className={styles.joinGroupButton} target='_blank' rel="noreferrer noopener">
                  <svg className="tw-w-8 w-mr-4" viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  Join Working Groups
                </a>
              </div>

              <div className="tw-mt-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                <div className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-900/40 tw-p-4">
                  <div className="tw-rounded-xl tw-bg-cyan-500/15 dark:tw-bg-cyan-400/10 tw-p-2 tw-text-cyan-700 dark:tw-text-cyan-300">
                    <FiTarget size={18} />
                  </div>
                  <div>
                    <div className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">Clear objectives</div>
                    <div className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-300">Bulleted, skimmable goals</div>
                  </div>
                </div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-900/40 tw-p-4">
                  <div className="tw-rounded-xl tw-bg-purple-500/15 dark:tw-bg-purple-400/10 tw-p-2 tw-text-purple-700 dark:tw-text-purple-300">
                    <FiUsers size={18} />
                  </div>
                  <div>
                    <div className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">Community alignment</div>
                    <div className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-300">Built for collaboration</div>
                  </div>
                </div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-900/40 tw-p-4">
                  <div className="tw-rounded-xl tw-bg-slate-900/10 dark:tw-bg-white/10 tw-p-2 tw-text-slate-800 dark:tw-text-slate-100">
                    <FiSearch size={18} />
                  </div>
                  <div>
                    <div className="tw-font-semibold tw-text-slate-900 dark:tw-text-white">Quick search</div>
                    <div className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-300">Find groups by keyword</div>
                  </div>
                </div>
              </div>

              <div className="tw-mt-6 tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-items-center">
                <label className="tw-relative tw-flex-1">
                  <span className="tw-sr-only">Search working groups</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, objective, keyword…"
                    className={clsx(
                      'tw-w-full tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70',
                      'tw-bg-white/75 dark:tw-bg-slate-950/35',
                      'tw-px-4 tw-py-3 tw-text-[15px]',
                      'tw-text-slate-900 dark:tw-text-white',
                      'placeholder:tw-text-slate-500 dark:placeholder:tw-text-slate-400',
                      'focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-cyan-400/60 dark:focus:tw-ring-cyan-300/40'
                    )}
                  />
                </label>
                <div className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-300">
                  Showing <span className="tw-font-semibold">{filteredGroups.length}</span> group
                  {filteredGroups.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </section>
          
          {/* Working Group Cards */}
          <section className="tw-mt-8">
            {/* Grid of working group cards */}
            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-5">
              {filteredGroups.map((group, idx) => (
                <WorkingGroupCard key={group.id ?? group.title ?? idx} group={group} index={idx} />
              ))}
            </div>
            
            {/* No Results Message */}
            {filteredGroups.length === 0 ? (
              <div className="tw-mt-8 tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-900/40 tw-p-6 tw-text-slate-700 dark:tw-text-slate-300">
                No working groups matched your search.
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </Layout>
  );
}
