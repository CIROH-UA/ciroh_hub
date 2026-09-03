import React, { useCallback, useMemo, useState } from "react";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/HydroShare/TechBox";
import HydroShareResourcesSelector from "@site/src/components/HydroShare/HydroShareResourcesSelector";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import DatasetLightIcon from '@site/static/img/cards/datasets_logo_light.png';
import DatasetDarkIcon from '@site/static/img/cards/datasets_logo_dark.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
import { useColorMode } from '@docusaurus/theme-common';
import StatsBar from "@site/src/components/HydroShare/StatsBar";
import { getResourceStats } from "@site/src/utils/resourceStats";
import { featuredDatasets } from "@site/src/data/featuredResources";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CardCarouselHydroshareFeatured from "@site/src/components/HydroShare/CardCarouselHydroshareFeatured";

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
  const defaultImage = isDarkTheme ? DatasetDarkIcon : DatasetLightIcon;

  const [datasets, setDatasets] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setDatasets(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(datasets), [datasets]);

  const { siteConfig } = useDocusaurusContext();
  const featuredResourcesCollectionId = siteConfig.customFields.hs_featured_datasets_collection_id;

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
        {/* Featured Resources Carousel */}
        <div className="tw-bg-white dark:tw-bg-[#060010]">
          <CardCarouselHydroshareFeatured
            header="Featured Datasets"
            collectionId={featuredResourcesCollectionId}
            defaultImage={defaultImage}
            overrides={featuredDatasets}
            cardsPerView={1}
          />
        </div>

        <HydroShareResourcesSelector
          keyword="ciroh_portal_data,ciroh_hub_data"
          defaultImage={defaultImage}
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
