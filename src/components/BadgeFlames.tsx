"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The card spans x ∈ [-0.8, 0.8], y ∈ [-1.1, 1.1] and is ~0.05 thick in the
// card group's local space.
//
// The fire engulfs the whole badge but stays restrained: sheets sit behind the
// card and are depth-tested against it, so the card occludes their middle and
// only the tongues past its silhouette show. A faint sheet in front stops the
// card reading as a black box punched through the fire, and the flames rise
// clear of the top edge so nothing looks cut off.
const SHEET_W = 2.5;
const SHEET_H = 3.2;
const SHEET_Y = 0.35;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Waving. Sine bands sweep the field sideways, scaled by height so the base
    // stays anchored to the card while the tips lick around.
    float wave = sin(uv.y * 4.5 - uTime * 2.3) * 0.11
               + sin(uv.y * 10.0 - uTime * 3.7) * 0.045;
    uv.x += wave * smoothstep(0.0, 0.55, uv.y);

    // Scrolling the noise downward makes the flame climb; squashing x and
    // stretching y turns blobs into vertical tongues.
    vec2 q = vec2(uv.x * 3.0, uv.y * 1.3 - uTime * uSpeed);
    float n = fbm(q);
    n = mix(n, fbm(q * 2.3 + vec2(1.7, -uTime * uSpeed * 2.1)), 0.5);

    // The flame exists where the noise still outruns a linear height ramp.
    // Subtracting rather than multiplying produces tongues that thin out with
    // height instead of a rectangle that fades uniformly.
    float f = n * 1.5 - uv.y * 1.30 + 0.18;
    // Force it to zero before the plane's top edge, otherwise a tall tongue
    // gets sliced off square and the sheet's boundary becomes visible.
    f *= smoothstep(1.0, 0.86, uv.y);

    // Feather the sides, and fade in just above the bottom so the base is not
    // a flat bar.
    f *= smoothstep(0.0, 0.13, uv.x) * smoothstep(1.0, 0.87, uv.x);
    f *= smoothstep(0.0, 0.05, uv.y);

    float body = smoothstep(0.0, 0.26, f);
    float core = smoothstep(0.28, 0.66, f);

    // Deliberately no white-hot tier — with three additive sheets stacked, a
    // blaze colour blows the whole thing out to a solid mass.
    vec3 deep = vec3(0.02, 0.28, 0.08);
    vec3 mid = vec3(0.13, 0.85, 0.34);
    vec3 hot = vec3(0.66, 1.00, 0.68);

    vec3 col = mix(deep, mid, body);
    col = mix(col, hot, core);

    float alpha = body * uOpacity;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

function FlameSheet({ z, opacity, speed }: { z: number; opacity: number; speed: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: opacity }, uSpeed: { value: speed } }),
    [opacity, speed],
  );

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    // Never takes part in hit testing — the badge stays draggable.
    <mesh position={[0, SHEET_Y, z]} raycast={() => null}>
      <planeGeometry args={[SHEET_W, SHEET_H]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function BadgeFlames() {
  const light = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (light.current) {
      // Layered frequencies so the flicker never settles into a visible loop.
      light.current.intensity =
        1.2 + Math.sin(t * 11.3) * 0.3 + Math.sin(t * 6.7) * 0.2 + Math.sin(t * 23.1) * 0.1;
    }
  });

  return (
    <group>
      <FlameSheet z={-0.12} opacity={0.45} speed={0.9} />
      {/* Second sheet at a different rate so the two never move in lockstep. */}
      <FlameSheet z={-0.04} opacity={0.24} speed={1.3} />
      {/* In front of the card face (and its text at z ≈ 0.03), faint enough to
          read straight through. */}
      <FlameSheet z={0.08} opacity={0.16} speed={1.1} />
      <pointLight ref={light} color="#22c55e" distance={3.5} position={[0, -0.9, -0.25]} />
    </group>
  );
}
