import useBaseUrl from "@docusaurus/useBaseUrl";
import { fetchResourcesBySearch } from "@site/src/api/hydroshareAPI";
import { getCommunityResources } from "@site/src/components/HydroShareImporter";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import React, { useState, useRef, useEffect } from 'react';


export default function ResearchFeature() {

    // ---------- ZOTERO API HANDLING ----------
    const { siteConfig } = useDocusaurusContext();
    const zotero_api_key = siteConfig.customFields.zotero_api_key;
    const zotero_group_id = siteConfig.customFields.zotero_group_id;
    const zotero_params = {
      sort: 'date',
      direction: 'desc',
    } // Exact params aren't too important, it's mostly a stub

    // Mirrored from 'fetchTotal' in /src/components/Publications/index.js
    async function zoteroCountPublications(groupId, apiKey, params, keyStr = '') {
      const path = keyStr ? `/collections/${keyStr}/items/top` : '/items/top';

      const url = new URL(`https://api.zotero.org/groups/${groupId}${path}`);
      Object.entries({ ...params, limit: 1 }).forEach(([k, v]) =>
        url.searchParams.append(k, v),
      );

      const resp = await fetch(url.href, { headers: { 'Zotero-API-Key': apiKey } });
      if (!resp.ok) return null;
      const hdr = resp.headers.get('Total-Results');
      return hdr ? Number(hdr) : null;
    }

    // ---------- STATS STATE + KEYWORD-BASED FETCHING ----------
    const [stats, setStats] = useState({
        products: 0,
        datasets: 0,
        presentations: 0,
        courses: 0,
        notebooks: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);

    // Count resources for a single keyword, paging until exhausted
    async function hsCountByKeyword(keyword) {
        let total = 0;
        let page = 1;
        let totalPagesChecked = 0;
        try {
            console.log(`[hsCountByKeyword] Starting count for: ${keyword}`);
            while (true) {
                const results = await fetchResourcesBySearch(
                keyword,
                "",         // searchText
                false,      // ascending
                "modified", // sortBy
                undefined,  // author
                page
                );

                // Support wrappers that return array or { resources: [...] }
                const items = Array.isArray(results) ? results : (results?.resources || []);

                console.log(`[hsCountByKeyword] Page ${page}: ${items.length} items returned for ${keyword}`);
                totalPagesChecked++;

                if (!items || items.length === 0) {
                    console.log(`[hsCountByKeyword] No more items on page ${page}, stopping`);
                    break;
                }

                total += items.length;

                // stop when a page is short (no more pages)
                if (items.length < 40) {
                    console.log(`[hsCountByKeyword] Short page (${items.length} < 40), stopping`);
                    break;
                }
                page++;
            }
            console.log(`[hsCountByKeyword] ${keyword}: Total ${total} resources across ${totalPagesChecked} pages`);
        } catch (err) {
            console.error(`[hsCountByKeyword] ${keyword} error after ${totalPagesChecked} pages:`, err);
            throw err;
        }
        return total;
    }

    // Count community resources (matches datasets page behavior)
    async function hsCountCommunityResources(keyword, communityId = "4") {
        let page = 1;
        let totalPagesChecked = 0;
        const resourceIds = new Set();
        try {
            console.log(`[hsCountCommunityResources] Starting count for: ${keyword}`);
            while (true) {
                const response = await getCommunityResources(
                  keyword,
                  communityId,
                  undefined,  // fullTextSearch
                  false,      // ascending
                  "modified", // sortBy
                  undefined,  // author
                  page,
                  40          // pageSize
                );

                const items = response?.resources || [];
                totalPagesChecked++;

                items.forEach((item) => {
                    if (item?.resource_id) {
                        resourceIds.add(item.resource_id);
                    }
                });

                const hasMorePages = Boolean(
                    response?.groupResourcesPageData?.hasMorePages ||
                    response?.extraResourcesPageData?.hasMorePages
                );

                console.log(`[hsCountCommunityResources] Page ${page}: ${items.length} items returned for ${keyword}`);

                if (!hasMorePages || items.length === 0) {
                    console.log(`[hsCountCommunityResources] No more items on page ${page}, stopping`);
                    break;
                }
                page++;
            }
            console.log(`[hsCountCommunityResources] ${keyword}: Total ${resourceIds.size} resources across ${totalPagesChecked} pages`);
        } catch (err) {
            console.error(`[hsCountCommunityResources] ${keyword} error after ${totalPagesChecked} pages:`, err);
            throw err;
        }
        return resourceIds.size;
    }

    // Fetch all stats in parallel
    async function loadKeywordStats() {
        setStatsLoading(true);
        setStatsError(null);
        try {
            const datasetKeyword = "ciroh_portal_data,ciroh_hub_data";
            const communityDatasetKeyword = datasetKeyword.split(",")[0].trim();

            const [datasets, presentationsOld, coursesOld, productsOld, presentations, courses, products, notebooks, publications] = await Promise.all([
                hsCountCommunityResources(communityDatasetKeyword, "4"),
                hsCountByKeyword("ciroh_portal_presentation"),
                hsCountByKeyword("nwm_portal_module"),
                hsCountByKeyword("nwm_portal_app"),
                hsCountByKeyword("ciroh_hub_presentation"),
                hsCountByKeyword("ciroh_hub_module"),
                hsCountByKeyword("ciroh_hub_app"),
                hsCountByKeyword("ciroh_hub_notebook"),
                zoteroCountPublications(zotero_group_id, zotero_api_key, zotero_params),
            ]);

            setStats({
                products: productsOld + products,
                datasets: datasets,
                presentations: presentationsOld + presentations,
                courses: coursesOld + courses,
                publications: publications,
                notebooks: notebooks,
            });
        } catch (err) {
            setStatsError(err?.message || String(err));
            // reset to safe defaults on error
            setStats({ products: 0, datasets: 0, presentations: 0, courses: 0, notebooks: 0 });
        } finally {
            setStatsLoading(false);
        }
    }

    // Load on mount
    useEffect(() => {
        loadKeywordStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- PAGE CONTENT ----------
    return (
        <section className="tw-relative tw-overflow-hidden tw-py-24 tw-bg-slate-100 dark:tw-bg-slate-900 tw-text-blue-800 dark:tw-text-white tw-rounded-2xl tw-no-underline">
          <div className="tw-container tw-mx-auto tw-flex tw-px-5 tw-items-center tw-justify-center tw-flex-col tw-relative tw-z-10">

            <div className="image-container tw-lg:w-2/6 tw-md:w-3/6 tw-w-5/6 tw-mb-16 tw-rounded-2xl tw-shadow-2xl tw-animate-fade-in-scale">
              <img
                src={useBaseUrl("/img/graphics/OurResearch.png")}
                alt="research hero"
                className="tw-w-full tw-object-cover tw-object-center tw-rounded-2xl"
              />
            </div>

            <div className="tw-text-center tw-lg:w-2/3 tw-w-full">
              <span className="tw-bg-blue-100 dark:tw-bg-blue-900/40 tw-text-blue-800 dark:tw-text-blue-300 
                      tw-text-sm tw-font-semibold tw-px-4 tw-py-1.5 tw-rounded-full">
                Innovation & Discovery
              </span>

              <h2 className="tw-text-5xl md:tw-text-6xl tw-font-extrabold tw-mb-6 tw-mt-4">
                CIROH's Research
              </h2>

              <p className="tw-text-xl tw-max-w-2xl tw-text-slate-700 dark:tw-text-gray-300 tw-mx-auto">
                The CIROH community's research advances hydrological science through{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">innovation</span>,{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">collaboration</span>, and{" "}
                <span className="tw-text-blue-700 dark:tw-text-cyan-400 tw-font-semibold">technology development</span>.
              </p>

              {/* ---------- KEYWORD-BASED STATS ---------- */}
              <div className="tw-mt-12 tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-3 tw-gap-6 tw-max-w-5xl tw-mx-auto">

                {/* PRODUCTS (APPLICATIONS) */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.products}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    APPLICATIONS
                  </div>
                </div>

                {/* DATASETS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.datasets}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    DATASETS
                  </div>
                </div>

                {/* PRESENTATIONS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.presentations}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    PRESENTATIONS
                  </div>
                </div>

                {/* NOTEBOOKS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.publications}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    PUBLICATIONS
                  </div>
                </div>

                {/* NOTEBOOKS */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.notebooks}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    NOTEBOOKS
                  </div>
                </div>

                {/* COURSES */}
                <div className="tw-text-center tw-p-6 tw-bg-white dark:tw-bg-slate-800 tw-rounded-2xl tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow tw-col-span-1">
                  <div className="tw-text-4xl tw-font-bold tw-text-black dark:tw-text-cyan-300">
                    {statsLoading ? <span className="tw-animate-ping">...</span> : stats.courses}
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-font-semibold tw-text-gray-700 dark:tw-text-gray-300">
                    COURSES
                  </div>
                </div>


              </div>

              {/* small error hint */}
              {statsError && (
                <div className="tw-mt-4 tw-text-sm tw-text-red-600">
                  Error loading stats: {statsError}
                </div>
              )}

            </div>
          </div>
        </section>
    )
}
