import Link from "@docusaurus/Link";
import { communityImpactData } from '@site/src/data/communityImpactData';

export default function InfrastructureFeature() {

    // ---------- PAGE CONTENT ----------
    return (
        <section className="tw-relative tw-overflow-hidden tw-py-24 tw-bg-slate-100 dark:tw-bg-slate-900 tw-text-blue-800 dark:tw-text-white tw-rounded-2xl tw-no-underline">
          <div className="tw-container tw-mx-auto tw-flex tw-px-5 tw-items-center tw-justify-center tw-flex-col tw-relative tw-z-10">

            <div className="tw-text-center tw-lg:w-2/3 tw-w-full">
              <span className="tw-bg-blue-100 dark:tw-bg-blue-900/40 tw-text-blue-800 dark:tw-text-blue-300 
                      tw-text-sm tw-font-semibold tw-px-4 tw-py-1.5 tw-rounded-full">
                Research to Operations Hybrid Cloud
              </span>

              <h2 className="tw-text-5xl md:tw-text-6xl tw-font-extrabold tw-mb-6 tw-mt-4">
                CIROH R2OHC
              </h2>

              <p className="tw-text-xl tw-max-w-2xl tw-text-slate-700 dark:tw-text-gray-300 tw-mx-auto">
                CIROH's rich ecosystem of cloud-based and on-premises services empowers researchers to{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">expand the capabilities</span>{" "}
                of water modeling and forecasting.
              </p>

              <div className="tw-mt-12 tw-grid tw-grid-cols-4 md:tw-grid-cols-4 lg:tw-grid-cols-6 tw-gap-6 tw-max-w-5xl tw-mx-auto tw-items-center">

                {/* Note: double-width grid is used to allow centering of elements for prime list size */}

                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-2">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    104
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    TOTAL PROJECTS
                  </div>
                </div>

                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-2">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {communityImpactData.aws.projects}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    AWS PROJECTS
                  </div>
                </div>

                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-2">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {communityImpactData.gcp.projects}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    GCP + 2i2c-JUPYTERHUB PROJECTS
                  </div>
                </div>

                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-2 lg:tw-col-start-2">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {communityImpactData.hpc.projects}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    PANTARHEI/WUKONG HPC PROJECTS
                  </div>
                </div>

                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-2 tw-col-start-2 lg:tw-col-start-4">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {communityImpactData.nsf.projects}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    NSF ACCESS PROJECTS
                  </div>
                </div>

              </div>

              <div className="tw-mt-12 tw-grid tw-grid-cols-1 md:tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 tw-max-w-5xl tw-mx-auto">
                <Link class="button button--active button--primary" to="/impact">Explore Community Impact</Link>
                <Link class="button button--active button--primary" to="/docs/services/intro">Request IT Access</Link>
              </div>
              
            </div>
          </div>
        </section>
    )
}
