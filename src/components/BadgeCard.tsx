"use client";

import { RoundedBox, Text, useTexture } from "@react-three/drei";
import { profile } from "@/lib/content";

export default function BadgeCard() {
  const avatarMap = useTexture("/images/avatar.jpg");

  return (
    <group>
      {/* card body */}
      <RoundedBox args={[1.6, 2.2, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial color="#101014" roughness={0.35} metalness={0.1} clearcoat={0.4} />
      </RoundedBox>

      {/* accent header bar */}
      <mesh position={[0, 0.92, 0.026]}>
        <planeGeometry args={[1.6, 0.36]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
      <Text
        position={[0, 0.92, 0.03]}
        fontSize={0.11}
        color="#0a0a0a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        PORTFOLIO
      </Text>

      {/* avatar photo */}
      <mesh position={[0, 0.15, 0.026]}>
        <circleGeometry args={[0.5, 48]} />
        <meshBasicMaterial map={avatarMap} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.15, 0.02]}>
        <ringGeometry args={[0.49, 0.52, 48]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>

      <Text
        position={[0, -0.55, 0.026]}
        fontSize={0.13}
        color="#f5f5f5"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {profile.name}
      </Text>
      <Text
        position={[0, -0.75, 0.026]}
        fontSize={0.09}
        color="#a3a3a3"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {profile.title}
      </Text>

      <Text
        position={[0, -1.02, 0.026]}
        fontSize={0.065}
        color="#525252"
        anchorX="center"
        anchorY="middle"
      >
        github.com/parks3131
      </Text>

      {/* clip hole */}
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 24]} />
        <meshStandardMaterial color="#525252" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}
