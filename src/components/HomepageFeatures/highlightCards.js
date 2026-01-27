import React from 'react';
import './highlightCards.css';
import { useColorMode } from '@docusaurus/theme-common';

export default function HighlightCards() {
    const { colorMode } = useColorMode(); // Detect Docusaurus theme

    return (
        <section className="tw-py-10 tw-px-6">
            <h1 className="tw-text-4xl tw-font-extrabold tw-text-center tw-mb-12
                tw-text-blue-800 dark:tw-text-white">
                Key Highlights
            </h1>

            <div className="tw-container tw-mx-auto tw-max-w-7xl">
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8">

                    {/* Card 1 */}
                    <div className="highlight-card">
                        <div className="card-content">
                            <div className="tw-w-12 tw-h-12 tw-bg-red-500 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mb-4">
                                <svg className="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>

                            <h3 className="tw-text-xl tw-font-bold tw-mb-2">
                                Documentation
                            </h3>
                            <p className="tw-text-gray-700 dark:tw-text-gray-300">
                                Comprehensive guides and technical documentation for all CIROH products and services.
                            </p>
                        </div>

                        {/* Water fill layers */}
                        <div className="water-fill">
                            <div className="water-body"></div>
                            <div className="water-wave wave-1"></div>
                            <div className="water-wave wave-2"></div>

                            {/* Bubbles */}
                            <div className="bubble bubble-1"></div>
                            <div className="bubble bubble-2"></div>
                            <div className="bubble bubble-3"></div>
                            <div className="bubble bubble-4"></div>
                            <div className="bubble bubble-5"></div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="highlight-card">
                        <div className="card-content">
                            <div className="tw-w-12 tw-h-12 tw-bg-yellow-500 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mb-4">
                                <svg className="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>

                            <h3 className="tw-text-xl tw-font-bold tw-mb-2">
                                Community
                            </h3>
                            <p className="tw-text-gray-700 dark:tw-text-gray-300">
                                Join our vibrant community and collaborate with experts across the globe.
                            </p>
                        </div>

                        <div className="water-fill">
                            <div className="water-body"></div>
                            <div className="water-wave wave-1"></div>
                            <div className="water-wave wave-2"></div>
                            <div className="bubble bubble-1"></div>
                            <div className="bubble bubble-2"></div>
                            <div className="bubble bubble-3"></div>
                            <div className="bubble bubble-4"></div>
                            <div className="bubble bubble-5"></div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="highlight-card">
                        <div className="card-content">
                            <div className="tw-w-12 tw-h-12 tw-bg-purple-500 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mb-4">
                                <svg className="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>

                            <h3 className="tw-text-xl tw-font-bold tw-mb-2">
                                Quick Start
                            </h3>
                            <p className="tw-text-gray-700 dark:tw-text-gray-300">
                                Get up and running quickly with our streamlined onboarding process.
                            </p>
                        </div>

                        <div className="water-fill">
                            <div className="water-body"></div>
                            <div className="water-wave wave-1"></div>
                            <div className="water-wave wave-2"></div>
                            <div className="bubble bubble-1"></div>
                            <div className="bubble bubble-2"></div>
                            <div className="bubble bubble-3"></div>
                            <div className="bubble bubble-4"></div>
                            <div className="bubble bubble-5"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
