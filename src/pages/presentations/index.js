import React, { useCallback, useMemo, useState } from "react";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';

const items = [
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
  },
];

export default function PresentationsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=presentations');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Presentations" description="CIROH Presentations">
      <PresentationsPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function PresentationsPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [presentations, setPresentations] = useState([]);

  const onResultsChange = useCallback((results) => {
    setPresentations(results);
  }, []);

  const stats = useMemo(() => {
    const totalPresentations = presentations.length;

    const categories = new Set(
      presentations.map(p => p?.resource_type).filter(Boolean)
    ).size;

    const contributors = (() => {
      const set = new Set();
      for (const presentation of presentations) {
        const authors = typeof presentation?.authors === 'string' ? presentation.authors : '';
        authors
          .split('🖊️')
          .map(a => a.trim())
          .filter(Boolean)
          .forEach(a => set.add(a));
      }
      return set.size;
    })();

    const lastUpdated = (() => {
      let latest = null;
      for (const presentation of presentations) {
        const d = presentation?.date_last_updated ? new Date(presentation.date_last_updated) : null;
        if (!d || Number.isNaN(d.getTime())) continue;
        if (!latest || d > latest) latest = d;
      }
      if (!latest) return '—';
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(latest);
      } catch {
        return latest.toISOString().slice(0, 10);
      }
    })();

    return { totalPresentations, categories, contributors, lastUpdated };
  }, [presentations]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pt-36 tw-pb-36">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-cyan-500/10 tw-via-transparent tw-to-transparent" />
        <div className="tw-relative tw-z-10 tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 tw-items-center">
            <div>
              <div className="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-border tw-border-cyan-500/30 tw-bg-cyan-500/10 tw-px-4 tw-py-2 tw-text-xs tw-font-semibold tw-tracking-wide tw-text-cyan-700 dark:tw-text-cyan-300">
                Knowledge Hub
              </div>

              <h1 className="tw-mt-6 tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-leading-tight tw-text-blue-900 dark:tw-text-white">
                Presentations
              </h1>

              <p className="tw-mt-6 tw-max-w-2xl tw-text-base sm:tw-text-lg tw-leading-relaxed tw-text-blue-800/80 dark:tw-text-white">
                Presentations and workshops regarding CIROH and NOAA&apos;s hydrologic research, offering cutting-edge insights into the latest tools and advances in hydrology.
              </p>

              <div className="tw-mt-8 tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
                <Link
                  className="tw-no-underline tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-blue-700 dark:tw-bg-cyan-500 tw-px-6 tw-py-3 tw-font-semibold tw-text-white hover:tw-bg-blue-800 dark:hover:tw-bg-cyan-700 tw-transition"
                  to={contributeUrl}
                >
                  Add Your Presentation
                </Link>

                <Link
                  className="tw-no-underline tw-inline-flex tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-200/80 dark:tw-border-slate-700/80 tw-bg-white tw-px-6 tw-py-3 tw-font-semibold tw-text-blue-800 dark:tw-bg-transparent dark:tw-text-white tw-outline tw-outline-2 tw-outline-blue-600 dark:tw-outline-white hover:tw-border-cyan-500/40 hover:tw-text-cyan-700 dark:hover:tw-text-cyan-300 tw-transition"
                  to={docsUrl}
                >
                  Browse Documentation
                </Link>
              </div>
            </div>

            <div className="tw-flex tw-items-center tw-justify-end">
              <div className="tw-relative tw-w-72 sm:tw-w-80 tw-h-72 sm:tw-h-80">
                <div
                  className={
                    "tw-absolute tw-inset-0 tw-rounded-full tw-blur-3xl tw-opacity-40 " +
                    (isDarkTheme
                      ? 'tw-bg-gradient-to-br tw-from-cyan-500 tw-to-blue-500'
                      : 'tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-400')
                  }
                />
                <div
                  className={
                    "tw-relative tw-h-full tw-w-full tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-2xl " +
                    (isDarkTheme ? 'tw-bg-white' : 'tw-bg-blue-900')
                  }
                >
                  <img
                    src={isDarkTheme ? 'img/logos/ciroh-bgsafe.png' : 'img/logos/ciroh-dark.png'}
                    alt="CIROH"
                    className="tw-w-44 sm:tw-w-52 tw-h-auto tw-drop-shadow-xl"
                  />
                  <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border tw-border-blue-300/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="tw-relative tw-z-20 tw-border-y tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-950 tw-backdrop-blur">
        <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-6">
          <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {stats.totalPresentations}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Total Presentations</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {stats.categories}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Categories</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {stats.contributors}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Contributors</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {stats.lastUpdated}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Latest Update</div>
            </div>
          </div>
        </div>
      </div>

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="ciroh_portal_presentation"
          defaultImage="https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/presentation_placeholder.png"
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Presentations"} />
        </div>
      </main>
    </>
  );
}

