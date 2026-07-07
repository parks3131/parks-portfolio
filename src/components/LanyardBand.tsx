"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import * as THREE from "three";
import type { MeshLineGeometry } from "meshline";
import BadgeCard from "@/components/BadgeCard";

type BandMesh = THREE.Mesh<MeshLineGeometry>;

const SEGMENT_PROPS: RigidBodyProps = {
  type: "dynamic",
  canSleep: true,
  colliders: false,
  angularDamping: 3,
  linearDamping: 3,
};

export default function LanyardBand() {
  const band = useRef<BandMesh>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const dragOffset = useRef(new THREE.Vector3());

  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { size } = useThree();

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
    [],
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  // Pivots must both be zero here: the card body's origin starts almost
  // coincident with j3's origin (see initial positions below). A nonzero
  // pivot offset here would create a large initial position error that the
  // constraint solver "snaps" shut in the first few physics steps, which can
  // blow up velocities to NaN/Infinity and crash the WebGL context. The
  // visual/collider offset (card hangs below its origin) is applied locally
  // inside the RigidBody instead, where it doesn't affect joint math.
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 0, 0],
  ]);

  useEffect(() => {
    document.body.style.cursor = hovered ? (dragged ? "grabbing" : "grab") : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [fixed, j1, j2, j3, card].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragOffset.current.x,
        y: vec.y - dragOffset.current.y,
        z: vec.z - dragOffset.current.z,
      });
    }

    if (band.current && fixed.current && j1.current && j2.current && j3.current) {
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.translation());
      curve.points[2].copy(j1.current.translation());
      curve.points[3].copy(fixed.current.translation());
      // Guard against transient physics instability (e.g. a hard drag throw)
      // producing NaN/Infinity, which corrupts the GL buffer and can crash
      // the WebGL context.
      if (curve.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) {
        band.current.geometry.setPoints(curve.getPoints(32));
      }
    }
  });

  return (
    <>
      <group position={[0, 3.5, 0]}>
        <RigidBody ref={fixed} {...SEGMENT_PROPS} type="fixed" />
        <RigidBody position={[0.3, 0, 0]} ref={j1} {...SEGMENT_PROPS}>
          {/* Sensor: these chain links only exist to define the rope shape and
              swing dynamics. They aren't meant to physically collide with each
              other or the card — nothing else is in the scene to collide
              with, so solid colliders here just produce jittery self-contact
              ("the badge won't sit still"). */}
          <BallCollider args={[0.08]} sensor />
        </RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j2} {...SEGMENT_PROPS}>
          <BallCollider args={[0.08]} sensor />
        </RigidBody>
        <RigidBody position={[0.9, 0, 0]} ref={j3} {...SEGMENT_PROPS}>
          <BallCollider args={[0.08]} sensor />
        </RigidBody>
        <RigidBody
          position={[0.95, -0.05, 0]}
          ref={card}
          {...SEGMENT_PROPS}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.1, 0.03]} position={[0, -1.1, 0]} sensor />
          <group
            position={[0, -1.1, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              setDragged(false);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture(e.pointerId);
              const translation = card.current.translation();
              dragOffset.current.copy(e.point).sub(new THREE.Vector3(translation.x, translation.y, translation.z));
              setDragged(true);
            }}
          >
            <BadgeCard />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#22d3ee"
          depthTest={false}
          resolution={[size.width, size.height]}
          lineWidth={0.06}
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  );
}
