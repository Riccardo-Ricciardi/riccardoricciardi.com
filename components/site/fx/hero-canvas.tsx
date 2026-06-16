"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1800;

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  attribute float aScale;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float s = aSeed * 6.2831;
    p.x += sin(uTime * 0.15 + s) * 0.5;
    p.y += cos(uTime * 0.12 + s * 1.3) * 0.5;
    p.z += sin(uTime * 0.10 + s * 0.7) * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (42.0 / -mv.z);
    vAlpha = smoothstep(-34.0, -7.0, mv.z);
  }
`;

const particleFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vAlpha * 0.5);
  }
`;

function readAccent(): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color("#3b6fff");
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-blue")
    .trim();
  try {
    return new THREE.Color(raw || "#3b6fff");
  } catch {
    return new THREE.Color("#3b6fff");
  }
}

function Particles({ accent }: { accent: THREE.Color }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const scales = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = -6 - Math.random() * 24;
      seeds[i] = i / PARTICLE_COUNT;
      scales[i] = 0.5 + Math.random() * 1.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1.9 },
      uColor: { value: accent },
    }),
    [accent]
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const SHAPES: {
  geo: "ico" | "octa" | "torus";
  pos: [number, number, number];
  scale: number;
  spin: number;
}[] = [
  { geo: "ico", pos: [-6.5, 1.8, -8], scale: 1.9, spin: 0.12 },
  { geo: "octa", pos: [6.5, -2.4, -10], scale: 2.3, spin: -0.16 },
  { geo: "torus", pos: [7.5, 2.2, -15], scale: 1.4, spin: 0.1 },
  { geo: "octa", pos: [-4, -3.4, -12], scale: 1.3, spin: 0.14 },
];

function Shapes({ accent }: { accent: THREE.Color }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const spin = SHAPES[i].spin;
      m.rotation.x = t * spin;
      m.rotation.y = t * spin * 0.8;
      m.position.y = SHAPES[i].pos[1] + Math.sin(t * 0.3 + i) * 0.5;
    });
  });

  return (
    <>
      {SHAPES.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={s.pos}
          scale={s.scale}
        >
          {s.geo === "ico" && <icosahedronGeometry args={[1, 0]} />}
          {s.geo === "octa" && <octahedronGeometry args={[1, 0]} />}
          {s.geo === "torus" && <torusGeometry args={[1, 0.3, 8, 20]} />}
          <meshBasicMaterial
            color={accent}
            wireframe
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);
  const accent = useMemo(() => readAccent(), []);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const obs = new MutationObserver(() => accent.copy(readAccent()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("pointermove", onMove);
      obs.disconnect();
    };
  }, [accent]);

  useFrame((state) => {
    eased.current.x += (pointer.current.x - eased.current.x) * 0.03;
    eased.current.y += (pointer.current.y - eased.current.y) * 0.03;
    if (group.current) {
      group.current.rotation.y =
        state.clock.elapsedTime * 0.02 + eased.current.x * 0.25;
      group.current.rotation.x = -eased.current.y * 0.18;
    }
  });

  return (
    <group ref={group}>
      <Particles accent={accent} />
      <Shapes accent={accent} />
    </group>
  );
}

export default function HeroCanvas() {
  const [active, setActive] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const node = wrapRef.current;
    let io: IntersectionObserver | undefined;
    if (node && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => setActive(entry.isIntersecting && !document.hidden),
        { threshold: 0.01 }
      );
      io.observe(node);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 46 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
