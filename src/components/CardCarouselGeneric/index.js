
import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import './CardCarouselGeneric.css';

/**
 * Generic CardCarousel component
 * @param {Object[]} cards - Array of card data
 * @param {number} cardsPerView - Number of cards to show per view (default: 3)
 * @param {React.ReactNode} header - Optional header
 * @param {(card: Object, index: number, cardProperties: {ref: (el: HTMLElement|null) => void, style: Object}) => React.ReactNode} renderCard - Function to render a card.
 * @param {() => Promise<Object[]>} fetchCards - Function to fetch cards asynchronously. Should return a promise that resolves to an array of card objects. If not provided, the component will use the cards passed in the `cards` prop.
 */
const CardCarouselGeneric = ({ cards = [], cardsPerView = 3, header, renderCard, fetchCards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoScrollRef = useRef(null);
    const [maxContentHeight, setMaxContentHeight] = useState(0);
    const contentRefsRef = useRef({});

    const [fetchingCards, setFetchingCards] = useState(false);
    const [carouselCards, setCarouselCards] = useState(cards || []);

    // Fetch cards if fetchCards function is provided
    useEffect(() => {
        function fetchCardsHelper() {
            let isMounted = true;
            // Fetch cards asynchronously
            async function doFetch() {
                // fetchCards function provided
                if (fetchCards)
                {
                    // Fetch cards and update state if component is still mounted
                    setFetchingCards(true);
                    const fetchedCards = await fetchCards();
                    if (isMounted)
                    {
                        setCarouselCards(cards.concat(fetchedCards || []));
                        setFetchingCards(false);
                    }
                }
                // fetchCards function NOT provided
                else
                {
                    setCarouselCards(cards || []);
                }
            }

            // Start fetching cards
            doFetch();

            // Cleanup function to prevent state updates if component unmounts during fetch
            return () => { isMounted = false; };
        }
        fetchCardsHelper();
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
    }, [carouselCards, renderCard]);

    const maxIndex = Math.max(0, carouselCards.length - cardsPerView);

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
            <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400 tw-text-center">
                { header }
            </div>

            {/* Carousel Container */}
            <div className="tw-relative tw-max-w-7xl tw-mx-auto tw-px-4">

                {/* Flexbox */}
                <div className="tw-flex tw-items-center tw-relative">
                    
                    {/* Navigation Arrow Left */}
                    <button
                        onClick={() => {
                            prevSlide();
                            resetAutoScroll();
                        }}
                        className={clsx(
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

                    {/* Carousel Wrapper */}
                    <div
                        className={clsx(
                            'tw-overflow-hidden tw-rounded-3xl tw-p-8 tw-relative',
                            'tw-bg-gradient-to-b tw-from-white tw-to-slate-50',
                            'dark:tw-from-slate-800 dark:tw-to-slate-900',
                            'tw-border-2 tw-border-slate-200 dark:tw-border-slate-700',
                            'tw-shadow-xl dark:tw-shadow-2xl tw-flex-1'
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
                                {carouselCards.map((card, index) => (
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
                    
                    {/* Navigation Arrow Right */}
                    <button
                        onClick={() => {
                            nextSlide();
                            resetAutoScroll();
                        }}
                        className={clsx(
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
                </div>

                {/* Navigation Dots */}
                <div className="tw-flex tw-justify-center tw-gap-3 tw-mt-8">
                    {Array.from({ length: Math.ceil(carouselCards.length / cardsPerView) }).map((_, i) => (
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
