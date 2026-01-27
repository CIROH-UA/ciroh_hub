import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { gsap } from 'gsap';
import { FiTarget, FiSearch, FiUsers } from 'react-icons/fi';

import styles from './styles.module.css';
import { workingGroups } from './workingGroupsData';

const normalize = (s) => (s ?? '').toLowerCase().trim();

function WorkingGroupCard({ group, index }) {
  return (
    <article
      className={clsx(
        styles.card,
        styles.glass,
        'tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70',
        'tw-bg-white/70 dark:tw-bg-slate-900/50',
        'tw-shadow-[0_10px_30px_-18px_rgba(2,6,23,0.35)] dark:tw-shadow-[0_10px_30px_-18px_rgba(0,0,0,0.70)]',
        'tw-p-6 tw-h-full'
      )}
      data-animate="card"
      data-index={index}
    >
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

      {group.summary ? (
        <p className="tw-mt-4 tw-text-[15px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
          {group.summary}
        </p>
      ) : null}

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
    </article>
  );
}

export default function WorkingGroupsPage() {
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');

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
  }, [filteredGroups.length]);

  return (
    <Layout
      title="Working Groups"
      description="CIROH Working Groups: descriptions, objectives, and focus areas"
    >
      <main ref={containerRef} className="tw-pb-16">
        <div className="container tw-mt-8">
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

          <section className="tw-mt-8">
            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-5">
              {filteredGroups.map((group, idx) => (
                <WorkingGroupCard key={group.id ?? group.title ?? idx} group={group} index={idx} />
              ))}
            </div>

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
