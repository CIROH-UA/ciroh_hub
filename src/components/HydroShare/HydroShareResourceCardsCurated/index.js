import { useEffect, useRef, useState } from 'react';
import { LiaExternalLinkSquareAltSolid } from 'react-icons/lia';
import { FaGraduationCap, FaRegImage } from 'react-icons/fa';
import { IoTvOutline } from 'react-icons/io5';
import { HiOutlineGlobeAlt, HiOutlineUserGroup } from 'react-icons/hi';
import styles from './styles.module.css';
import { isPlaceholder, splitAuthors, StatTag, ActionLink, ActionButton } from '@site/src/components/HydroShare/HydroShareResourcesCards/shared';
import ModalImageViewer from '@site/src/components/ModalImageViewer';


export default function ResourceCardCurated({ resource, defaultImage }) {
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
    const resourceImages = resource?.images || [];

    const [showImageModal, setShowImageModal] = useState(false);

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
            {/* Card Container */}
            <article className="tw-flex sm:tw-h-80 tw-rounded-xl tw-shadow-md tw-bg-slate-100 dark:tw-bg-slate-900">

                {/* Content Container */}
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-w-full">

                    {/* Image Container */}
                    <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-48 sm:tw-w-72 sm:tw-h-full tw-rounded-xl tw-bg-slate-100 dark:tw-bg-slate-900">
                        {/* Image Background */}
                        { placeholder ? (
                            <div className="tw-relative tw-flex tw-items-center tw-justify-center tw-w-[80%] tw-h-[80%] tw-rounded-xl tw-bg-slate-200 dark:tw-bg-slate-800 tw-animate-pulse">
                                {/* Animate the image background with a pulse to indicate loading */}
                            </div>
                        ) : (
                            <div className="tw-relative tw-flex tw-items-center tw-justify-center tw-w-[80%] tw-h-[80%] tw-rounded-xl dark:tw-bg-slate-800" onClick={() => setShowImageModal(true)}>
                                {/* Image */}
                                <img
                                    src={thumbnailUrl}
                                    alt={`${title} thumbnail`}
                                    className="tw-w-full tw-h-full tw-object-contain tw-rounded-md tw-p-8 dark:tw-bg-slate-800"
                                />

                                {/* Open Image Viewer Icon */}
                                <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-black/50 tw-opacity-0 hover:tw-opacity-100 tw-transition-opacity tw-text-white">
                                    <FaRegImage size={40} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vertical Divider */}
                    <div className="tw-hidden sm:tw-block tw-w-[2px] tw-bg-slate-200 dark:tw-bg-slate-800"></div>

                    {/* Details & Links Container */}
                    <div className="tw-flex tw-flex-col tw-flex-1 tw-min-h-0 tw-pt-4 tw-relative tw-rounded-xl">
            
                        {/* Title Authors Description Container */}
                        <div className="tw-flex tw-flex-1 tw-flex-col tw-min-h-0 tw-pl-4 tw-pr-4">
                            {/* Title */}
                            { placeholder ? (
                                <div className="tw-w-full tw-h-7 tw-rounded-md tw-mt-3 tw-bg-slate-200 dark:tw-bg-slate-800 tw-animate-pulse"></div>
                            ) : (
                                <h3 className="tw-text-base sm:tw-text-lg tw-font-semibold tw-leading-snug tw-mt-3 tw-mb-0 tw-text-slate-900 dark:tw-text-white tw-line-clamp-2">
                                    {pageUrl || resourceUrl ? (
                                        <a
                                            href={pageUrl || resourceUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={title}
                                            className="tw-no-underline tw-text-black hover:tw-text-cyan-700 dark:tw-text-white dark:hover:tw-text-cyan-300"
                                        >
                                            {title}
                                        </a>
                                    ) : (
                                        <div title={title}>{title}</div>
                                    )}
                                </h3>
                            )} 

                            {/* Authors */}
                            { placeholder ? (
                                <div className="tw-w-64 tw-h-7 tw-rounded-md tw-mt-3 tw-mb-3 tw-bg-slate-200 dark:tw-bg-slate-800 tw-animate-pulse"></div>
                            ) : (
                                authors.length > 0 && (
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-mt-3 tw-mb-3 tw-text-slate-600 dark:tw-text-slate-300 tw-whitespace-normal tw-break-words">
                                        <span className="tw-shrink-0 tw-text-slate-500 dark:tw-text-slate-400" aria-hidden="true">
                                            <HiOutlineUserGroup size={16} />
                                        </span>
                                        <span>
                                            {authors.join(' • ')}
                                        </span>
                                    </div>
                                )
                            )}

                            {/* Description */}
                            { placeholder ? (
                                <div className="tw-w-full tw-h-36 tw-rounded-md tw-bg-slate-200 dark:tw-bg-slate-800 tw-animate-pulse"></div>
                            ) : (
                                <div className={`tw-max-h-36 sm:tw-max-h-none tw-flex-1 tw-min-h-0 tw-overflow-y-auto ${styles.curatedScrollbar}`}>
                                    {description && (
                                        <p className="tw-text-sm tw-leading-relaxed tw-text-slate-600 dark:tw-text-slate-300">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Links & Resource Type Container */}
                        <div className="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-w-full tw-rounded-b-xl sm:tw-rounded-bl-none sm:tw-rounded-br-xl tw-bg-cyan-400 dark:tw-bg-slate-800 tw-px-4 tw-py-2 tw-gap-2">
                            {/* Resource Type */}
                            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-justify-start">
                                {resourceType && !placeholder && <StatTag>{resourceType}</StatTag>}
                                {!resourceType && !placeholder && <StatTag>Resource</StatTag>}
                                {placeholder && <div className="tw-inline-flex tw-w-36 tw-h-3 tw-items-center tw-rounded-md tw-border  tw-px-2 tw-py-0.5 tw-text-xs tw-bg-[#4B66BF] dark:tw-border-cyan-500/20 dark:tw-bg-cyan-500/10 tw-animate-pulse"></div>}
                            </div>

                            {/* Links */}
                            <div className="tw-flex tw-justify-end tw-gap-2">
                                { placeholder ? (
                                    <div className="">
                                        {/* Show 3 placeholder link buttons with pulse animation */}
                                        <div className="tw-flex tw-gap-2">
                                            <div className="tw-w-8 tw-h-8 tw-rounded-md tw-bg-[#4B66BF] dark:tw-bg-slate-700 tw-animate-pulse"></div>
                                            <div className="tw-w-8 tw-h-8 tw-rounded-md tw-bg-[#4B66BF] dark:tw-bg-slate-700 tw-animate-pulse"></div>
                                            <div className="tw-w-8 tw-h-8 tw-rounded-md tw-bg-[#4B66BF] dark:tw-bg-slate-700 tw-animate-pulse"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {embedUrl && (
                                            <ActionButton onClick={() => setShowEmbed(true)} title="View Embed">
                                                <IoTvOutline size={20} />
                                            </ActionButton>
                                        )}
                                        {pageUrl && (
                                            <ActionLink href={pageUrl} title="View Page">
                                                <HiOutlineGlobeAlt size={20} />
                                            </ActionLink>
                                        )}
                                        {docsUrl && (
                                            <ActionLink href={docsUrl} title="View Documentation">
                                                <FaGraduationCap size={20} />
                                            </ActionLink>
                                        )}
                                        {resourceUrl && (
                                            <ActionLink href={resourceUrl} title="View Resource">
                                                <LiaExternalLinkSquareAltSolid size={20} />
                                            </ActionLink>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
            <ModalImageViewer className="tw-absolute" open={showImageModal} onClose={() => setShowImageModal(false)} title={title} images={resourceImages} />
        </>
    );
}
