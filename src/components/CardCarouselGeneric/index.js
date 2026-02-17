
import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import './CardCarouselGeneric.css';

/**
 * Generic CardCarousel component
 * @param {Object[]} cards - Array of card data
 * @param {React.ReactNode} header - Optional header
 * @param {(card: Object, index: number, cardProperties: {ref: (el: HTMLElement|null) => void, style: Object}) => React.ReactNode} renderCard - Function to render a card.
 */
const CardCarouselGeneric = ({ cards, header, renderCard }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const autoScrollRef = useRef(null);
    const [maxContentHeight, setMaxContentHeight] = useState(0);
    const contentRefsRef = useRef({});

    // Calculate cards per view based on screen size
    const updateCardsPerView = () => {
        if (window.innerWidth >= 1024) {
            setCardsPerView(3);
        } else if (window.innerWidth >= 768) {
            setCardsPerView(2);
        } else {
            setCardsPerView(1);
        }
    };

    useEffect(() => {
        updateCardsPerView();
        window.addEventListener('resize', updateCardsPerView);
        return () => window.removeEventListener('resize', updateCardsPerView);
    }, []);

    // Measure card content heights and find the maximum
    useEffect(() => {
        setTimeout(() => {
            let maxHeight = 0;
            Object.values(contentRefsRef.current).forEach((ref) => {
                if (ref && ref.scrollHeight > maxHeight) {
                    maxHeight = ref.scrollHeight;
                }
            });
            if (maxHeight > 0) {
                setMaxContentHeight(maxHeight);
            }
        }, 100);
    }, [cards, renderCard]);

    const maxIndex = Math.max(0, cards.length - cardsPerView);

    const nextSlide = () => {
        setCurrentIndex(prev => {
            const nextIndex = prev + cardsPerView;
            return nextIndex > maxIndex ? 0 : nextIndex;
        });
    };

    const prevSlide = () => {
        setCurrentIndex(prev => {
            const nextIndex = prev - cardsPerView;
            return nextIndex < 0 ? maxIndex : nextIndex;
        });
    };


    const goToSlide = (page) => {
        const index = page * cardsPerView;
        setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    };

    // Auto scroll
    const startAutoScroll = () => {
        autoScrollRef.current = setInterval(nextSlide, 5000);
    };

    const stopAutoScroll = () => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };

    const resetAutoScroll = () => {
        stopAutoScroll();
        startAutoScroll();
    };

    useEffect(() => {
        startAutoScroll();
        return stopAutoScroll;
    }, [maxIndex]);

    const offset = -(currentIndex * (100 / cardsPerView));

    return (
        <div className="tw-w-full tw-relative tw-py-12">
            {/* Header */}
            { header }

            {/* Carousel Container */}
            <div className="tw-relative tw-max-w-7xl tw-mx-auto tw-px-4">
                {/* Carousel Wrapper */}
                <div
                    className={clsx(
                        'tw-overflow-hidden tw-rounded-3xl tw-p-8 tw-relative',
                        'tw-bg-gradient-to-b tw-from-white tw-to-slate-50',
                        'dark:tw-from-slate-800 dark:tw-to-slate-900',
                        'tw-border-2 tw-border-slate-200 dark:tw-border-slate-700',
                        'tw-shadow-xl dark:tw-shadow-2xl'
                    )}
                    onMouseEnter={stopAutoScroll}
                    onMouseLeave={resetAutoScroll}
                >
                    {/* Carousel Stage */}
                    <div className="tw-relative tw-overflow-hidden tw-w-full">
                        <div
                            className="tw-flex tw-transition-transform tw-duration-600 tw-ease-out tw-w-full"
                            style={{
                                transform: `translateX(${offset}%)`,
                            }}
                        >
                            {cards.map((card, index) => (
                                <div
                                    key={index}
                                    className="tw-flex-shrink-0"
                                    style={{ width: `${100 / cardsPerView}%` }}
                                >
                                    <div className="tw-px-4">
                                        {/**
                                         * The renderCard property is responsible for rendering the card content.
                                         * It receives the card, its index, and a cardProperties object with a ref and style for measuring content height.
                                         */}
                                        {renderCard(
                                            card,
                                            index,
                                            {
                                                ref: (el) => {
                                                    if (el) contentRefsRef.current[index] = el;
                                                },
                                                style: { height: `${maxContentHeight + 224}px` },
                                            }
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={() => {
                        prevSlide();
                        resetAutoScroll();
                    }}
                    className={clsx(
                        'tw-absolute tw-left-0 tw-top-1/2 -tw-translate-y-1/2 -tw-translate-x-6',
                        'tw-p-3 tw-rounded-full tw-transition-all tw-duration-300',
                        'tw-bg-slate-200 dark:tw-bg-slate-700 tw-text-slate-900 dark:tw-text-white',
                        'hover:tw-scale-110 hover:tw-bg-blue-500 hover:tw-text-white dark:hover:tw-bg-blue-500',
                        'tw-shadow-lg dark:tw-shadow-xl tw-z-10'
                    )}
                    aria-label="Previous slide"
                >
                    <svg className="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => {
                        nextSlide();
                        resetAutoScroll();
                    }}
                    className={clsx(
                        'tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-translate-x-6',
                        'tw-p-3 tw-rounded-full tw-transition-all tw-duration-300',
                        'tw-bg-slate-200 dark:tw-bg-slate-700 tw-text-slate-900 dark:tw-text-white',
                        'hover:tw-scale-110 hover:tw-bg-blue-500 hover:tw-text-white dark:hover:tw-bg-blue-500',
                        'tw-shadow-lg dark:tw-shadow-xl tw-z-10'
                    )}
                    aria-label="Next slide"
                >
                    <svg className="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Navigation Dots */}
                <div className="tw-flex tw-justify-center tw-gap-3 tw-mt-8">
                    {Array.from({ length: Math.ceil(cards.length / cardsPerView) }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                goToSlide(i);
                                resetAutoScroll();
                            }}
                            className={clsx(
                                'tw-w-3 tw-h-3 tw-rounded-full tw-transition-all tw-duration-300',
                                i === Math.floor(currentIndex / cardsPerView)
                                    ? 'tw-bg-blue-500 tw-shadow-lg tw-scale-125'
                                    : 'tw-bg-slate-400 dark:tw-bg-slate-600 hover:tw-bg-slate-500'
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === Math.floor(currentIndex / cardsPerView)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CardCarouselGeneric;
