import React from "react";
// import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import Courses from "@site/src/components/Courses";
import Header from "@site/src/components/Header";
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroLearnLogo from '@site/static/img/logos/hydrolearn_logo.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const items = [
  {
    lightIcon: HydroLearnLogo,
    darkIcon: HydroLearnLogo,
    alt: 'HydroLearn',
  },
    {
      lightIcon: HydroShareLogo,
      darkIcon: HydroShareLogo,
      alt: 'HydroShare',
    },
];


export default function CoursesPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=courses');
  const { isDarkTheme } = useDocusaurusContext();
  return (
    <Layout title="Courses" description="CIROH Courses">
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>
      <div className="margin-top--md">
        <Header 
            title="Learning" 
            tagline="Access a range of open courses in hydrology, enriched with CIROH and NOAA research, designed for learners at all levels seeking to deepen their understanding of water science."
            buttons={[
              { label: "Add your Course", href: contributeUrl, primary: true },
            ]}
        />
      </div>

      <main>
        <Courses keyword="nwm_portal_module"/>
        <TechBox items={items} type={"Courses"}  />
      </main>
    
    </Layout>
  );
}

