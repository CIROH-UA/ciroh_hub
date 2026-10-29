import React from 'react';
import clsx from 'clsx';

export default function StatsBar({ items, loading = false, className }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={clsx(
        'tw-relative tw-z-20 tw-border-y tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-950 tw-backdrop-blur',
        className,
      )}
    >
      <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-6">
        <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
          {items.map((item, index) => (
            <div key={item?.label ?? index} className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {loading ? <span className="statsLoadingText">...</span> : item?.value}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">
                {item?.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
