"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ORANGE = "#ff7d33";
const DASH = "1px dashed rgba(255,255,255,0.4)";

// Prevents the background from flashing before the loader covers it
const LOADER_BG = "#0a0a0a";

function BezierHandle({ isVertical, size = "60px" }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      {/* The line and dots */}
      <div
        style={{
          position: "absolute",
          width: isVertical ? "1px" : size,
          height: isVertical ? size : "1px",
          backgroundColor: ORANGE,
        }}
      >
        {/* End caps (dots) */}
        <div style={{
          position: "absolute",
          top: isVertical ? -3 : -2,
          left: isVertical ? -2 : -3,
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: ORANGE
        }} />
        <div style={{
          position: "absolute",
          bottom: isVertical ? -3 : "auto",
          top: !isVertical ? -2 : "auto",
          right: !isVertical ? -3 : "auto",
          left: isVertical ? -2 : "auto",
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: ORANGE
        }} />
      </div>
      {/* The center square */}
      <div style={{
        position: "absolute",
        width: 6,
        height: 6,
        backgroundColor: ORANGE,
      }} />
    </div>
  );
}

export function LoaderOverlay() {
  const { active, progress } = useProgress();
  const [complete, setComplete] = useState(false);

  const wrapperRef = useRef(null);
  const visualRef = useRef(null);
  const dismissed = useRef(false);

  // Lock scroll while the overlay is visible
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const dismiss = () => {
    if (dismissed.current || !wrapperRef.current) return;
    dismissed.current = true;
    document.body.style.overflow = "";

    gsap.to(wrapperRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      delay: 0.3,
      onComplete: () => setComplete(true),
    });
    gsap.to(visualRef.current, {
      scale: 1.05,
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      delay: 0.3,
    });
  };

  // Primary: dismiss once drei reports loading finished
  useEffect(() => {
    if (!active && progress >= 100) dismiss();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, progress]);

  // Fallback: force-dismiss after 10 s in case loader events never fire
  useEffect(() => {
    const id = setTimeout(dismiss, 10000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (complete) return null;

  // The actual cookie fills 34.7vh on initial load (FOV45, z=10, scale=1.44)
  const circleSize = "34.7vh"; 

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: LOADER_BG,
        pointerEvents: "all",
      }}
    >
      <div ref={visualRef} style={{ position: "relative", width: circleSize, height: circleSize }}>
        
        {/* ── BACKGROUND GRID ── */}
        <div style={{
          position: "absolute",
          // Extend far beyond the circle
          top: "-50%", bottom: "-50%", left: "-50%", right: "-50%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "25% 25%", // Divides the extending area into grid squares matching the bounds
          backgroundPosition: "center center",
          zIndex: 1,
          maskImage: "radial-gradient(circle closest-side, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle closest-side, black 40%, transparent 100%)",
        }} />

        {/* ── CONIC PROGRESS SWEEP ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(rgba(255,255,255,0.12) ${progress}%, transparent 0)`,
            zIndex: 2,
          }}
        />

        {/* ── OUTER DASHED CIRCLE ── */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: DASH,
          zIndex: 3,
        }}>
          {/* Handles */}
          <div style={{ position: "absolute", top: 0, left: "50%" }}><BezierHandle isVertical={false} size="8vh" /></div>
          <div style={{ position: "absolute", bottom: 0, left: "50%" }}><BezierHandle isVertical={false} size="8vh" /></div>
          <div style={{ position: "absolute", top: "50%", left: 0 }}><BezierHandle isVertical={true} size="8vh" /></div>
          <div style={{ position: "absolute", top: "50%", right: 0 }}><BezierHandle isVertical={true} size="8vh" /></div>
        </div>

        {/* ── INNER DASHED CIRCLE ── */}
        <div style={{
          position: "absolute",
          inset: "28%", // Shrink inside to mimic the cookie's inner ridge
          borderRadius: "50%",
          border: DASH,
          zIndex: 3,
        }}>
          {/* Handles */}
          <div style={{ position: "absolute", top: 0, left: "50%" }}><BezierHandle isVertical={false} size="4vh" /></div>
          <div style={{ position: "absolute", bottom: 0, left: "50%" }}><BezierHandle isVertical={false} size="4vh" /></div>
          <div style={{ position: "absolute", top: "50%", left: 0 }}><BezierHandle isVertical={true} size="4vh" /></div>
          <div style={{ position: "absolute", top: "50%", right: 0 }}><BezierHandle isVertical={true} size="4vh" /></div>
        </div>

      </div>

      {/* ── TEXT ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          marginTop: "24vh",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "0.6rem",
          letterSpacing: "0.4em",
          fontWeight: 400,
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        LOADING MODELS <span style={{ color: "rgba(255,255,255,0.8)" }}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
