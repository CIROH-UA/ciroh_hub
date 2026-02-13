import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import './CardCarousel.css';

const CardCarousel = ({ cards, header }) => {
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
    }, [cards]);

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


    const goToSlide = (index) => {
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
            <div className="tw-relative tw-max-w-7xl tw-mx-auto tw-px-4 tw-bg-white dark:tw-bg-[#060010]">
                {/* Carousel Wrapper */}
                <div
                    className={clsx(
                        'tw-overflow-hidden tw-rounded-3xl tw-p-8 tw-relative',
                        'tw-bg-gradient-to-b tw-from-white tw-to-slate-50',
                        'dark:tw-bg-[#060010] tw-border-2 tw-border-slate-200 dark:tw-border-slate-700',
                        'dark:tw-shadow-2xl'
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
                            {cards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="tw-flex-shrink-0"
                                    style={{ width: `${100 / cardsPerView}%` }}
                                >
                                    <div className="tw-px-4">
                                        <div
                                            className={clsx(
                                                'carousel-card tw-rounded-2xl tw-overflow-hidden',
                                                'tw-bg-blue-50 dark:tw-bg-slate-900',
                                                'tw-shadow-lg hover:tw-shadow-2xl',
                                                'tw-transition-all tw-duration-500 tw-transform hover:tw-scale-105',
                                                'tw-border tw-border-blue-200 dark:tw-border-slate-600',
                                                'tw-flex tw-flex-col'
                                            )}
                                            style={{ height: `${maxContentHeight + 224}px` }}
                                        >
                                            {/* Card Image Container */}
                                            <div className="tw-relative tw-overflow-hidden tw-h-56 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 dark:tw-bg-slate-500">
                                                <img
                                                    src={card.image}
                                                    alt={card.title}
                                                    className="tw-w-3/4 tw-h-3/4 tw-object-contain tw-transition-transform tw-duration-500 group-hover:tw-scale-110"
                                                />
                                                <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/10 tw-to-transparent dark:tw-from-black/30" />
                                            </div>

                                            {/* Card Content */}
                                            <div
                                                className="tw-p-6 tw-text-slate-900 dark:tw-text-white tw-flex tw-flex-col tw-flex-grow"
                                                ref={(el) => {
                                                    if (el) contentRefsRef.current[idx] = el;
                                                }}
                                            >
                                                <h3 className="tw-text-2xl tw-font-bold tw-mb-3 tw-line-clamp-2 dark:tw-text-white tw-text-slate-900">
                                                    {card.title}
                                                </h3>
                                                <p className="tw-text-base tw-text-slate-700 dark:tw-text-slate-200 tw-flex-grow tw-mb-4 tw-leading-relaxed">
                                                    {card.description}
                                                </p>
                                                <Link
                                                    to={card.link}
                                                    className={clsx(
                                                        'ciroh-learn-more', // new dedicated class
                                                        'tw-inline-block tw-px-4 tw-py-2 tw-rounded-lg tw-font-semibold tw-text-base tw-no-underline',
                                                        'tw-transition-all tw-duration-300'
                                                    )}
                                                >
                                                    Learn More →
                                                </Link>


                                            </div>
                                        </div>
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
                                i === currentIndex
                                    ? 'tw-bg-blue-500 tw-shadow-lg tw-scale-125'
                                    : 'tw-bg-slate-400 dark:tw-bg-slate-600 hover:tw-bg-slate-500'
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === currentIndex}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CardCarousel;
