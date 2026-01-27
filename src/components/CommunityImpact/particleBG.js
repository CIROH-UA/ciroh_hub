import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

// Tailwind color for light mode
const LIGHT_BLUE = '#1e40af'; // tw-blue-800
const DEFAULT_WHITE = '#ffffff';

const hexToRgb = hex => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const int = parseInt(hex, 16);
    return [
        ((int >> 16) & 255) / 255,
        ((int >> 8) & 255) / 255,
        (int & 255) / 255
    ];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 8.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;

    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5)))
                   / length(mvPos.xyz);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.15 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor, circle);
    }
  }
`;

const Particles = ({
    particleCount = 220,
    particleSpread = 10,
    speed = 0.1,
    particleBaseSize = 80,
    sizeRandomness = 1,
    moveParticlesOnHover = true,
    particleHoverFactor = 1,
    alphaParticles = false,
    disableRotation = false,
    cameraDistance = 20,
    pixelRatio = 1,
    particleColors, // optional override
    className
}) => {
    const containerRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const renderer = new Renderer({ dpr: pixelRatio, depth: false, alpha: true });
        const gl = renderer.gl;

        container.appendChild(gl.canvas);
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 18 });
        camera.position.set(0, 0, cameraDistance);

        const resize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };

        window.addEventListener('resize', resize);
        resize();

        // Mouse move (listen globally to avoid hero blocking interaction)
        const handleMouseMove = e => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            mouseRef.current = { x, y };
        };

        if (moveParticlesOnHover)
            window.addEventListener('mousemove', handleMouseMove);

        // Determine palette based on theme
        const getPalette = () => {
            if (particleColors?.length) return particleColors;
            const theme = document.body.getAttribute('data-theme') || 'dark';
            return theme === 'light' ? [LIGHT_BLUE] : [DEFAULT_WHITE];
        };

        // BUILD PARTICLES
        const count = particleCount;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 4);
        const colors = new Float32Array(count * 3);

        const assignColors = palette => {
            for (let i = 0; i < count; i++) {
                const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
                colors.set(col, i * 3);
            }
        };

        // Initial color assignment
        assignColors(getPalette());

        for (let i = 0; i < count; i++) {
            let x, y, z, len;
            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;
                len = x * x + y * y + z * z;
            } while (len > 1 || len === 0);

            const r = Math.cbrt(Math.random());
            positions.set([x * r, y * r, z * r], i * 3);
            randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: positions },
            random: { size: 4, data: randoms },
            color: { size: 3, data: colors }
        });

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uSpread: { value: particleSpread },
                uBaseSize: { value: particleBaseSize * pixelRatio },
                uSizeRandomness: { value: sizeRandomness },
                uAlphaParticles: { value: alphaParticles ? 1 : 0 }
            },
            transparent: true,
            depthTest: false
        });

        const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

        // THEME CHANGE OBSERVER (FULL FIX)
        const observer = new MutationObserver(() => {
            const palette = getPalette();
            assignColors(palette);
            geometry.attributes.color.needsUpdate = true; // <-- REQUIRED FOR GPU UPDATE
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

        let last = performance.now();
        let elapsed = 0;

        const animate = t => {
            const delta = t - last;
            last = t;
            elapsed += delta * speed;

            program.uniforms.uTime.value = elapsed * 0.001;

            if (moveParticlesOnHover) {
                mesh.position.x = -mouseRef.current.x * particleHoverFactor;
                mesh.position.y = -mouseRef.current.y * particleHoverFactor;
            }

            if (!disableRotation) {
                mesh.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
                mesh.rotation.y = Math.cos(elapsed * 0.0005) * 0.1;
                mesh.rotation.z += 0.003;
            }

            renderer.render({ scene: mesh, camera });
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            container.removeChild(gl.canvas);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`tw-relative tw-w-full tw-h-full ${className ?? ''}`}
        />
    );
};

export default Particles;
