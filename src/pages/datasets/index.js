import React, { useCallback, useMemo, useState } from "react";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
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

export default function DatasetsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=datasets');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Datasets" description="CIROH Datasets">
      <DatasetsPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function DatasetsPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [datasets, setDatasets] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setDatasets(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(datasets), [datasets]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <div className="margin-top--lg">
          <Header 
            title="Datasets" 
            tagline="Datasets from CIROH and NOAA&apos;s hydrologic research, designed to enhance forecasting, analysis, and management of water resources."
            buttons={[
                { label: "Add your Dataset", href: contributeUrl, primary: true },
                { label: "Browse Documentation", href: docsUrl }
              ]}
          />
        </div>
      </section>

      {/* Stats */}
      <StatsBar
        loading={statsLoading}
        items={[
          { label: 'Total Datasets', value: stats.total },
          { label: 'Categories', value: stats.categories },
          { label: 'Contributors', value: stats.contributors },
          { label: 'Latest Update', value: stats.lastUpdated },
        ]}
      />

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="ciroh_portal_data,ciroh_hub_data"
          defaultImage="https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/dataset_placeholder.png"
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Datasets"} />
        </div>
      </main>
    </>
  );
}
