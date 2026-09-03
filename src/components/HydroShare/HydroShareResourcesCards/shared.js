function isPlaceholder(resource) {
    return typeof resource?.resource_id === 'string' && resource.resource_id.startsWith('placeholder-');
}

function splitAuthors(authors) {
    if (!authors || typeof authors !== 'string') return [];
    return authors
        .split('🖊')
        .map(a => a.trim())
        .filter(Boolean);
}

function StatTag({ children }) {
    return (
        <span className="tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-white/30 tw-bg-black tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-white dark:tw-border-cyan-500/20 dark:tw-bg-cyan-500/10 dark:tw-text-cyan-300">
            {children}
        </span>
    );
}

function ActionLink({ href, title, children }) {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            title={title}
            className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-white/15 tw-p-2 tw-text-slate-900  dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-bg-white/25 dark:hover:tw-bg-slate-700 hover:tw-border-cyan-400 dark:hover:tw-border-cyan-500/40 tw-transition tw-shadow-sm hover:tw-shadow-md"
        >
            {children}
        </a>
    );
}

function ActionButton({ onClick, title, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-white/15 tw-p-2 tw-text-slate-900  dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-bg-white/25 dark:hover:tw-bg-slate-700 hover:tw-border-cyan-400 dark:hover:tw-border-cyan-500/40 tw-transition tw-shadow-sm hover:tw-shadow-md"
        >
            {children}
        </button>
    );
}

export { isPlaceholder, splitAuthors, StatTag, ActionLink, ActionButton };