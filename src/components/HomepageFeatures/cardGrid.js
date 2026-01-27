import React, { useEffect, useRef } from "react";
import Link from "@docusaurus/Link";
import "./cardGrid.css";

export default function CardGridSection({ items = [] }) {
    const sectionRef = useRef(null);

    /* -----------------------------------------
       PARTICLE BACKGROUND
    ----------------------------------------- */
    useEffect(() => {
        const container = sectionRef.current?.querySelector("#cg-particles");
        if (!container) return;

        container.innerHTML = "";
        const count = 45;
        const colors = ["var(--accent-1)", "var(--accent-2)", "#f97316"];

        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "cg-particle";
            p.style.left = Math.random() * 100 + "%";
            p.style.animationDelay = Math.random() * 6 + "s";
            p.style.animationDuration = 6 + Math.random() * 6 + "s";
            p.style.background = colors[Math.floor(Math.random() * colors.length)];

            const size = Math.random() * 4 + 2;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            container.appendChild(p);
        }
    }, []);

    /* -----------------------------------------
       CARD TILT (NO OVERLAY GLOW ANYMORE)
    ----------------------------------------- */
    useEffect(() => {
        const cards = sectionRef.current?.querySelectorAll(".cg-card") || [];

        cards.forEach((card) => {
            const onMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateX = (y - rect.height / 2) / 18;
                const rotateY = (rect.width / 2 - x) / 18;

                card.style.transform = `translateY(-6px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            };

            const onLeave = () => {
                card.style.transform = "";
            };

            card.addEventListener("mousemove", onMove);
            card.addEventListener("mouseleave", onLeave);
        });
    }, [items]);

    return (
        <section className="cg-section tw-mt-4 tw-bg-slate-100 dark:tw-bg-gray-950 tw-rounded-md" ref={sectionRef}>
            {/* Background Layers */}
            <div className="cg-grid-lines" />
            <div id="cg-particles" className="cg-particles" />

            <div className="cg-container">
                {/* HEADER */}
                <div className="cg-header tw-text-center">
                    <h2 className="tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-text-blue-800 dark:tw-text-white tw-mb-4">
                        Why CIROH Hub?
                    </h2>

                    <h2 className="cg-title">Elevate Your Research Journey</h2>

                    <p className="cg-subtitle">
                        Powerful tools, training, data, and cloud-ready infrastructure to advance
                        hydrological science across the CIROH community.
                    </p>
                </div>

                {/* CARDS */}
                <div className="cg-grid">
                    {items.map((item, i) => (
                        <div key={i} className="cg-card group tw-relative tw-bg-slate-50 dark:tw-bg-slate-900">

                            {/* NEW STYLISH NUMBER */}
                            <span
                                className={`
                                    cg-card-number
                                    cg-number-box
                                    tw-absolute tw-top-3 tw-right-4
                                    tw-text-4xl tw-font-extrabold tw-select-none
                                    tw-opacity-0 group-hover:tw-opacity-100
                                    tw-transition-all tw-duration-300
                                    tw-text-transparent dark:tw-text-transparent
                                `}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>

                            {/* ICON */}
                            <div className="cg-icon-box">
                                <span className="cg-icon">{item.icon}</span>
                            </div>

                            <h3 className="cg-card-title">{item.title}</h3>
                            <p className="cg-card-desc">{item.description}</p>

                            {/* Link */}
                            <Link to={item.link} className="cg-link">
                                Explore →
                            </Link>

                            <div className="cg-orbit">
                                <div className="cg-orbit-dot"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="cg-cta tw-text-center">
                    <Link
                        to="/docs"
                        className="
                            cg-cta-button
                            tw-text-white tw-bg-blue-600 hover:tw-bg-blue-800
                            dark:tw-text-blue-800 dark:tw-bg-white dark:hover:tw-bg-slate-100
                        "
                    >
                        Start Exploring →
                    </Link>
                </div>
            </div>
        </section>
    );
}
