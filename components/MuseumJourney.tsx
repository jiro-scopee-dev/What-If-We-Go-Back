"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { STAGES, CTA_STAGE, ramp, frameFromProgress } from "@/lib/stages";
import type { Phase } from "@/lib/types";

const FRAME_COUNT = 151;
const TRACK_VH = 5.5;

const pad = (n: number) => String(n).padStart(3, "0");
const frameSrc = (i: number) => `/museum/ezgif-frame-${pad(i + 1)}.jpg`;

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

function scrollProgress() {
  const scrollable = TRACK_VH * window.innerHeight - window.innerHeight;
  return Math.min(1, Math.max(0, window.scrollY / scrollable));
}

interface MuseumJourneyProps {
  phase: Phase;
  onEnter: () => void;
}

export default function MuseumJourney({ phase, onEnter }: MuseumJourneyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageEls = useRef(new Map<string, HTMLElement>());
  const ctaRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLSpanElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const progress = useRef(0);
  const phaseRef = useRef(phase);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  phaseRef.current = phase;

  const register = useCallback((el: HTMLElement | null, id: string) => {
    if (el) stageEls.current.set(id, el);
    else stageEls.current.delete(id);
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

      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - ramp(p, { id: "hint", start: 0, rise: 0.05, fall: 0.09, gone: 0.13 }));
      }
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (figRef.current) figRef.current.textContent = `FIG. ${pad(target + 1)} / ${FRAME_COUNT}`;
      if (ctaRef.current) {
        const ph = phaseRef.current;
        const o = ph === "journey" ? ramp(p, CTA_STAGE) : ph === "veil" ? 1 : 0;
        ctaRef.current.style.opacity = String(o);
        ctaRef.current.style.transform = ph === "veil" ? "scale(1.05)" : "scale(1)";
        ctaRef.current.style.pointerEvents = o > 0 ? "auto" : "none";
      }

      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      progress.current = scrollProgress();
    };
    const onResize = () => sizeCanvas();

    ensure(0);
    sizeCanvas();
    onScroll();
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
    progress.current = scrollProgress();
  }, [trackOpen]);

  return (
    <section
      aria-label="Entering the Museum"
      className="relative w-full"
      style={{ height: trackOpen ? `${TRACK_VH * 100}vh` : "0px" }}
    >
      {trackOpen && (
        <div className="fixed inset-0 z-10 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={
              phase === "dissolve"
                ? { opacity: 0, scale: 1.05, filter: "blur(10px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: phase === "dissolve" ? 1.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
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

          <div ref={hintRef} data-hint className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-4">
            <p className="mono text-[10px] tracking-[0.42em] text-bone/60 md:text-[11px]">SCROLL TO ENTER</p>
            <div className="hairline-h w-44" />
          </div>

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
            ref={ctaRef}
            type="button"
            onClick={onEnter}
            data-cta
            style={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-[16vh] z-20 flex flex-col items-center gap-5 outline-none transition-[opacity,transform] duration-500 ease-out focus-visible:opacity-100 md:bottom-[20vh]"
            aria-label="See the art pieces — enter the archive"
          >
            <span className="inline-flex items-center justify-center border border-amber/60 px-12 py-5 transition-colors duration-500 hover:bg-amber/10 md:px-16">
              <span className="mono text-base tracking-[0.34em] text-bone md:text-lg">SEE ARTPIECES</span>
            </span>
            <span className="mono text-[10px] tracking-[0.4em] text-bone/55 md:text-[11px]">ENTER THE ARCHIVE</span>
          </button>

          <div className="sr-only">
            A scroll-controlled walk into a museum of memories: standing outside, approaching the doors, entering,
            and arriving at the exhibition inside.
          </div>
        </div>
      )}

      <div className="sr-only" aria-hidden="true">
        <p>Somewhere between then and now…</p>
        <p>There are places we remember… Not because they were extraordinary. But because we were.</p>
        <p>Junior High. A place we once thought we&apos;d never leave.</p>
        <p>We didn&apos;t know we were making memories. We were just living them.</p>
        <p>The classrooms. The laughter. The people beside us. The ordinary days. The moments that felt ordinary…
          until they became memories.</p>
        <p>And somehow… WE WANT TO GO BACK. Just one more time.</p>
      </div>
    </section>
  );
}
