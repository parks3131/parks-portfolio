"use client";

import { RoundedBox, Text, useTexture } from "@react-three/drei";
import type * as THREE from "three";
import { profile } from "@/lib/content";
import BadgeFlames from "@/components/BadgeFlames";

// The photo is 1027x1531, and the plane keeps that aspect exactly so the figure
// is never stretched. It hangs from just under the header bar down past the name,
// which is legible over it because the photo's bottom fades out to nothing.
const PHOTO_H = 1.52;
const PHOTO_W = PHOTO_H * (1027 / 1531);
const PHOTO_TOP = 0.63;
const PHOTO_Y = PHOTO_TOP - PHOTO_H / 2;

function CardFace({ avatarMap }: { avatarMap: THREE.Texture }) {
  return (
    <>
      {/* accent header bar */}
      <mesh position={[0, 0.92, 0.026]}>
        <planeGeometry args={[1.6, 0.36]} />
        <meshBasicMaterial color="#22c55e" />
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

      {/* Cut-out photo: the full frame with its background keyed out, rather
          than a head cropped into a circle. alphaTest discards the transparent
          margin instead of drawing it, so the quad's invisible rectangle never
          writes depth over the flames. */}
      <mesh position={[0, PHOTO_Y, 0.026]}>
        <planeGeometry args={[PHOTO_W, PHOTO_H]} />
        <meshBasicMaterial map={avatarMap} transparent alphaTest={0.04} toneMapped={false} />
      </mesh>

      <Text
        position={[0, -0.87, 0.03]}
        fontSize={0.13}
        color="#f5f5f5"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {profile.name}
      </Text>

      <Text position={[0, -1.02, 0.026]} fontSize={0.065} color="#525252" anchorX="center" anchorY="middle">
        github.com/parks3131
      </Text>
    </>
  );
}

export default function BadgeCard() {
  // A swinging badge samples the photo at a slant, where plain trilinear
  // filtering smears it. Anisotropy is what keeps it sharp, and it is set on the
  // loader callback rather than after the fact: mutating a hook's return value
  // during render is what the immutability lint is there to stop. Three clamps
  // the value to whatever the driver actually supports.
  const avatarMap = useTexture("/images/avatar.png", (loaded) => {
    const texture = Array.isArray(loaded) ? loaded[0] : loaded;
    texture.anisotropy = 16;
  });

  return (
    <group>
      {/* Card body. The faint emissive keeps it from reading as a black box
          punched through the fire burning behind it. */}
      <RoundedBox args={[1.6, 2.2, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#101014"
          roughness={0.35}
          metalness={0.1}
          clearcoat={0.4}
          emissive="#0a3a1a"
          emissiveIntensity={0.4}
        />
      </RoundedBox>

      {/* Identical content on both faces, so the badge reads correctly no
          matter which way it's facing the camera. */}
      <CardFace avatarMap={avatarMap} />
      <group rotation={[0, Math.PI, 0]}>
        <CardFace avatarMap={avatarMap} />
      </group>

      {/* clip hole */}
      <mesh position={[0, 1.02, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 24]} />
        <meshStandardMaterial color="#525252" metalness={0.8} roughness={0.3} />
      </mesh>

      <BadgeFlames />
    </group>
  );
}
