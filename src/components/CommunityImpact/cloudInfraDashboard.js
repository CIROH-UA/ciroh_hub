import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "./cloudInfraDashboard.css";

/**
 * CloudInfraDashboard
 * Accepts a "cards" prop:
 *
 * cards = [
 *   {
 *     accent: "aws",
 *     title: "Amazon Web Services",
 *     color: "#FF9900",
 *     svg: <img src="..." />,
 *     stats: [
 *       { value: 24, bar: "38%", label: "Ongoing Projects" },
 *       { value: 69, bar: "17%", label: "Active Users" }
 *     ]
 *   }
 * ]
 */

export default function CloudInfraDashboard({ cards = [] }) {
    const particlesRef = useRef(null);
    const cardsRef = useRef([]);
    const observersRef = useRef([]);

    useEffect(() => {
        // -----------------------------
        // CREATE FLOATING PARTICLES
        // -----------------------------
        const root = particlesRef.current;
        if (root) {
            root.innerHTML = ""; // prevent duplicate particles
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement("div");
                particle.className = "particle";
                particle.style.left = Math.random() * 100 + "%";
                particle.style.animationDelay = Math.random() * 15 + "s";
                particle.style.animationDuration = 15 + Math.random() * 10 + "s";
                root.appendChild(particle);
            }
        }

        // -----------------------------
        // COUNTER ANIMATION
        // -----------------------------
        const animateCounter = (el, target) => {
            gsap.to(el, {
                innerHTML: target,
                duration: 1.6,
                ease: "power2.out",
                snap: { innerHTML: 1 },
            });
        };

        // -----------------------------
        // INTERSECTION OBSERVER
        // -----------------------------
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");

                    const counters = entry.target.querySelectorAll(".stat-value");
                    counters.forEach((counter) => {
                        const targetVal = parseInt(counter.dataset.target || "0", 10);
                        animateCounter(counter, targetVal);
                    });

                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.3 }
        );

        observersRef.current.push(observer);

        // attach observer + hover animation to each card
        const cleanups = [];

        cardsRef.current.forEach((cardEl) => {
            if (!cardEl) return;

            observer.observe(cardEl);

            // -----------------------------
            // MAGNETIC HOVER EFFECT
            // -----------------------------
            const onMove = (e) => {
                const rect = cardEl.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(cardEl, {
                    rotationY: x * 0.05,
                    rotationX: -y * 0.05,
                    duration: 0.45,
                    ease: "power2.out",
                });
            };

            const onLeave = () => {
                gsap.to(cardEl, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.45,
                    ease: "power2.out",
                });
            };

            cardEl.addEventListener("mousemove", onMove);
            cardEl.addEventListener("mouseleave", onLeave);

            cleanups.push(() => {
                cardEl.removeEventListener("mousemove", onMove);
                cardEl.removeEventListener("mouseleave", onLeave);
            });
        });

        // cleanup
        return () => {
            cleanups.forEach((fn) => fn());
            observersRef.current.forEach((obs) => obs.disconnect?.());
            observersRef.current = [];
            if (particlesRef.current) particlesRef.current.innerHTML = "";
        };
    }, [cards]);

    // fallback demo if no cards provided
    const demoCards = [
        {
            accent: "aws",
            title: "Amazon Web Services",
            color: "#FF9900",
            svg: (
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="20" stroke="#FF9900" strokeWidth="3" />
                </svg>
            ),
            stats: [
                { value: 24, bar: "38%", label: "Ongoing Projects" },
                { value: 69, bar: "17%", label: "Active Users" },
            ],
        },
        {
            accent: "gcp",
            title: "GCP & JupyterHub",
            color: "#4285F4",
            svg: (
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="28" r="14" stroke="#4285F4" strokeWidth="2.5" />
                </svg>
            ),
            stats: [
                { value: 63, bar: "100%", label: "Ongoing Projects" },
                { value: 183, bar: "45%", label: "Active Users" },
            ],
        },
    ];

    const usedCards = cards.length ? cards : demoCards;

    return (
        <div className="cloud-dashboard-root tw-container tw-px-5 tw-mx-auto">

            {/* Background layers */}
            <div className="bg-grid"></div>
            <div className="bg-glow bg-glow-1"></div>
            <div className="bg-glow bg-glow-2"></div>

            {/* Particles */}
            <div className="particles" ref={particlesRef}></div>

            {/* Content */}
            <div className="container">

                <div className="header">
                    <h1 className="tw-text-4xl tw-font-extrabold tw-text-center tw-mb-6
                tw-text-black dark:tw-text-white">
                Research to Operations Hybrid Cloud (R2OHC)
            </h1>
                    <p className="tw-text-gray-700 dark:tw-text-white">Last updated: September 2025</p>
                </div>

                <div className="cards-grid">
                    {usedCards.map((card, i) => (
                        <div
                            key={i}
                            data-accent={card.accent}
                            style={{ ["--card-accent"]: card.color }}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="card tw-bg-slate-900"
                        >
                            <div className="card-glow"></div>
                            <div className="shimmer"></div>
                            <div className="pulse-ring"></div>

                            <div className="cursor-target">
                                <div className="corner corner-tl"></div>
                                <div className="corner corner-tr"></div>
                                <div className="corner corner-bl"></div>
                                <div className="corner corner-br"></div>
                            </div>

                            <div className="icon-container">
                                <div className="icon-wrapper">{card.svg}</div>
                            </div>

                            <h3 className="card-title">{card.title}</h3>

                            <div className="stats">
                                {card.stats.map((stat, si) => (
                                    <div className="stat" key={si}>
                                        <div className="stat-value" data-target={stat.value}>
                                            0
                                        </div>
                                        <div className="stat-label">{stat.label}</div>
                                        <div className="stat-bar">
                                            <div
                                                className="stat-bar-fill"
                                                style={{ ["--bar-width"]: stat.bar }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
