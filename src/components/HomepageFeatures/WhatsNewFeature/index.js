import React, { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import CardCarouselGeneric from "@site/src/components/CardCarouselGeneric";
import whatsNewList from "./whatsNewList.json";

// Section header for the What's New carousel.
function WhatsNewHeader() {
  return (
    <div className="tw-text-center tw-mb-12">
      <span
        className="tw-bg-blue-100 dark:tw-bg-blue-900/40 tw-text-blue-800 dark:tw-text-blue-300
          tw-text-sm tw-font-semibold tw-px-4 tw-py-1.5 tw-rounded-full"
      >
        Fresh from the CIROH community
      </span>
      <h2 className="tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-text-blue-800 dark:tw-text-white tw-mt-4 tw-mb-3">
        What's New
      </h2>
      <div className="tw-w-[70px] tw-h-1 tw-bg-[#19a7ce] tw-mx-auto tw-rounded-sm tw-mb-4"></div>
      <p className="tw-text-lg tw-font-normal tw-text-slate-900 dark:tw-text-slate-300">
        Catch up on the latest blog post, community news, and documentation updates
      </p>
    </div>
  );
}

// Renders a single What's New card inside the carousel.
// `cardProperties` carries the ref + style the carousel uses to equalize card heights.
function renderWhatsNewCard(card, index, cardProperties) {
  return (
    <div
      className={clsx(
        "carousel-card tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col",
        "tw-bg-blue-50 dark:tw-bg-slate-900",
        "tw-border tw-border-blue-200 dark:tw-border-slate-600",
        "tw-shadow-lg hover:tw-shadow-2xl",
        "tw-transition-all tw-duration-500 tw-transform hover:tw-scale-105"
      )}
      style={cardProperties.style}
    >
      {/* Image */}
      <div className="tw-relative tw-overflow-hidden tw-h-56 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 dark:tw-bg-slate-500">
        <img
          src={card.image}
          alt={card.title}
          className="tw-w-full tw-h-full tw-object-cover"
        />
        {card.tag && (
          <span className="tw-absolute tw-top-3 tw-left-3 tw-bg-[#19a7ce] tw-text-white tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-px-3 tw-py-1 tw-rounded-full">
            {card.tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="tw-p-6 tw-flex tw-flex-col tw-flex-grow tw-text-slate-900 dark:tw-text-white"
        ref={cardProperties.ref}
      >
        {card.date && (
          <span className="tw-text-xs tw-font-semibold tw-text-slate-500 dark:tw-text-slate-400 tw-mb-2">
            {card.date}
          </span>
        )}
        <h3 className="tw-text-xl tw-font-bold tw-mb-3 tw-line-clamp-3 dark:tw-text-white tw-text-slate-900">
          {card.title}
        </h3>
        <p className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-200 tw-flex-grow tw-mb-4 tw-leading-relaxed">
          {card.description}
        </p>
        <Link
          to={card.link}
          className={clsx(
            "ciroh-learn-more",
            "tw-inline-block tw-px-4 tw-py-2 tw-rounded-lg tw-font-semibold tw-text-base tw-no-underline",
            "tw-transition-all tw-duration-300"
          )}
        >
          {card.cta || "Learn More"} →
        </Link>
      </div>
    </div>
  );
}

export default function WhatsNewFeature() {
  // Match the responsive behavior of the Explore CIROH carousel: 3 / 2 / 1 cards.
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) setCardsPerView(3);
      else if (window.innerWidth >= 768) setCardsPerView(2);
      else setCardsPerView(1);
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  if (!whatsNewList || whatsNewList.length === 0) return null;

  return (
    <section className="tw-w-full tw-relative">
      <div className="container">
        <CardCarouselGeneric
          cards={whatsNewList}
          cardsPerView={Math.min(cardsPerView, whatsNewList.length)}
          header={<WhatsNewHeader />}
          renderCard={renderWhatsNewCard}
        />
      </div>
    </section>
  );
}
