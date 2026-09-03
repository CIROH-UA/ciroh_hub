import styles from './CommunityImpact.module.css';
import BlogFilter from '@site/src/components/CommunityImpact/BlogFilter';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CardSwap, { Card } from './cardSwap';
import CardSwapAccessible from './cardSwapAccessible';
import cardSwapEntries from './cardSwapEntries';
import CloudInfraDashboard from "./cloudInfraDashboard";
import Link from '@docusaurus/Link';
import { communityImpactData } from '@site/src/data/communityImpactData';



const ImpactItem = ({ title, count, imageSrc, users }) => (
  <div className={clsx(styles.impactItem, 'card')}>
    <img src={imageSrc} alt={`${title} icon`} className={styles.impactIcon} />
    <h3 className={styles.impactTitle}>{title}</h3>
    <p className={styles.impactCount}>{count} ongoing projects</p>
    <p className={styles.impactCount}>{users} active users</p>
  </div>
);

export default function CommunityImpactComponent() {
  const cards = [
  {
    accent: "aws",
    title: "Amazon Web Services",
    color: "#FF9900",
    svg: <img src={useBaseUrl("/img/logos/corp/aws-black.svg")} alt="AWS Logo" />,
    stats: [
      { value: communityImpactData.aws.projects, bar: communityImpactData.aws.projectsBar, label: "IT Requests" },
      { value: communityImpactData.aws.users, bar: communityImpactData.aws.usersBar, label: "Users" },
    ],
  },
  {
    accent: "gcp",
    title: "GCP + 2i2c JupyterHub",
    color: "#4285F4",
    svg: <img src={useBaseUrl("/img/logos/corp/google-cloud.jpg")} alt="GCP Logo" />,
    stats: [
      { value: communityImpactData.gcp.projects, bar: communityImpactData.gcp.projectsBar, label: "IT Requests" },
      { value: communityImpactData.gcp.users, bar: communityImpactData.gcp.usersBar, label: "Users" },
    ],
  },
  {
    accent: "hpc",
    title: "On-Premise HPC",
    color: "#10B981",
    svg: <img src={useBaseUrl("/img/logos/pantarhei.jpg")} alt="HPC Logo" />,
    stats: [
      { value: communityImpactData.hpc.projects, bar: communityImpactData.hpc.projectsBar, label: "IT Requests" },
      { value: communityImpactData.hpc.users, bar: communityImpactData.hpc.usersBar, label: "Users" },
    ],
  },
  {
    accent: "nsf",
    title: "NSF ACCESS Allocations",
    color: "#8B5CF6",
    svg: <img src={useBaseUrl("/img/logos/nsf-logo.png")} alt="NSF Logo" />,
    stats: [
      { value: communityImpactData.nsf.projects, bar: communityImpactData.nsf.projectsBar, label: "IT Requests" },
      { value: communityImpactData.nsf.users, bar: communityImpactData.nsf.usersBar, label: "Users" },
    ],
  },
];

  return (
    <div>
      <section className="tw-text-black dark:tw-text-white tw-body-font tw-relative tw-overflow-hidden">

        {/* PARTICLES BACKGROUND (receives mouse events) */}
        {/*
        <div className="tw-absolute tw-inset-0 tw--z-10 tw-pointer-events-auto base-motion">
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        */}

        {/* HERO CONTENT (ignores pointer events EXCEPT buttons/card components) */}
        <div className="tw-container tw-mx-auto tw-flex tw-px-5 tw-py-6 md:tw-py-8 lg:tw-py-16 tw-flex-col lg:tw-flex-row tw-items-center tw-relative tw-z-10 tw-pointer-events-none">

          <div className="lg:tw-w-1/2 lg:tw-pr-24 tw-flex tw-flex-col lg:tw-flex-grow lg:tw-items-start tw-mb-8 lg:tw-mb-0 tw-items-center tw-text-center lg:tw-text-left">

            <h1
              className={clsx(
                styles.heroTitle,
                "tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-mb-4"
              )}
            >
              <span className="tw-text-black dark:tw-text-white">Community </span>
              <span className="tw-text-black dark:tw-text-cyan-300">Impact</span>
            </h1>

            <p className="tw-mb-8 tw-leading-relaxed tw-text-lg">
              We are committed to providing infrastructure support to CIROH consortium partners and members to advance their research. Our impact spans across various cloud platforms and resources. Here's an overview of our contributions:
            </p>

            {/* BUTTONS (re-enable pointer events) */}
            <div className="tw-flex tw-justify-center tw-pointer-events-auto">

              <Link
                                className={`tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-border-2 tw-outline tw-outline-cyan-500 tw-text-cyan-600 hover:tw-bg-cyan-500 hover:tw-text-black dark:tw-outline-cyan-500 dark:tw-text-cyan-300 dark:hover:tw-bg-cyan-500 dark:hover:tw-text-black`}
                                href="/docs/products/ngiab-ecosystem/ngiab/office-hours"
                                style={{ textDecoration: "none", marginRight: "10px" }}
                              >
                                Get Involved
                              </Link>
            </div>
          </div>

          {/* CARD SWAP SECTION (note: respective versions are bound to reduced motion mode */}
          <div className="lg:tw-max-w-xl md:tw-w-5/6 lg:tw-w-full tw-pointer-events-auto">
            <div className="tw-relative tw-h-[360px] lg:tw-h-[600px] base-motion">
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={true}
              >
                {cardSwapEntries.map(card => {
                  return (
                    <Card key={card.key}>
                      <h3 className="tw-text-white"> {card.icon} {card.title} </h3>
                      <p> {card.body} </p>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
            <div className="tw-relative tw-h-[360px] lg:tw-h-[600px] reduced-motion">
                <CardSwapAccessible cards={cardSwapEntries} />
            </div>
          </div>

        </div>
      </section>

      <CloudInfraDashboard cards={cards} />

      {/* <hr className={styles.sectionDivider} /> */}
      <BlogFilter />
    </div>
  );
}