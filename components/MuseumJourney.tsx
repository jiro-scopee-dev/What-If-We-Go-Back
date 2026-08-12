"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_MUSEUM } from "@/lib/motion";
import { STAGES, ramp, frameFromProgress } from "@/lib/stages";
import type { Phase } from "@/lib/types";

const FRAME_COUNT = 151;
const WALK_MS = 6500;

const pad = (n: number) => String(n).padStart(3, "0");
const frameSrc = (i: number) => `/museum/ezgif-frame-${pad(i + 1)}.webp`;

const CONTENT: Record<string, string> = {
  somewhere: "Somewhere between then and now…",
  places: "There are places we remember…",
  notBecause: "Not because they were extraordinary.",
  becauseWeWere: "But because we were.",
  juniorHigh: "Junior High.",
  neverLeave: "A place we once thought we'd never leave.",
  makingMemories: "We didn't know we were making memories.",
  livingThem: "We were just living them.",
  classrooms: "The classrooms.",
  laughter: "The laughter.",
  people: "The people beside us.",
  ordinaryDays: "The ordinary days.",
  feltOrdinary: "The moments that felt ordinary…",
  becameMemories: "until they became memories.",
  somehow: "And somehow…",
  wantToGoBack: "WE WANT TO GO BACK.",
  oneMoreTime: "Just one more time.",
};

const COPY_STAGES: { id: string; inner: string }[] = [
  { id: "somewhere", inner: "text-center font-serif italic text-xl text-bone md:text-2xl" },
  { id: "places", inner: "text-center font-serif text-2xl text-bone md:text-3xl" },
  { id: "notBecause", inner: "text-center font-serif text-2xl text-bone md:text-3xl" },
  { id: "becauseWeWere", inner: "text-center font-serif text-2xl italic text-bone md:text-3xl" },
  { id: "juniorHigh", inner: "translate-y-16 text-center font-serif text-4xl text-bone md:text-5xl" },
  { id: "neverLeave", inner: "translate-y-28 text-center font-serif text-xl italic text-bone/80 md:text-2xl" },
  { id: "makingMemories", inner: "text-center font-serif text-2xl text-bone md:text-3xl" },
  { id: "livingThem", inner: "text-center font-serif text-2xl italic text-bone md:text-3xl" },
  { id: "classrooms", inner: "-translate-y-32 text-center font-serif text-3xl text-bone md:text-4xl" },
  { id: "laughter", inner: "-translate-y-16 text-center font-serif text-3xl text-bone md:text-4xl" },
  { id: "people", inner: "text-center font-serif text-3xl text-bone md:text-4xl" },
  { id: "ordinaryDays", inner: "translate-y-16 text-center font-serif text-3xl text-bone md:text-4xl" },
  { id: "feltOrdinary", inner: "translate-y-32 text-center font-serif text-3xl text-bone md:text-4xl" },
  { id: "becameMemories", inner: "text-center font-serif text-3xl italic text-amber md:text-4xl" },
  { id: "somehow", inner: "text-center font-serif text-2xl italic text-bone/70 md:text-3xl" },
  { id: "wantToGoBack", inner: "text-center font-serif text-5xl leading-tight tracking-[0.06em] text-bone md:text-7xl" },
  { id: "oneMoreTime", inner: "translate-y-24 text-center font-serif text-xl italic text-bone/80 md:text-2xl" },
];

interface MuseumJourneyProps {
  phase: Phase;
  onEnter: () => void;
}

export default function MuseumJourney({ phase, onEnter }: MuseumJourneyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageEls = useRef(new Map<string, HTMLElement>());
  const lineRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLSpanElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const progress = useRef(0);
  const phaseRef = useRef(phase);
  const playingRef = useRef(false);
  const completedRef = useRef(false);
  const startRef = useRef(0);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  phaseRef.current = phase;

  const [playing, setPlaying] = useState(false);

  const register = useCallback((el: HTMLElement | null, id: string) => {
    if (el) stageEls.current.set(id, el);
    else stageEls.current.delete(id);
  }, []);

  const startWalk = useCallback(() => {
    if (playingRef.current || phaseRef.current !== "journey") return;
    playingRef.current = true;
    setPlaying(true);
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    const ensure = (i: number) => {
      if (i < 0 || i >= FRAME_COUNT) return;
      if (!frames.current[i]) {
        const im = new Image();
        im.decoding = "async";
        im.src = frameSrc(i);
        frames.current[i] = im;
      }
    };

    const ensureWindow = (target: number) => {
      const lo = Math.max(0, target - 24);
      const hi = Math.min(FRAME_COUNT - 1, target + 40);
      for (let i = lo; i <= hi; i++) ensure(i);
    };

    const nearestLoaded = (target: number): HTMLImageElement | null => {
      for (let i = target; i >= 0; i--) {
        const im = frames.current[i];
        if (im && im.complete && im.naturalWidth > 0) return im;
      }
      for (let i = target + 1; i < FRAME_COUNT; i++) {
        const im = frames.current[i];
        if (im && im.complete && im.naturalWidth > 0) return im;
      }
      return null;
    };

    const sizeCanvas = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      cv.style.width = `${window.innerWidth}px`;
      cv.style.height = `${window.innerHeight}px`;
    };

    let drawTick = -1;
    const draw = (target: number) => {
      const cv = canvasRef.current;
      const ctx = cv?.getContext("2d");
      if (!cv || !ctx) return;
      let img = frames.current[target];
      if (!img || !img.complete || img.naturalWidth === 0) img = nearestLoaded(target);
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const iw = img.naturalWidth || 1280;
      const ih = img.naturalHeight || 720;
      const cw = cv.width;
      const ch = cv.height;
      const s = Math.max(cw / iw, ch / ih);
      const dw = iw * s;
      const dh = ih * s;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      drawTick = target;
    };

    let raf = 0;
    let tick = 0;
    const loop = () => {
      if (playingRef.current && !completedRef.current) {
        progress.current = Math.min(1, (performance.now() - startRef.current) / WALK_MS);
        if (progress.current >= 1) {
          completedRef.current = true;
          onEnter();
        }
      }
      const p = progress.current;
      const target = frameFromProgress(p);
      ensureWindow(target);
      if (tick % 2 === 0) {
        for (let i = 0; i < FRAME_COUNT; i++) {
          if (!frames.current[i]) {
            ensure(i);
            break;
          }
        }
      }
      tick++;
      if (target !== drawTick) draw(target);

      stageEls.current.forEach((el, id) => {
        const def = STAGES.find((s) => s.id === id);
        if (!def) return;
        const v = ramp(p, def);
        el.style.opacity = String(v);
        if (reducedRef.current) {
          el.style.transform = "";
        } else {
          el.style.transform = `translateY(${(1 - v) * 14}px)`;
        }
      });

      if (lineRef.current) lineRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (figRef.current) figRef.current.textContent = `FIG. ${pad(target + 1)} / ${FRAME_COUNT}`;

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => sizeCanvas();

    ensure(0);
    sizeCanvas();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [onEnter]);

  const trackOpen = phase !== "gallery";

  useEffect(() => {
    if (!trackOpen) return;
    const cv = canvasRef.current;
    if (cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      cv.style.width = `${window.innerWidth}px`;
      cv.style.height = `${window.innerHeight}px`;
    }
    progress.current = 0;
    playingRef.current = false;
    completedRef.current = false;
    setPlaying(false);
  }, [trackOpen]);

  const ctaVisible = phase === "journey" && !playing;

  return (
    <section
      aria-label="Entering the Museum"
      className="fixed inset-0 z-10"
      style={{ display: trackOpen ? "block" : "none" }}
    >
      {trackOpen && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={
              phase === "dissolve"
                ? reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.05, filter: "blur(10px)" }
                : reduced
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: phase === "dissolve" ? 1.1 : 0.6, ease: EASE_MUSEUM }}
          >
            <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
          </motion.div>

          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 to-transparent" />

          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={false}
            animate={{ opacity: phase === "journey" ? 0 : 0.55 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-ink/80" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-3 md:left-10 md:top-8"
            initial={false}
            animate={{ opacity: phase === "journey" ? 0.55 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="h-1.5 w-1.5 bg-amber" aria-hidden="true" />
            <span className="mono text-[10px] tracking-[0.32em] text-bone/80 md:text-[11px]">MEMORY ARCHIVE</span>
          </motion.div>

          <div className="pointer-events-none absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-12">
            <div className="relative h-px w-44 overflow-hidden bg-bone/15 md:w-56">
              <div ref={lineRef} data-line className="absolute inset-0 origin-left bg-amber/90" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>

          <span
            ref={figRef}
            data-fig
            className="mono pointer-events-none absolute bottom-9 right-6 z-10 text-[10px] tracking-[0.25em] text-bone/35 md:right-10"
          >
            FIG. 001 / 151
          </span>

          {COPY_STAGES.map(({ id, inner }) => (
            <div
              key={id}
              ref={(el) => register(el, id)}
              data-stage={id}
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            >
              <div className={inner} style={{ textShadow: "0 2px 28px rgba(5,4,4,0.7)" }}>
                {CONTENT[id]}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={startWalk}
            data-cta
            aria-label="Enter the museum"
            className={`absolute right-6 top-1/2 z-20 -translate-y-1/2 border border-amber/60 bg-ink/40 px-8 py-5 text-left outline-none backdrop-blur-[2px] transition-[transform,opacity,border-color,background-color] duration-300 ease-out focus-visible:border-amber hover:border-amber hover:bg-amber/10 active:scale-[0.97] md:right-12 md:px-10 ${
              ctaVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <span className="mono text-sm tracking-[0.34em] text-bone md:text-base">ENTER THE MUSEUM</span>
          </button>

          <div className="sr-only">
            A museum of memories. Press ENTER THE MUSEUM to walk through the doors and
            arrive at the exhibition inside.
          </div>
          <div className="sr-only" aria-hidden="true">
            <p>Somewhere between then and now…</p>
            <p>There are places we remember… Not because they were extraordinary. But because we were.</p>
            <p>Junior High. A place we once thought we&apos;d never leave.</p>
            <p>We didn&apos;t know we were making memories. We were just living them.</p>
            <p>The classrooms. The laughter. The people beside us. The ordinary days. The moments that felt ordinary…
              until they became memories.</p>
            <p>And somehow… WE WANT TO GO BACK. Just one more time.</p>
          </div>
        </div>
      )}
    </section>
  );
}
