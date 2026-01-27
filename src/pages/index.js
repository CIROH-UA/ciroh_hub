import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './index.module.css';

function ConstellationCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const nodesRef = useRef([]);
  const animationIdRef = useRef(null);
  const groupCounterRef = useRef(1);
  const [isDark, setIsDark] = React.useState(true);

  // Theme detection via data-theme
  useEffect(() => {
    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") === "dark";

    // Initialize once
    setIsDark(getTheme());

    // Debounced observer: some external scripts or widgets may briefly toggle
    // the attribute; debounce so we only respond to stable changes.
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newTheme = getTheme();
        setIsDark(prev => (prev === newTheme ? prev : newTheme));
      }, 250); // wait 250ms of stability before applying
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // sizing helper
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // mouse handlers
    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // initial nodes
    const area = window.innerWidth * window.innerHeight;
    const baseCount = Math.max(60, Math.floor(area / 9000));
    nodesRef.current = Array.from({ length: baseCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      groupId: 0, // 0 = global nodes
      born: Date.now(),
    }));

    const maxDistanceGlobal = 140;
    const groupLinkDistance = 80; // distance threshold *within the same burst*
    const mouseInfluence = 140;

    // CLICK: spawn cluster around click position
    const handleClick = (e) => {
      const { clientX: x, clientY: y } = e;
      const burstCount = 8; // nodes per click
      const spawnRadius = 22; // px circle around click where nodes appear
      const initialSpeed = 0.4; // low speed so cluster stays together
      const gid = groupCounterRef.current++;

      for (let i = 0; i < burstCount; i++) {
        // pick a random position inside a small circle
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * spawnRadius; // distribute inside disk
        const nx = x + Math.cos(angle) * r;
        const ny = y + Math.sin(angle) * r;

        // give a slight outward push from center so cluster breathes
        const pushMagnitude = 0.2 + Math.random() * 0.4;
        const dirX = (Math.cos(angle) * pushMagnitude);
        const dirY = (Math.sin(angle) * pushMagnitude);

        nodesRef.current.push({
          x: nx,
          y: ny,
          vx: (Math.random() - 0.5) * initialSpeed + dirX,
          vy: (Math.random() - 0.5) * initialSpeed + dirY,
          radius: Math.random() * 2 + 1.2,
          groupId: gid,
          born: Date.now(),
        });
      }
    };

    window.addEventListener("click", handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodeColor = isDark
        ? "rgba(255,255,255,0.85)"
        : "rgba(25,167,206,0.70)"; // CIROH blue

      const lineColor = isDark
        ? (opacity) => `rgba(255,255,255,${opacity})`
        : (opacity) => `rgba(25,167,206,${opacity})`;


      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // update motion for nodes
      for (let i = 0; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i];

        // mouse attraction
        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - node.x;
          const dy = mouseY - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < mouseInfluence) {
            const force = (mouseInfluence - dist) / mouseInfluence;
            node.vx -= (dx / dist) * force * 0.4;  // run away fast
            node.vy -= (dy / dist) * force * 0.4;
          }

        }

        // gentle wander
        node.vx += (Math.random() - 0.5) * 0.04;
        node.vy += (Math.random() - 0.5) * 0.04;

        // center push to prevent permanent clustering in middle
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const dxC = node.x - cx;
        const dyC = node.y - cy;
        const distC = Math.sqrt(dxC * dxC + dyC * dyC) || 1;
        const minSpread = Math.min(canvas.width, canvas.height) * 0.36;
        if (distC < minSpread) {
          const push = (1 - distC / minSpread) * 0.001;
          node.vx += (dxC / distC) * push;
          node.vy += (dyC / distC) * push;
        }

        // apply velocity and soft damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.994;
        node.vy *= 0.994;

        // bounce at edges
        if (node.x < 0) { node.x = 0; node.vx *= -1; }
        if (node.x > canvas.width) { node.x = canvas.width; node.vx *= -1; }
        if (node.y < 0) { node.y = 0; node.vy *= -1; }
        if (node.y > canvas.height) { node.y = canvas.height; node.vy *= -1; }
      }

      // draw nodes and lines
      for (let i = 0; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i];

        // draw circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // draw links — prefer linking within same group using groupLinkDistance
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const other = nodesRef.current[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // choose distance threshold
          const thresh = (node.groupId && other.groupId && node.groupId === other.groupId)
            ? Math.max(groupLinkDistance, 44) // ensure group nodes link even if slightly scattered
            : maxDistanceGlobal;

          if (dist < thresh) {
            const opacity = 1 - dist / thresh;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = lineColor(opacity * 0.6);
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // remove oldest nodes if too many (cap)
      if (nodesRef.current.length > 1000) {
        nodesRef.current.splice(0, nodesRef.current.length - 1000);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", handleClick);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="tw-fixed tw-inset-0 tw-pointer-events-none tw-bg-transparent"
      style={{ zIndex: 1 }}
    />
  );
}






function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';


  return (
    <header
      className={clsx(
        styles.heroBanner,
        'tw-relative tw-overflow-hidden tw-min-h-screen tw-flex tw-items-center'
      )}
    >
      {/* Content container */}
      <div className="tw-relative tw-z-20 tw-container tw-mx-auto tw-px-10 lg:tw-pl-28 tw-py-16">
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-20 lg:tw-gap-28 tw-items-center">

          {/* LEFT SIDE — TEXT */}
          <div className="tw-flex tw-flex-col tw-justify-center tw-space-y-6 tw-order-2 lg:tw-order-1">
            <div>
              <h1
                className={clsx(
                  styles.heroTitle,
                  'tw-text-5xl sm:tw-text-6xl lg:tw-text-7xl tw-font-bold tw-mb-4'
                )}
              >
                <span className="tw-text-blue-800 dark:tw-text-white">CIROH</span>{' '}
                <span className="tw-text-blue-800 dark:tw-text-cyan-400"> Hub</span>
              </h1>


              <h2
                className={clsx(
                  styles.heroSubtitle,
                  'tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-light tw-mb-6',
                  isDarkTheme ? 'tw-text-slate-200' : 'tw-text-blue-900'
                )}
              >
                {siteConfig.tagline}
              </h2>
            </div>

            <p
              className={clsx(
                styles.heroDescription,
                'tw-text-sm sm:tw-text-base lg:tw-text-xl tw-leading-relaxed tw-max-w-lg',
                isDarkTheme ? 'tw-text-white' : 'tw-text-blue-700'
              )}
            >
              Welcome to <span className={clsx('tw-font-semibold', isDarkTheme ? 'tw-text-white' : 'tw-text-blue-600')}>CIROH Hub</span>: Your centralized gateway to expert insights on our Software, Services, and comprehensive documentation.
            </p>

            {/* CTA Buttons */}
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 sm:tw-gap-4 tw-pt-4">
              <Link
                className="tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-bg-blue-700 dark:tw-bg-cyan-500 tw-text-white dark:hover:tw-bg-cyan-700 hover:tw-bg-blue-800"
                to="/docs/products/intro"
              >
                Get Started
              </Link>

              <Link
                className={clsx(
                  'tw-no-underline lg:tw-text-xl tw-inline-flex tw-items-center tw-justify-center tw-px-6 tw-py-3 tw-rounded-lg tw-font-semibold tw-transition-all tw-duration-300 tw-border-2 tw-outline tw-outline-blue-600 tw-text-blue-700 hover:tw-bg-blue-600 hover:tw-text-white dark:tw-outline-white dark:tw-text-white dark:hover:tw-bg-white dark:hover:tw-text-cyan-700',

                  // colorMode === "dark"
                  //   ? 'tw-border-slate-300 tw-text-white hover:tw-border-white hover:tw-text-white'
                  //   : 'tw-border-slate-400 tw-text-blue-700 hover:tw-border-blue-600 hover:tw-text-blue-600'
                )}
                to="/docs/services/intro"
              >

                Learn More
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — LOGO */}
          <div className="tw-flex tw-items-center tw-justify-center tw-order-1 lg:tw-order-2">
            <div className="tw-relative">

              {/* DROPLET GLOW */}
              <div
                className={clsx(
                  styles.glowCircle,
                  'tw-absolute -tw-inset-24 tw-rounded-full tw-opacity-30 tw-blur-3xl',
                  isDarkTheme
                    ? 'tw-bg-gradient-to-br tw-from-cyan-500 tw-to-blue-500'
                    : 'tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-400'
                )}
              />

              {/* LOGO CIRCLE */}
              <div
                className={clsx(
                  styles.logoBg,
                  'tw-relative tw-w-72 sm:tw-w-80 lg:tw-w-[26rem] tw-h-72 sm:tw-h-80 lg:tw-h-[26rem] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-animate-float',
                  isDarkTheme
                    ? 'tw-bg-white tw-shadow-blue-500/30'
                    : 'tw-bg-blue-900 tw-shadow-blue-700/40'
                )}
              >
                <img
                  src={isDarkTheme ? "img/logos/ciroh-bgsafe.png" : "img/logos/ciroh-dark.png"}
                  alt="CIROH Logo"
                  className="tw-w-48 sm:tw-w-56 lg:tw-w-64 tw-h-auto tw-drop-shadow-xl"
                />


                <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-4 tw-border-blue-300/30 tw-animate-ping-slow" />
                <div className="tw-absolute tw-inset-0 tw-rounded-full tw-border-2 tw-border-blue-400/50" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig, isDarkTheme } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="CIROH Documentation Hub">

      {/* CONSTELLATION BACKGROUND */}
      <div className="tw-fixed tw-inset-0 tw-pointer-events-none" style={{ zIndex: 1 }}>
        <ConstellationCanvas isDarkTheme={isDarkTheme} />
      </div>

      <HomepageHeader />

      {/* Features Section */}
      <section className="tw-py-20 tw-px-6 tw-relative tw-z-20">
        <div className="tw-container tw-mx-auto tw-max-w-7xl">
          <HomepageFeatures />
        </div>
      </section>
    </Layout>
  );
}
