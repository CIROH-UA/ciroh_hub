import React, { useCallback, useMemo, useState } from "react";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroLearnLogo from '@site/static/img/logos/hydrolearn_logo.png';
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
import { useColorMode } from '@docusaurus/theme-common';
import LMLightIcon from '@site/static/img/cards/modules_light.png';
import LMDarkIcon from '@site/static/img/cards/modules_dark.png';
import StatsBar from "@site/src/components/StatsBar";
import { getResourceStats } from "@site/src/utils/resourceStats";

const items = [
  {
    lightIcon: HydroLearnLogo,
    darkIcon: HydroLearnLogo,
    alt: 'HydroLearn',
    name: 'HydroLearn',
    href: 'https://www.hydrolearn.org/',
  },
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://www.hydroshare.org/',
  },
];

export default function CoursesPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=courses');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Courses" description="CIROH Courses">
      <CoursesPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function CoursesPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const defaultImage = colorMode === 'dark' ? LMDarkIcon : LMLightIcon;

  const [courses, setCourses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setCourses(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => getResourceStats(courses), [courses]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
      <div className="margin-top--lg">
        <Header 
            title="Courses" 
            tagline="Access a range of open courses in hydrology, enriched with CIROH and NOAA research, designed for learners at all levels seeking to deepen their understanding of water science."
            buttons={[
                { label: "Add your Apps", href: contributeUrl, primary: true },
                { label: "Browse Documentation", href: docsUrl }
              ]}
        />
      </div>
      </section>

      {/* Stats */}
      <StatsBar
        loading={statsLoading}
        items={[
          { label: 'Total Courses', value: stats.total },
          { label: 'Categories', value: stats.categories },
          { label: 'Contributors', value: stats.contributors },
          { label: 'Latest Update', value: stats.lastUpdated },
        ]}
      />

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="nwm_portal_module,ciroh_hub_module"
          defaultImage={defaultImage}
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Courses"} />
        </div>
      </main>
    </>
  );
}
