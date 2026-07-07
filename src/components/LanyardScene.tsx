"use client";

import { Canvas, extend } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import LanyardBand from "@/components/LanyardBand";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function LanyardScene() {
  return (
    <Canvas camera={{ position: [0, 0, 13], fov: 25 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
        <LanyardBand />
      </Physics>
      <Environment resolution={256}>
        <group rotation={[Math.PI / 3, 0, 0]}>
          <Lightformer intensity={2} color="#22d3ee" position={[0, -1, 5]} scale={10} form="ring" />
          <Lightformer intensity={2} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={2} />
        </group>
      </Environment>
    </Canvas>
  );
}
