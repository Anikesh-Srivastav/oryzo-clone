"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Center, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import { Model as Cookie } from "./model/Cookie";
import { Model as PaperClip } from "./model/PaperClip";
import { Model as Pencil } from "./model/Pencil";
import { Model as PaperCutter } from "./model/PaperCutter";

/*
  ANIMATION TIMELINE  (t = 0 → 1  over  500vh of scroll)
  ─────────────────────────────────────────────────────────
  t 0.00–0.30  Phase A: Scale up  0.18 → 0.42
                         Desk BG fades (handled via CSS --hp)
                         Props + Phase1 text fade out
  t 0.30–0.55  Phase B: Cookie holds at 0.42, dark BG settled
                         Phase2 text fades in beside it
  t 0.55–0.80  Phase C: 3D tilt & spin (shows side/bottom face)
  t 0.80–1.00  Phase D: Returns to flat top-down, settles
*/

export function Scene({ progressRef }) {
  const { viewport } = useThree();

  const cookieRef = useRef();
  const vec       = new THREE.Vector3();

  // ── Individual prop refs ──
  const clipRef   = useRef();
  const pencilRef = useRef();
  const cutterRef = useRef();

  // Per-prop slide spring state (tiny XY nudge only)
  const clipSpring   = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pencilSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const cutterSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Prop opacity state
  const propsReady = useRef(false);
  const allProps   = [clipRef, pencilRef, cutterRef];

  // Which prop is currently hovered ('clip' | 'pencil' | 'cutter' | null)
  const hoveredProp = useRef(null);

  // Slide spring: position only, friction-like damping (no rz — tilt handled separately)
  const slideStep = (spring, targetX, targetY, stiffness, damping, dt) => {
    spring.vx += (-stiffness * spring.x + stiffness * targetX - damping * spring.vx) * dt;
    spring.vy += (-stiffness * spring.y + stiffness * targetY - damping * spring.vy) * dt;
    spring.x  += spring.vx * dt;
    spring.y  += spring.vy * dt;
  };

  useFrame((state, delta) => {
    const t     = progressRef?.current ?? 0;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    const map   = THREE.MathUtils.mapLinear;
    const dt    = Math.min(delta, 0.05); // cap dt to avoid explosions

    // ── PHASE A: cookie scale ──
    const scaleA = clamp(map(t, 0, 0.30, 0.18, 0.42), 0.18, 0.42);

    // ── PHASE C/D: 3D tilt + spin ──
    const tiltC = clamp(map(t, 0.55, 0.80,  0,          -0.55), -0.55, 0);
    const tiltD = clamp(map(t, 0.80, 1.00, -0.55,         0),   -0.55, 0);
    const tilt  = t < 0.80 ? tiltC : tiltD;

    const spinC = clamp(map(t, 0.55, 0.80, 0, Math.PI * 1.4), 0, Math.PI * 1.4);
    const spinD = clamp(map(t, 0.80, 1.00, Math.PI * 1.4, Math.PI * 2), 0, Math.PI * 2);
    const spin  = t < 0.80 ? spinC : spinD;

    if (cookieRef.current) {
      cookieRef.current.scale.lerp(vec.set(scaleA, scaleA, scaleA), 7 * dt);
      cookieRef.current.rotation.x = THREE.MathUtils.lerp(cookieRef.current.rotation.x, tilt, 5 * dt);
      cookieRef.current.rotation.y = THREE.MathUtils.lerp(cookieRef.current.rotation.y, spin, 4 * dt);
      if (t > 0.28 && t < 0.55) cookieRef.current.rotation.z -= dt * 0.04;
    }

    // ── Prop opacity (fade out by t=0.28) ──
    if (!propsReady.current) {
      allProps.forEach(ref => {
        ref.current?.traverse(c => {
          if (c.isMesh && c.material) {
            c.material = c.material.clone();
            c.material.transparent = true;
            c.material.opacity = 1;
          }
        });
      });
      propsReady.current = true;
    }
    const targetOp = clamp(map(t, 0, 0.28, 1, 0), 0, 1);
    allProps.forEach(ref => {
      ref.current?.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.opacity = THREE.MathUtils.lerp(c.material.opacity, targetOp, 6 * dt);
        }
      });
    });

    // ── Individual prop hover reactions ──
    // Pure 2D slide (no tilt) to keep them strictly sliding firmly on the tabletop
    const mx  = state.pointer.x; // -1 → 1
    const my  = state.pointer.y;
    const h   = hoveredProp.current;

    // Paperclip — very fast, longer slide
    slideStep(clipSpring.current,
      h === 'clip' ? mx * 0.4 : 0,
      h === 'clip' ? my * 0.4 : 0,
      28, 7, dt);
    if (clipRef.current) {
      clipRef.current.position.x = -4.8 + clipSpring.current.x; // Middle-left
      clipRef.current.position.y =  1.2 + clipSpring.current.y;
      clipRef.current.rotation.x = 0;
      clipRef.current.rotation.y = 0;
      clipRef.current.rotation.z = -0.5; // Angled down-right
    }

    // Pencil — slower, stiff slide
    slideStep(pencilSpring.current,
      h === 'pencil' ? mx * 0.35 : 0,
      h === 'pencil' ? my * 0.35 : 0,
      20, 6, dt);
    if (pencilRef.current) {
      pencilRef.current.position.x =  2.8 + pencilSpring.current.x; // Top-right
      pencilRef.current.position.y =  3.6 + pencilSpring.current.y;
      pencilRef.current.rotation.x = 0;
      pencilRef.current.rotation.y = 0;
      pencilRef.current.rotation.z = 0.5; // Pointing towards center (bottom-left)
    }

    // Paper cutter — heavy slide
    slideStep(cutterSpring.current,
      h === 'cutter' ? mx * 0.3 : 0,
      h === 'cutter' ? my * 0.3 : 0,
      12, 5, dt);
    if (cutterRef.current) {
      cutterRef.current.position.x =  3.8 + cutterSpring.current.x; // Bottom-right
      cutterRef.current.position.y = -2.6 + cutterSpring.current.y;
      cutterRef.current.rotation.x = 0;
      cutterRef.current.rotation.y = 0;
      cutterRef.current.rotation.z = 0.6; // Pointing towards center (top-left)
    }
  });

  return (
    <>
      <ambientLight intensity={1.4} color="#fff8f0" />
      <directionalLight
        position={[0, 6, 8]} intensity={2.2} color="#fff8e7"
        castShadow shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, 2]} intensity={0.5} color="#c8d8ff" />
      <Environment resolution={256} environmentIntensity={0.35}>
        {/* Programmatic environment map that works 100% offline without GitHub fetching */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Lightformer intensity={4} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer intensity={2} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
        </group>
      </Environment>

      {/* Props — aligned to match the reference design */}
      <group
        onPointerOver={() => (hoveredProp.current = 'clip')}
        onPointerOut={() => (hoveredProp.current = null)}
      >
        <PaperClip ref={clipRef} position={[-4.8, 1.2, 0]} rotation={[0, 0, -0.5]} scale={18} />
      </group>

      <group
        onPointerOver={() => (hoveredProp.current = 'pencil')}
        onPointerOut={() => (hoveredProp.current = null)}
      >
        <Pencil ref={pencilRef} position={[2.8, 3.6, 0]} rotation={[0, 0, 0.5]} scale={0.022} />
      </group>

      <group
        onPointerOver={() => (hoveredProp.current = 'cutter')}
        onPointerOut={() => (hoveredProp.current = null)}
      >
        <PaperCutter ref={cutterRef} position={[3.8, -2.6, 0]} rotation={[0, 0, 0.6]} scale={2.6} />
      </group>

      {/* Cookie */}
      <group ref={cookieRef}>
        <Center>
          <Cookie rotation={[Math.PI / 2, 0, 0]} scale={8} />
        </Center>
      </group>
    </>
  );
}
