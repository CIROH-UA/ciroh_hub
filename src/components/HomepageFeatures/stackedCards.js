import React, { useEffect, useRef } from "react";

export const ScrollStackItem = ({ children, className = "" }) => {
    return (
        <div
            className={`
        scroll-stack-card
        tw-relative tw-w-full tw-my-12 tw-p-10
        tw-rounded-3xl tw-shadow-xl tw-box-border tw-origin-top
        tw-bg-white/95 tw-border tw-border-slate-200
        dark:tw-bg-slate-800/90 dark:tw-border-slate-700
        tw-transition-all tw-duration-300
        ${className}
      `}
            style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
            }}
        >
            {children}
        </div>
    );
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const ScrollStack = ({
    children,
    className = "",
    stackOffset = 80, // distance between stacked cards
    scaleStep = 0.06, // scaling between stacked layers
    startOffset = 200, // where stacking begins
}) => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = [...container.querySelectorAll(".scroll-stack-card")];
        cardsRef.current = cards;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const containerTop = container.offsetTop;

            cards.forEach((card, index) => {
                const cardTop = containerTop + card.offsetTop;
                const distance = scrollY - cardTop + startOffset;

                let translateY = 0;
                let scale = 1;
                let opacity = 1;

                const pinned = distance > 0;

                if (pinned) {
                    // Stack offset per card
                    translateY = index * stackOffset;
                    scale = 1 - index * scaleStep;

                    opacity = clamp(1 - index * 0.08, 0.35, 1);
                }

                // Apply transforms
                card.style.transform = `translateY(${translateY}px) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = `${500 - index}`;
            });
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // initialize on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, [stackOffset, scaleStep, startOffset]);

    return (
        <div
            ref={containerRef}
            className={`tw-relative tw-w-full tw-min-h-screen tw-pt-[20vh] ${className}`}
        >
            {children}

            {/* spacer so last card resets properly */}
            <div className="tw-h-[60vh]" />
        </div>
    );
};

export default ScrollStack;
