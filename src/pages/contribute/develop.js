import Header from "@site/src/components/Header";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TethysSection from "@site/src/components/TethysSection";
import { useColorMode } from '@docusaurus/theme-common';
import styles from './develop.module.css';

export default function Develop() {
  return (
    <Layout
      title="Develop with Tethys"
      description="Use Tethys Platform to create dynamic web interfaces."
    >
      <DevelopHero />
      <DevelopContent />
    </Layout>
  );
}

// Needed to be spun out so that useColorMode can be called from a child of Layout
function DevelopHero() {
    const { colorMode } = useColorMode();
    const tethysCirohPortalUrl = 'https://tethys.ciroh.org/apps/';
    const docsUrl = 'https://docs.tethysplatform.org/en/stable/index.html';

    return (
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={colorMode === 'dark'} />
        </div>
        <div className="margin-top--lg">
          <Header
            title="Develop with Tethys Platform"
            tagline=""
            buttons={[
                { label: "Tethys CIROH Portal", href: tethysCirohPortalUrl, primary: true },
                { label: "Tethys Documentation", href: docsUrl }
              ]}
          />
        </div>
      </section>
    );
}

function DevelopContent() {
    return (
      <div className={styles.mainContainer}>
        <TethysSection 
          title="Geospatial and scientific web applications for the 21st century"
          description={
            <div>
              Tethys is an open-source Python-based framework designed specifically for developing geospatial web applications. 
              It simplifies the creation of apps that process, visualize, and analyze spatial data.
            </div>
          }
          examples={
            <div>
              Explore real-world Tethys apps built by the CIROH community at the <a href="https://tethys.ciroh.org/apps/">CIROH Tethys Portal</a>
            </div>
          }
       />
      </div>
    );
}