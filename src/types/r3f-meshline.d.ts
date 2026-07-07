import type * as THREE from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElements["bufferGeometry"];
    meshLineMaterial: ThreeElements["meshBasicMaterial"] & {
      color?: THREE.ColorRepresentation;
      depthTest?: boolean;
      resolution?: [number, number];
      lineWidth?: number;
      repeat?: [number, number];
      useMap?: boolean;
      transparent?: boolean;
      opacity?: number;
    };
  }
}
