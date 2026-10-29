import React, { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { FaWindowClose } from 'react-icons/fa';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';
import "../HomepageFeatures/bootstrap.min.css";

/**
 * ModalImageViewer component to display a modal with a main image and thumbnails that can be clicked to change the main image.
 * @param {boolean} open - Whether the modal is open or not.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {string} title - Title to display at the top of the modal.
 * @param {string[]} images - Array of image URLs to display in the modal and as thumbnails.
 * @param {string} indicatorColorLight - Color of the indicator in light mode. Defaults to '#1D4ED8' (blue).
 * @param {string} indicatorColorDark - Color of the indicator in dark mode. Defaults to '#FFFFFF' (white).
 */
export default function ModalImageViewer({ open, onClose, title, images, indicatorColorLight = '#1D4ED8', indicatorColorDark = '#FFFFFF' }) {
    const { colorMode } = useColorMode();                                           // Active site theme ('light' or 'dark')
    const indicatorColor = colorMode === 'dark' ? indicatorColorDark : indicatorColorLight;
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);                // Index of the currently selected image (within validImages)
    const [indicatorRect, setIndicatorRect] = useState({});                         // State to hold the position and size of the selected image indicator
    const [enableTransition, setEnableTransition] = useState(false);                // State to control transition animation for indicator
    const [loadedUrls, setLoadedUrls] = useState(new Set());                        // URLs whose <img> has fired onLoad
    const [failedUrls, setFailedUrls] = useState(new Set());                        // URLs whose <img> has fired onError — filtered out of validImages
    const imageRefs = useRef([]);                                                   // Refs to thumbnail elements for indicator positioning

    // Images filtered to those that haven't failed to load. Drives every
    // render path so broken thumbnails simply disappear from the UI.
    const validImages = images.filter((url) => !failedUrls.has(url));
    const allValidLoaded = validImages.length > 0 && validImages.every((url) => loadedUrls.has(url));

    // Record a successful image load.
    const handleImageLoad = (url) => {
        setLoadedUrls((prev) => {
            if (prev.has(url)) return prev;
            const next = new Set(prev);
            next.add(url);
            return next;
        });
    };

    // Record a failed image load and remove the URL from the gallery.
    const handleImageError = (url) => {
        setFailedUrls((prev) => {
            if (prev.has(url)) return prev;
            const next = new Set(prev);
            next.add(url);
            return next;
        });
    };

    /**
     * Updates the indicator rectangle to match the position and size of the image with the given index using an animation.
     * @param {number} imageIndex - Index of the image to highlight.
     */
    function imageSelectedIndicatorUpdate(imageIndex)
    {
        // Get the image element for the given index
        const image = imageRefs.current[imageIndex];

        // If the image exists, calculate its position and size, and update the indicator state
        if (image)
        {
            // Calculate the image's position and size relative to its parent container
            const rect = image.getBoundingClientRect();
            const parentRect = image.parentNode.getBoundingClientRect();

            // Enable transition for animated updates
            setEnableTransition(true);

            // Update the indicator size and position to match the selected image
            setIndicatorRect({
                left: image.offsetLeft + "px",
                top: rect.top - parentRect.top + "px",
                width: rect.width + "px",
                height: rect.height + "px",
            });
        }
    }

    /**
     * Updates the indicator rectangle to match the position and size of the image with the given index immediately.
     * @param {number} imageIndex - Index of the image to highlight.
     */
    function imageSelectedIndicatorUpdateImmediate(imageIndex)
    {
        // Get the image element for the given index
        const image = imageRefs.current[imageIndex];

        // If the image exists, calculate its position and size, and update the indicator state
        if (image)
        {
            // Calculate the image's position and size relative to its parent container
            const rect = image.getBoundingClientRect();
            const parentRect = image.parentNode.getBoundingClientRect();

            // Disable transition for immediate updates
            setEnableTransition(false);

            // Update the indicator size and position to match the selected image
            setIndicatorRect({
                left: image.offsetLeft + "px",
                top: rect.top - parentRect.top + "px",
                width: rect.width + "px",
                height: rect.height + "px",
            });
        }
    }

    // Set the size and position of the indicator once all valid images have loaded
    useEffect(() => {
        if (allValidLoaded)
        {
            // Make the indicator visible
            const indicator = document.getElementById('selected-image-indicator');
            if (indicator)
            {
                indicator.classList.remove('tw-invisible');
            }

            // Set the indicator position and size to match the selected image
            imageSelectedIndicatorUpdate(selectedImageIndex);
        }
    }, [allValidLoaded, selectedImageIndex]);

    // If the selected index lands past the end of validImages (because an
    // image at or before it failed), clamp it to the last valid position.
    useEffect(() => {
        if (validImages.length === 0) return;
        if (selectedImageIndex >= validImages.length)
        {
            setSelectedImageIndex(validImages.length - 1);
        }
    }, [validImages.length, selectedImageIndex]);

    // Update indicator position and size when selected image changes and show the spinner until the new selected image has loaded
    useEffect(() => {
        // Don't do anything if the modal isn't open
        if (!open) return;

        // Update the indicator position and size to match the newly selected image
        imageSelectedIndicatorUpdate(selectedImageIndex);

        // Show the loading spinner for the newly selected image until it has loaded
        const selectedImageLoader = document.getElementById('selected-image-loader');
        if (selectedImageLoader) selectedImageLoader.style.display = 'block';
    }, [selectedImageIndex, open, images]);

    // Update indicator position and size on window resize to ensure it stays aligned with the selected thumbnail
    useEffect(() => {
        function handleResize() {
            // Set size and position of the indicator
            imageSelectedIndicatorUpdateImmediate(selectedImageIndex);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedImageIndex]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (open)
        {
            document.body.style.overflow = 'hidden';
        }
        else
        {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            setLoadedUrls(new Set());
            setFailedUrls(new Set());
            setSelectedImageIndex(0);
        };
    }, [open]);

    // Dismiss the modal when the user presses Escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    // Don't render the modal at all if it's not open
    if (!open) return null;

    // Render the modal as a portal to ensure it appears outside its parent
    return ReactDOM.createPortal(
        // Modal Backdrop
        <div className={`tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/60 ${styles.modalBelowNavbar}`}>
            {/* Modal Background */}
            <div className="tw-flex tw-flex-col tw-gap-y-2 tw-bg-slate-100 dark:tw-bg-slate-900 tw-rounded-lg tw-shadow-lg tw-p-6 tw-relative tw-w-full tw-h-full">
                
                {/* Close Button Container */}
                <div className="tw-flex tw-justify-end tw-w-full tw-h-auto">
                    {/* Close button */}
                    <button
                        className="tw-absolute tw-top-4 tw-right-4 tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-400 tw-bg-white/80 tw-p-2 tw-text-slate-700 hover:tw-text-cyan-700 hover:tw-border-cyan-600 dark:tw-border-slate-600 dark:tw-bg-slate-700/50 dark:tw-text-slate-300 dark:hover:tw-text-cyan-300 hover:tw-shadow-md tw-transition"
                        onClick={onClose}
                    >
                        <FaWindowClose />
                    </button>
                </div>

                {/* Modal title */}
                <h2 className="tw-text-lg tw-font-bold tw-self-center tw-mb-0 tw-text-cyan-700 dark:tw-text-cyan-300">{title}</h2>

                {/* Selected Image Container */}
                <div className="tw-flex tw-flex-col tw-flex-1 tw-min-h-0 tw-w-full tw-h-4/5 tw-items-center tw-justify-center tw-gap-4">
                    { validImages[selectedImageIndex] ? (
                        <div className="tw-relative tw-w-full tw-h-full tw-min-h-0">
                            {/* Selected Image */}
                            <img
                                src={validImages[selectedImageIndex]}
                                alt="Selected"
                                className="tw-w-full tw-h-full tw-max-h-full tw-min-h-0 tw-object-contain tw-rounded"
                                onLoad={() => {
                                    handleImageLoad(validImages[selectedImageIndex]);
                                    const loader = document.getElementById('selected-image-loader');
                                    if (loader) loader.style.display = 'none';
                                }}
                                onError={() => handleImageError(validImages[selectedImageIndex])}
                            />
                            {/* Loading Wheel */}
                            <div id="selected-image-loader" className="tw-absolute tw-inset-0 tw-z-10 tw-pointer-events-none">
                                <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
                                    <span className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : <h1 className="tw-flex tw-text-center tw-text tw-text-[#2F455C] dark:tw-text-[#B8C7D9]">Images Not Available</h1>}
                </div>

                {/* Thumbnail Images Row */}
                <div className="tw-flex tw-overflow-x-auto tw-overflow-y-hidden">
                    {/* Inner container for centering */}
                    <div className="tw-flex tw-flex-row tw-gap-2 tw-relative tw-mx-auto">

                        {/* Image Selected Indicator */}
                        <div
                            id='selected-image-indicator'
                            className={
                                `tw-absolute pointer-events-none tw-border-solid tw-border-8 tw-rounded-lg` +
                                (enableTransition ? ' tw-transition-all tw-duration-300 tw-ease-in-out' : '') +
                                (allValidLoaded ? '' : ' tw-invisible')
                            }
                            style={{
                                borderColor: indicatorColor,
                                left: indicatorRect.left,
                                top: indicatorRect.top,
                                width: indicatorRect.width,
                                height: indicatorRect.height,
                                zIndex: 1,
                            }}
                        />

                        {/* Thumbnail Images — broken ones are filtered out via validImages */}
                        {validImages.map((src, idx) => (
                            <div className="tw-relative tw-flex tw-items-center tw-justify-center tw-gap-x-1 tw-min-w-32 tw-bg-slate-300 dark:tw-bg-slate-800"
                            key={src}
                            ref={el => imageRefs.current[idx] = el}
                            onClick={() => setSelectedImageIndex(idx)}
                            >
                                {/* Show loading indicator until image is loaded */}
                                {!loadedUrls.has(src) && (
                                    <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-slate-200/80 dark:tw-bg-slate-700/80 tw-z-10">
                                        {/* Spinning Wheel */}
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Thumbnail Image */}
                                <img
                                    src={src}
                                    alt={`Gallery ${idx}`}
                                    className="tw-flex tw-max-h-32 tw-h-auto tw-w-auto tw-rounded tw-object-contain"
                                    onLoad={() => handleImageLoad(src)}
                                    onError={() => handleImageError(src)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    , document.body);
}
