"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Story order: drive → wash → fold */
const CLIPS = [
  {
    src: "/videos/red.mp4",
    label: "Pickup & delivery",
    tag: "North Coast routes",
  },
  {
    src: "/videos/wash.mp4",
    label: "Wash",
    tag: "Local laundromat care",
  },
  {
    src: "/videos/folding.mp4",
    label: "Fold",
    tag: "Finished with care",
  },
] as const;

const CLIP_MS = 4200;
const FADE_MS = 700;

export function HeroVideoBackground() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const playClip = useCallback(
    (index: number) => {
      videoRefs.current.forEach((video, i) => {
        if (!video) return;
        if (i === index) {
          video.currentTime = 0;
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    []
  );

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % CLIPS.length);
    }, CLIP_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    playClip(reducedMotion ? 0 : active);
  }, [active, reducedMotion, playClip]);

  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      {CLIPS.map((clip, i) => (
        <div
          key={clip.src}
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: reducedMotion ? (i === 0 ? 1 : 0) : active === i ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="h-full w-full object-cover object-center scale-105"
            src={clip.src}
            muted
            playsInline
            autoPlay={i === 0}
            loop
            preload={i === 0 ? "auto" : "metadata"}
          />
        </div>
      ))}

      {/* Readability overlays — stronger on mobile (bottom-weighted) */}
      <div className="absolute inset-0 bg-charcoal/55 md:bg-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/50 to-charcoal/30 md:bg-gradient-to-r md:from-charcoal/92 md:via-charcoal/72 md:to-charcoal/35" />

      {/* Clip label — subtle marketing beat */}
      {!reducedMotion ? (
        <div
          key={CLIPS[active].label}
          className="absolute bottom-14 left-4 right-4 z-[1] flex justify-between items-end gap-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:flex-col sm:items-end hero-tag-enter"
        >
          <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95">
            {CLIPS[active].label}
          </span>
          <span className="hidden sm:block text-[11px] text-white/60 pr-1">{CLIPS[active].tag}</span>
        </div>
      ) : null}

      {!reducedMotion ? (
        <div className="absolute bottom-4 left-4 z-[1] flex gap-1.5 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto">
          {CLIPS.map((clip, i) => (
            <span
              key={clip.src}
              className={`h-1 rounded-full transition-all duration-500 ${
                active === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
