import React, { useEffect, useRef } from 'react';


export function ConstellationCanvas() {
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


