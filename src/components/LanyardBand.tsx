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
  angularDamping: 4,
  linearDamping: 4,
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
  const restTime = useRef(0);
  const correcting = useRef(false);
  const currentQuat = useMemo(() => new THREE.Quaternion(), []);
  const faceForwardQuat = useMemo(() => new THREE.Quaternion(), []);

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

  useFrame((state, delta) => {
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
      restTime.current = 0;
      correcting.current = false;
    } else if (card.current) {
      // If a drag flips the badge over, gently turn it back to face the
      // camera once it's settled down for a moment — rather than leaving it
      // stuck showing its back indefinitely.
      const angvel = card.current.angvel();
      const linvel = card.current.linvel();
      const atRest =
        Math.hypot(angvel.x, angvel.y, angvel.z) < 0.2 && Math.hypot(linvel.x, linvel.y, linvel.z) < 0.2;

      if (atRest) {
        restTime.current += delta;
      } else {
        restTime.current = 0;
        correcting.current = false;
      }

      if (restTime.current > 1) {
        correcting.current = true;
      }

      if (correcting.current) {
        const r = card.current.rotation();
        currentQuat.set(r.x, r.y, r.z, r.w);
        currentQuat.slerp(faceForwardQuat, 0.06);
        card.current.setRotation(currentQuat, true);
        card.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        if (currentQuat.angleTo(faceForwardQuat) < 0.02) {
          correcting.current = false;
          restTime.current = 0;
        }
      }
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
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j2} {...SEGMENT_PROPS}>
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.9, 0, 0]} ref={j3} {...SEGMENT_PROPS}>
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody
          position={[0.95, -0.05, 0]}
          ref={card}
          {...SEGMENT_PROPS}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.1, 0.03]} position={[0, -1.1, 0]} />
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
