"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Drives Lenis through GSAP's ticker so that both share a single RAF budget.
 * lenis.on('scroll', ScrollTrigger.update) keeps ScrollTrigger in sync with
 * Lenis's smooth scroll position on every frame.
 *
 * The lenis instance is stored on window so that components (e.g.
 * HorizontalGallery) can access it if needed.
 */
export function LenisProvider({ children }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // `lerp` is a friction-based approach rather than fixed-duration easing. 
      // It yields an exceptionally premium, heavy, and unbounded buttery feel (0.05 - 0.1 is standard).
      lerp: 0.07, 
      wheelMultiplier: 1.0, 
      smoothWheel: true,
      syncTouch: true, // Syncs touch scroll so dragging isn't disconnected
    });

    // Keep ScrollTrigger scroll-position in sync with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP's ticker (= RAF) to drive Lenis instead of a separate RAF loop.
    // GSAP provides time in seconds; Lenis.raf expects milliseconds.
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
