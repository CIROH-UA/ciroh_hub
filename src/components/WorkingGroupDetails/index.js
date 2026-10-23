import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { FiArrowLeft, FiTarget, FiAward, FiPackage, FiUsers } from 'react-icons/fi';

function Section({ icon, title, items, emptyText }) {
  return (
    <section className="tw-mt-8 tw-rounded-2xl tw-border tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/70 dark:tw-bg-slate-900/50 tw-p-6">
      <h2 className="tw-flex tw-items-center tw-gap-2 tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white">
        {icon}
        {title}
      </h2>
      {items?.length ? (
        <ul className="tw-mt-3 tw-space-y-2 tw-pl-5 tw-list-disc tw-text-[15px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
          {items.map((item) => {
            // Items are plain strings, or { title, description, url } objects
            if (typeof item === 'string') return <li key={item}>{item}</li>;
            return (
              <li key={item.title}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer noopener">{item.title}</a>
                ) : (
                  <strong>{item.title}</strong>
                )}
                {item.description ? <> — {item.description}</> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="tw-mt-3 tw-italic tw-text-slate-600 dark:tw-text-slate-400">{emptyText}</p>
      )}
    </section>
  );
}

export default function WorkingGroupDetails({ group }) {
  const annual = group.annual ?? {};
  return (
    <Layout title={group.title} description={group.description}>
      <main className="tw-pb-16">
        <div className="container tw-mt-8 tw-max-w-4xl">
          <Link to="/working-groups" className="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm">
            <FiArrowLeft /> All Working Groups
          </Link>

          <h1 className="tw-mt-4 tw-text-4xl tw-font-black tw-tracking-tight tw-text-slate-900 dark:tw-text-white">
            {group.title}
          </h1>
          {group.description ? (
            <p className="tw-mt-4 tw-text-[16px] tw-leading-relaxed tw-text-slate-700 dark:tw-text-slate-300">
              {group.description}
            </p>
          ) : null}
          {group.leads?.length ? (
            <p className="tw-mt-3 tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-slate-700 dark:tw-text-slate-300">
              <FiUsers /> <strong>Leads:</strong> {group.leads.join('; ')}
            </p>
          ) : null}
          {annual.period ? (
            <p className="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-400">
              Reporting period: {annual.period}{annual.updated ? ` (updated ${annual.updated})` : ''}
            </p>
          ) : null}

          <Section icon={<FiTarget />} title="Objectives" items={annual.objectives} emptyText="Objectives will be posted soon." />
          <Section icon={<FiAward />} title="Accomplishments" items={annual.accomplishments} emptyText="Accomplishments will be posted soon." />
          <Section icon={<FiPackage />} title="Major Products" items={annual.products} emptyText="Major products will be posted soon." />
        </div>
      </main>
    </Layout>
  );
}
