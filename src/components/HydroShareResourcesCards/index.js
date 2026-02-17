import React, { useEffect, useRef, useState } from 'react';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { FaGraduationCap } from 'react-icons/fa';
import { IoTvOutline } from 'react-icons/io5';
import { LuLayers3 } from 'react-icons/lu';
import { HiOutlineGlobeAlt, HiOutlineUserGroup } from 'react-icons/hi';

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
        <span className="tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-white/30 tw-bg-white/20 tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-white dark:tw-border-cyan-500/20 dark:tw-bg-cyan-500/10 dark:tw-text-cyan-300">
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
            className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-white/15 tw-p-2 tw-text-white hover:tw-text-cyan-300 dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-bg-white/25 dark:hover:tw-bg-slate-700 hover:tw-border-cyan-400 dark:hover:tw-border-cyan-500/40 tw-transition tw-shadow-sm hover:tw-shadow-md"
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
            className="tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-white/20 tw-bg-white/15 tw-p-2 tw-text-white hover:tw-text-cyan-300 dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-bg-white/25 dark:hover:tw-bg-slate-700 hover:tw-border-cyan-400 dark:hover:tw-border-cyan-500/40 tw-transition tw-shadow-sm hover:tw-shadow-md"
        >
            {children}
        </button>
    );
}

export function ResourceCard({ resource, defaultImage }) {
    const placeholder = isPlaceholder(resource);
    const [showEmbed, setShowEmbed] = useState(false);
    const [embedSrc, setEmbedSrc] = useState(null);
    const objectUrlRef = useRef(null);

    const title = resource?.title || 'Untitled';
    const description = resource?.description || '';
    const authors = splitAuthors(resource?.authors);

    const thumbnailUrl = resource?.thumbnail_url || defaultImage;
    const pageUrl = resource?.page_url;
    const docsUrl = resource?.docs_url;
    const resourceUrl = resource?.resource_url;
    const embedUrl = resource?.embed_url;
    const resourceType = resource?.resource_type;

    useEffect(() => {
        if (!showEmbed || !embedUrl) {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setEmbedSrc(null);
            return;
        }

        let cancelled = false;
        fetch(embedUrl)
            .then(r => r.blob())
            .then(blob => {
                if (cancelled) return;
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                }
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setEmbedSrc(url);
            })
            .catch(() => {
                if (!cancelled) setEmbedSrc(null);
            });

        return () => {
            cancelled = true;
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [showEmbed, embedUrl]);

    useEffect(() => {
        if (!showEmbed) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowEmbed(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showEmbed]);

    return (
        <>
            <article
                id={resource?.resource_id}
                className="tw-group tw-flex tw-h-full tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border-2 tw-border-slate-400 dark:tw-border-slate-500 tw-bg-slate-100 dark:tw-bg-slate-900 tw-shadow-md hover:tw-shadow-xl hover:tw-border-cyan-500 tw-transition"
            >
            <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-4 tw-p-5">
                <div className="tw-flex tw-items-start tw-gap-4">
                    <div className="tw-relative tw-shrink-0 tw-w-16 tw-h-16 sm:tw-w-20 sm:tw-h-20 tw-rounded-lg tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
                        {placeholder ? (
                            <div className="tw-h-full tw-w-full tw-animate-pulse tw-bg-slate-200 dark:tw-bg-slate-800" />
                        ) : thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={title}
                                className="tw-h-full tw-w-full tw-object-fill"
                                loading="lazy"
                            />
                        ) : (
                            <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-text-slate-400 dark:tw-text-slate-500">
                                <LuLayers3 size={28} />
                            </div>
                        )}
                    </div>

                    <div className="tw-min-w-0 tw-flex-1">
                        {placeholder ? (
                            <div className="tw-space-y-3">
                                <div className="tw-h-5 tw-w-2/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                                <div className="tw-h-4 tw-w-1/3 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                            </div>
                        ) : (
                            <>
                                <h3 className="tw-text-base sm:tw-text-lg tw-font-semibold tw-leading-snug tw-text-slate-900 dark:tw-text-white tw-line-clamp-2">
                                    {pageUrl || resourceUrl ? (
                                        <a
                                            href={pageUrl || resourceUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="tw-no-underline hover:tw-text-cyan-700 dark:hover:tw-text-cyan-300"
                                        >
                                            {title}
                                        </a>
                                ) : (
                                    title
                                )}
                            </h3>
                            </>
                        )}
                    </div>
                </div>

                {placeholder ? (
                    <div className="tw-h-4 tw-w-1/2 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                ) : (
                    authors.length > 0 && (
                        <div className="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-text-slate-600 dark:tw-text-slate-300 tw-whitespace-normal tw-break-words">
                            <span className="tw-mt-[1px] tw-shrink-0 tw-text-slate-500 dark:tw-text-slate-400" aria-hidden="true">
                                <HiOutlineUserGroup size={16} />
                            </span>
                            <span>
                                {authors.join(' • ')}
                            </span>
                        </div>
                    )
                )}

                {placeholder ? (
                    <div className="tw-space-y-3">
                        <div className="tw-h-4 tw-w-full tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                        <div className="tw-h-4 tw-w-5/6 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                        <div className="tw-h-4 tw-w-3/4 tw-animate-pulse tw-rounded tw-bg-slate-200 dark:tw-bg-slate-800" />
                    </div>
                ) : (
                    description && (
                        <p className="tw-text-sm tw-leading-relaxed tw-text-slate-600 dark:tw-text-slate-300 tw-line-clamp-6">
                            {description}
                        </p>
                    )
                )}
            </div>

            <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-t tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-blue-800 dark:tw-bg-slate-800 tw-px-5 tw-py-3">
                <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {resourceType && !placeholder && <StatTag>{resourceType}</StatTag>}
                    {!resourceType && !placeholder && <StatTag>Resource</StatTag>}
                </div>

                <div className="tw-flex tw-items-center tw-gap-2">
                    <ActionLink href={pageUrl} title="Website">
                        <LiaExternalLinkSquareAltSolid size={18} />
                    </ActionLink>
                    <ActionLink href={docsUrl} title="Learning / Docs">
                        <FaGraduationCap size={16} />
                    </ActionLink>
                    <ActionLink href={resourceUrl} title="HydroShare Resource">
                        <HiOutlineGlobeAlt size={18} />
                    </ActionLink>
                    {embedUrl && (
                        <ActionButton
                            onClick={(e) => {
                                e.preventDefault();
                                setShowEmbed(true);
                            }}
                            title="View PDF"
                        >
                            <IoTvOutline size={18} />
                        </ActionButton>
                    )}
                </div>
            </div>
            </article>

            {showEmbed && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/70 tw-backdrop-blur-sm"
                    onClick={() => setShowEmbed(false)}
                >
                    <div
                        className="tw-relative tw-h-[85vh] tw-w-[92vw] tw-max-w-5xl tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowEmbed(false)}
                            aria-label="Close PDF"
                            className="tw-absolute tw-right-3 tw-top-3 tw-z-10 tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-full tw-bg-slate-900/70 tw-text-white hover:tw-bg-slate-900"
                        >
                            ×
                        </button>
                        <div className="tw-h-full tw-w-full tw-p-4">
                            {embedSrc ? (
                                <embed
                                    src={embedSrc}
                                    type="application/pdf"
                                    className="tw-h-full tw-w-full tw-rounded-lg"
                                />
                            ) : (
                                <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-lg tw-bg-slate-100 dark:tw-bg-slate-800">
                                    Loading PDF...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function HydroShareResourcesCards({ resources, defaultImage }) {
    return (
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 2xl:tw-grid-cols-3 tw-gap-6">
            {resources.map(resource => (
                <ResourceCard
                    key={resource.resource_id}
                    resource={resource}
                    defaultImage={defaultImage}
                />
            ))}
        </div>
    );
}
