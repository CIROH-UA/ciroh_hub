import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Header from '@site/src/components/Header';
import { ConstellationCanvas } from '../components/ConstellationCanvas';

export default function Home() {
  const { siteConfig, isDarkTheme } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="CIROH Documentation Hub">

      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
        <div className="margin-top--lg">
          <Header
            title="CIROH Hub"
            tagline={siteConfig.tagline}
            description={
              "Research data, software, tools, documentation, and other resources of the NOAA-supported Cooperative Institute for Research to Operations in Hydrology."
            }
            buttons={[
              { label: "Publications", href: "/publications", primary: true },
              { label: "IT Services", href: "/docs/services/access" },
            ]}
            notice={
              "CIROH Hub is the new home for content from CIROH Portal and CIROH DocuHub."
            }
          />
        </div>
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
