"use client";

/* eslint-disable @next/next/no-img-element -- locally pre-optimized webp assets, served from /public; next/image would re-encode without benefit */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PIECE_COUNT, PIECE_LARGE } from "@/lib/pieces";

const pad = (n: number) => String(n).padStart(3, "0");
const LOOP_RESET = PIECE_COUNT * 2;
const TICK_MS = 3500;
const EASE = [0.22, 1, 0.36, 1] as const;

function windowSize(width: number) {
  if (width >= 1536) return 10;
  if (width >= 1024) return 6;
  if (width >= 640) return 3;
  return 2;
}

interface CorridorProps {
  onBack: () => void;
}

export default function Corridor({ onBack }: CorridorProps) {
  const wrapRef = useRef<HTMLElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const [start, setStart] = useState(0);
  const [win, setWin] = useState(10);
  const [frameW, setFrameW] = useState(0);
  const [pinned, setPinned] = useState<ReadonlySet<number>>(() => new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      setWin(windowSize(window.innerWidth));
      setFrameW(el.clientWidth / windowSize(window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const advance = useCallback((delta: number) => {
    setStart((s) => {
      let next = s + delta;
      if (next >= LOOP_RESET) next -= PIECE_COUNT;
      if (next < 0) next += PIECE_COUNT;
      return next;
    });
  }, []);

  const startTicker = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (!pausedRef.current) advance(1);
    }, TICK_MS);
  }, [advance]);

  useEffect(() => {
    startTicker();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [startTicker]);

  const step = useCallback(
    (delta: number) => {
      advance(delta);
      startTicker();
    },
    [advance, startTicker],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const togglePin = useCallback((i: number) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const download = useCallback(async () => {
    if (pinned.size === 0 || busy) return;
    setBusy(true);
    try {
      const ids = [...pinned]
        .sort((a, b) => a - b)
        .map((i) => i + 1)
        .join(",");
      const res = await fetch(`/api/download?ids=${encodeURIComponent(ids)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memories.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }, [pinned, busy]);

  const slots = Array.from({ length: win + 1 }, (_, i) => start + i);
  const focus = Math.floor(win / 2);

  return (
    <section
      ref={wrapRef}
      aria-label="The Hall of Ordinary Days"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      className="fixed inset-0 z-30 overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/backgroundimage.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="vignette absolute inset-0" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 bg-amber" aria-hidden="true" />
          <span className="mono text-[10px] tracking-[0.32em] text-bone/80 md:text-[11px]">
            THE HALL OF ORDINARY DAYS
          </span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mono text-[10px] tracking-[0.4em] text-bone/55 transition-colors duration-300 hover:text-amber md:text-[11px]"
        >
          WALK BACK OUT
        </button>
      </header>

      <div className="absolute inset-x-0 bottom-[16vh] top-[16vh] z-10">
        {frameW > 0 &&
          slots.map((li) => {
            const idx = li % PIECE_COUNT;
            const off = li - start;
            const isFocus = off === focus;
            return (
              <motion.figure
                key={li}
                initial={false}
                animate={{ x: off * frameW }}
                transition={{ type: "tween", duration: 0.75, ease: EASE }}
                className="absolute left-0 top-0 flex h-full flex-col items-center justify-center"
                style={{ width: frameW, zIndex: isFocus ? 20 : 10 }}
              >
                <motion.div
                  animate={{ scale: isFocus ? 1.1 : 0.92 }}
                  transition={{ type: "tween", duration: 0.5, ease: EASE }}
                  className="relative flex h-full w-full flex-col items-center justify-center"
                >
                  <div className="relative w-[76%]">
                    <div className="rounded-[2px] bg-[#4a3220] p-1.5 shadow-[0_24px_60px_rgba(5,4,4,0.65)]">
                      <div className="rounded-[1px] bg-[#f1e9d6] p-2 md:p-3">
                        <img
                          src={PIECE_LARGE[idx]}
                          alt={`Memory Nº ${pad(idx + 1)}`}
                          loading="lazy"
                          decoding="async"
                          className="max-h-[52vh] w-full object-contain"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePin(idx)}
                      aria-pressed={pinned.has(idx)}
                      aria-label={
                        pinned.has(idx)
                          ? `Unpin memory Nº ${pad(idx + 1)}`
                          : `Pin memory Nº ${pad(idx + 1)}`
                      }
                      className={`mono absolute -top-3 right-1 z-30 flex items-center gap-1 border px-2 py-1 text-[9px] tracking-[0.22em] transition-colors duration-300 md:right-2 md:text-[10px] ${
                        pinned.has(idx)
                          ? "border-amber bg-amber/15 text-amber"
                          : "border-bone/25 bg-ink/60 text-bone/70 hover:border-amber/60 hover:text-amber"
                      }`}
                    >
                      <span aria-hidden="true">PIN</span>
                      {pinned.has(idx) ? "NED" : ""}
                    </button>
                  </div>
                  <div className="mt-4 rounded-sm border border-[#8a6b3f]/60 bg-[#2a2016] px-3 py-1.5 shadow-md md:px-4">
                    <span className="mono text-[9px] tracking-[0.28em] text-amber/90 md:text-[10px]">
                      MEMORY Nº {pad(idx + 1)}
                    </span>
                  </div>
                </motion.div>
              </motion.figure>
            );
          })}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Walk left to the previous memory"
        className="mono absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 text-[10px] tracking-[0.32em] text-bone/60 transition-colors duration-300 hover:text-amber md:left-8"
      >
        <span className="text-2xl leading-none" aria-hidden="true">
          ◂
        </span>
        <span className="hidden md:inline">WALK</span>
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Walk right to the next memory"
        className="mono absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 text-[10px] tracking-[0.32em] text-bone/60 transition-colors duration-300 hover:text-amber md:right-8"
      >
        <span className="text-2xl leading-none" aria-hidden="true">
          ▸
        </span>
        <span className="hidden md:inline">WALK</span>
      </button>

      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <div className="mono text-[10px] tracking-[0.24em] text-bone/35 md:text-[11px]">
          {pad((start % PIECE_COUNT) + 1)} / {pad(PIECE_COUNT)}
        </div>
        <button
          type="button"
          onClick={download}
          disabled={pinned.size === 0 || busy}
          className="mono inline-flex items-center gap-3 border border-amber/60 px-6 py-3 text-[10px] tracking-[0.3em] text-bone transition-colors duration-300 hover:bg-amber/10 disabled:cursor-not-allowed disabled:border-bone/20 disabled:text-bone/30 md:px-8 md:text-[11px]"
        >
          {busy ? "PACKING…" : `DOWNLOAD PINNED (${pinned.size})`}
        </button>
        {pinned.size > 0 && (
          <button
            type="button"
            onClick={() => setPinned(new Set())}
            className="mono text-[10px] tracking-[0.3em] text-bone/40 transition-colors duration-300 hover:text-amber md:text-[11px]"
          >
            CLEAR
          </button>
        )}
      </footer>
    </section>
  );
}
