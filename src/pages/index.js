import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageHeader from './HomePageHeader';
import { ConstellationCanvas } from '../components/ConstellationCanvas';

export default function Home() {
  const { siteConfig, isDarkTheme } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="CIROH Documentation Hub">

      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <HomepageHeader />

      </section>

      {/* Features Section */}
      <section className="tw-pb-20 tw-px-6 tw-relative tw-z-20">
        <div className="tw-container tw-mx-auto tw-max-w-7xl">
          <HomepageFeatures />
        </div>
      </section>
    </Layout>
  );
}
