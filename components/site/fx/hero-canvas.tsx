"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElev;

  void main() {
    vUv = uv;
    vec3 p = position;
    float t = uTime * 0.28;
    float e =
        sin(p.x * 0.22 + t) * 0.50
      + sin(p.y * 0.18 - t * 1.1) * 0.45
      + sin((p.x + p.y) * 0.12 + t * 0.6) * 0.30
      + sin(length(p.xy) * 0.30 - t * 1.3) * 0.18;
    p.z += e;
    vElev = e;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uAccent;
  varying vec2 vUv;
  varying float vElev;

  float gridLine(vec2 uv, float scale) {
    vec2 c = uv * scale;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    float line = min(g.x, g.y);
    return 1.0 - clamp(line, 0.0, 1.0);
  }

  void main() {
    float grid = gridLine(vUv, 58.0);
    float fine = gridLine(vUv, 174.0) * 0.22;
    float g = max(grid, fine);

    // light band travelling toward the horizon — the signature trace
    float band = fract(vUv.y - uTime * 0.04);
    float trace = smoothstep(0.10, 0.0, band) + smoothstep(0.90, 1.0, band);

    float relief = smoothstep(-0.4, 1.0, vElev);

    vec3 col = vec3(0.0);
    col += uAccent * g * (0.20 + relief * 0.34);
    col += uAccent * g * trace * 1.7;
    col += uAccent * trace * 0.12;

    float far = smoothstep(1.0, 0.32, vUv.y);
    float near = smoothstep(0.0, 0.06, vUv.y);
    float sides = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
    float fade = far * near * sides;

    float alpha = clamp(g * 0.7 + trace * g * 1.0, 0.0, 1.0) * fade;
    col *= fade;
    gl_FragColor = vec4(col, alpha);
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

function GridFloor() {
  const mesh = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: readAccent() },
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const themeObserver = new MutationObserver(() => {
      uniforms.uAccent.value = readAccent();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("pointermove", onMove);
      themeObserver.disconnect();
    };
  }, [uniforms]);

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
    eased.current.x += (pointer.current.x - eased.current.x) * 0.04;
    eased.current.y += (pointer.current.y - eased.current.y) * 0.04;
    if (mesh.current) {
      mesh.current.rotation.x = -1.3 + eased.current.y * 0.05;
      mesh.current.rotation.z = eased.current.x * 0.04;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-1.3, 0, 0]} position={[0, -1.75, 0]}>
      <planeGeometry args={[46, 30, 240, 160]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
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
        camera={{ position: [0, 1.2, 5], fov: 42 }}
        style={{ width: "100%", height: "100%" }}
      >
        <GridFloor />
      </Canvas>
    </div>
  );
}
