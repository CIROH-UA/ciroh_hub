import styles from "../styles.module.css";
import "./cta-1.css";
import "./cta-2.css";
import Link from '@docusaurus/Link';
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function OfficeHoursFeature() {
    return (
        <>
            {/* Image */}
            <section
            className={`bsb-cta-2 py-5 ${styles.features}`}
            style={{
                width: "100%", // Ensure the section spans the full width
                margin: 0, // Remove default margin
                padding: 0, // Remove default padding if necessary
            }}
            >
                <div
                    className="card rounded-3 overflow-hidden text-center bsb-overlay"
                    style={{
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('./img/graphics/research-image.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "local",
                    width: "100%", // Ensure the card spans the full width
                    margin: 0, // Remove default margin
                    padding: 0, // Remove default padding if necessary
                    "--bsb-overlay-opacity": ".9",
                    "--bsb-overlay-bg-color": "var(--bs-primary-rgb)",
                    }}
                >
                </div>
            </section>

            {/* Text section */}
            <section className="tw-body-font tw-rounded-2xl tw-py-24 tw-relative tw-overflow-hidden">

                {/* Theme-aware text color override */}
                <style>{`
                  [data-theme='light'] .office-hours-section { color: #000000; }
                  [data-theme='dark'] .office-hours-section { color: #ffffff; }
                `}</style>

                {/* Soft gradient overlay */}
                <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-blue-50/50 dark:tw-from-slate-800/40 tw-to-transparent tw-pointer-events-none"></div>

                <div className="tw-container tw-mx-auto tw-flex tw-px-5 md:tw-flex-row tw-flex-col tw-items-center tw-relative tw-z-10">

                    {/* IMAGE */}
                    <div className="lg:tw-max-w-lg lg:tw-w-full md:tw-w-1/2 tw-w-5/6 tw-mb-10 md:tw-mb-0 tw-rounded-2xl tw-shadow-2xl tw-animate-fade-in-scale">
                    <img
                        className="tw-object-cover tw-object-center tw-rounded-2xl"
                        alt="hero"
                        src={useBaseUrl("/img/graphics/office_hours.jpeg")}
                    />
                    </div>

                    {/* TEXT BLOCK */}
                    <div className="lg:tw-flex-grow md:tw-w-1/2 lg:tw-pl-24 md:tw-pl-16 tw-flex tw-flex-col md:tw-items-start md:tw-text-left tw-items-center tw-text-center office-hours-section">

                    <h1 className="tw-title-font sm:tw-text-4xl tw-text-3xl tw-mb-4 tw-font-extrabold tw-text-black dark:tw-text-white">
                        <br className="tw-hidden lg:tw-inline-block" />
                        Community NextGen Monthly Office Hours
                    </h1>

                    <p className="tw-mb-8 tw-leading-relaxed tw-text-slate-700 dark:tw-text-gray-300">
                        Advancing hydrological science through{" "}
                        <span className="tw-text-cyan-600 dark:tw-text-cyan-300 tw-font-semibold">innovation</span>,{" "}
                        <span className="tw-text-cyan-600 dark:tw-text-cyan-300 tw-font-semibold">collaboration</span>, and{" "}
                        <span className="tw-text-cyan-600 dark:tw-text-cyan-300 tw-font-semibold">technology development</span>.
                    </p>

                    {/* BUTTONS */}
                    <div className="tw-flex tw-justify-center tw-gap-4">
                        <Link
                        className={`button tw-inline-flex tw-text-black tw-bg-cyan-500 tw-border-0 
                        tw-py-3 tw-px-8 tw-rounded-lg tw-text-lg tw-font-semibold
                        hover:tw-bg-cyan-600 tw-transition-colors
                        dark:tw-bg-cyan-500 dark:tw-text-black dark:hover:tw-bg-cyan-600`}
                        href="/docs/products/ngiab/office-hours"
                        style={{ textDecoration: "none", marginRight: "10px" }}
                        >
                        Learn More
                        </Link>

                    </div>

                    </div>
                </div>
            </section>
        </>
    );
}