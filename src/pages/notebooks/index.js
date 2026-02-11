import React, { useCallback, useMemo, useState } from "react";
import Header from "@site/src/components/Header";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import StatsBar from "@site/src/components/StatsBar";
import { getResourceStats } from "@site/src/utils/resourceStats";

const items = [
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://hydroshare.org/',
  },
];

export default function NoteBooksPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=notebooks');
  const docsUrl = useBaseUrl('/docs/products/intro');
  const defaultImage = 'https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/app_placeholder.png'

  return (
    <Layout title="Notebooks" description="CIROH NoteBooks">
      <NoteBooksPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
        defaultImage={defaultImage}
      />
    </Layout>
  );
}

function NoteBooksPageContent({ contributeUrl, docsUrl, defaultImage }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [notebooks, setNotebooks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setNotebooks(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(notebooks), [notebooks]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
      <div className="margin-top--lg">
        <Header 
            title="Notebooks" 
            tagline="Enhance forecasting, analysis, and water resource management by making your web applications and tools accessible to CIROH and NOAA&apos;s hydrologic research initiatives."
            buttons={[
                { label: "Add your Notebooks", href: contributeUrl, primary: true },
                { label: "Browse Documentation", href: docsUrl }
              ]}
        />
      </div>


      </section>

      {/* Stats */}
      <StatsBar
        loading={statsLoading}
        items={[
          { label: 'Total Notebooks', value: stats.total },
          { label: 'Categories', value: stats.categories },
          { label: 'Contributors', value: stats.contributors },
          { label: 'Latest Update', value: stats.lastUpdated },
        ]}
      />

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="ciroh_hub_notebooks"
          defaultImage={defaultImage}
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"NoteBooks"} tethys />
        </div>
      </main>
    </>
  );
}
