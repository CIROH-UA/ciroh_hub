import React, { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { FaWindowClose } from 'react-icons/fa';
import styles from './styles.module.css';

/**
 * ModalImageViewer component to display a modal with a main image and thumbnails that can be clicked to change the main image.
 * @param {boolean} open - Whether the modal is open or not.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {string} title - Title to display at the top of the modal.
 * @param {string[]} images - Array of image URLs to display in the modal and as thumbnails.
 */
export default function ModalImageViewer({ open, onClose, title, images }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);    // Index of the currently selected image in the modal
    const [indicatorRect, setIndicatorRect] = useState({});             // State to hold the position and size of the selected image indicator
    const [enableTransition, setEnableTransition] = useState(false);    // State to control transition animation for indicator
    const imageRefs = useRef([]);                                       // Refs to hold references to the thumbnail image elements for calculating indicator position

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

    // Update indicator position and size when selected image changes
    useEffect(() => {
        if (!open) return;
        imageSelectedIndicatorUpdate(selectedImageIndex);
    }, [selectedImageIndex, open, images]);

    // Update indicator position and size on window resize to ensure it stays aligned with the selected thumbnail
    useEffect(() => {
        function handleResize() {
            imageSelectedIndicatorUpdateImmediate(selectedImageIndex);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        };
    }, [open]);

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
                <div className="tw-flex tw-flex-col tw-flex-1 tw-w-full tw-h-4/5 tw-items-center tw-justify-center tw-gap-4">
                    { images[selectedImageIndex] ? (
                         <img
                            src={images[selectedImageIndex]}
                            alt="Selected"
                            className="tw-w-full tw-h-full tw-object-contain tw-rounded"
                        />
                    ) : <h1 className="tw-flex tw-text-center tw-text tw-text-[#2F455C] dark:tw-text-[#B8C7D9]">Images Not Available</h1>}
                </div>

                {/* Thumbnail Images Row */}
                <div className="tw-flex tw-flex-row tw-justify-center tw-gap-2 tw-relative">

                    {/* Image Selected Indicator */}
                    <div
                        className={
                            `tw-absolute pointer-events-none tw-border-solid tw-border-8 tw-border-blue-700 dark:tw-border-white tw-rounded-lg` +
                            (enableTransition ? ' tw-transition-all tw-duration-300 tw-ease-in-out' : '') +
                            (images.length <= 0 ? ' tw-invisible' : '')
                        }
                        style={{
                            left: indicatorRect.left,
                            top: indicatorRect.top,
                            width: indicatorRect.width,
                            height: indicatorRect.height,
                            zIndex: 1,
                        }}
                    />

                    {/* Thumbnail Images */}
                    {images.map((src, idx) => (
                        <div className="tw-relative tw-flex tw-gap-x-1 tw-bg-slate-300 dark:tw-bg-slate-800"
                        key={idx}
                        ref={el => imageRefs.current[idx] = el}
                        onClick={() => setSelectedImageIndex(idx)}
                        >
                            {/* Thumbnail Image */}
                            <img
                                key={idx}
                                src={images[idx]}
                                alt={`Gallery ${idx}`}
                                className="tw-flex tw-w-full tw-h-32 tw-rounded tw-object-contain"
                                onLoad={idx === selectedImageIndex ? () => imageSelectedIndicatorUpdate(idx) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    , document.body);
}
