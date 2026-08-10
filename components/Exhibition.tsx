"use client";

/* eslint-disable @next/next/no-img-element -- locally pre-optimized webp assets, served from /public; next/image would re-encode without benefit */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PIECE_COUNT, PIECE_THUMBS, PIECE_LARGE } from "@/lib/pieces";
import type { Phase } from "@/lib/types";

const pad = (n: number) => String(n).padStart(3, "0");

interface ExhibitionProps {
  phase: Phase;
  onBack: () => void;
}

export default function Exhibition({ phase, onBack }: ExhibitionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const shown = phase !== "journey";
  const galleryVisible = phase === "gallery";
  const lastSelected = useRef<number | null>(null);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!shown) setSelected(null);
  }, [shown]);

  useEffect(() => {
    if (selected === null) return;
    lastSelected.current = selected;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected, close]);

  return (
    <section id="exhibition" aria-label="The Exhibition" className="relative">
      <div className="pointer-events-none fixed inset-0 z-20">
        <motion.img
          src={PIECE_LARGE[0]}
          alt=""
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: shown ? (galleryVisible ? 0.22 : 0.85) : 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
      </div>

      <AnimatePresence>
        {galleryVisible && (
          <motion.div
            key="interior"
            className="relative z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <header className="relative flex min-h-[88vh] flex-col items-center justify-center px-6 text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="mono text-[10px] tracking-[0.42em] text-amber md:text-[11px]"
              >
                EXHIBITION ONE
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
                className="mt-7 max-w-3xl font-serif text-4xl leading-tight text-bone md:text-6xl"
              >
                The Hall of Ordinary Days
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.55 }}
                className="mt-6 max-w-xl font-serif text-lg italic text-bone/70 md:text-xl"
              >
                One hundred ninety-two memories, kept the way they were lived.
              </motion.p>
              <motion.button
                type="button"
                onClick={onBack}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.75 }}
                className="mono mt-12 text-[10px] tracking-[0.4em] text-bone/50 transition-colors duration-300 hover:text-amber md:text-[11px]"
              >
                WALK BACK OUT TO THE ENTRANCE
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 1 }}
                className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
              >
                <p className="mono text-[10px] tracking-[0.42em] text-bone/40">SCROLL TO WANDER</p>
                <div className="hairline-h w-44" />
              </motion.div>
            </header>

            <div className="relative bg-ink">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/0 to-ink" />
              <div className="mx-auto max-w-[1680px] px-3 pb-6 pt-14 md:px-8 md:pb-10">
                <div className="columns-2 gap-3 md:columns-3 md:gap-5 xl:columns-4">
                  {PIECE_THUMBS.map((src, i) => (
                    <motion.figure
                      key={i}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-8% 0px" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="group mb-3 cursor-zoom-in break-inside-avoid md:mb-5"
                      onClick={() => setSelected(i)}
                    >
                      <div className="overflow-hidden bg-ink/60">
                        <img
                          src={src}
                          alt={`Memory Nº ${pad(i + 1)}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full transition-transform duration-[900ms] ease-museum group-hover:scale-[1.045]"
                        />
                      </div>
                      <figcaption className="mono mt-2 flex items-baseline justify-between text-[10px] tracking-[0.2em] text-bone/40">
                        <span>Nº {pad(i + 1)}</span>
                        <span className="text-amber/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          VIEW
                        </span>
                      </figcaption>
                    </motion.figure>
                  ))}
                </div>
              </div>
            </div>

            <footer className="relative border-t border-bone/10 bg-ink px-6 py-16 text-center">
              <p className="font-serif text-lg italic text-bone/60">What if we go back?</p>
              <p className="mono mt-4 text-[10px] tracking-[0.34em] text-bone/35">
                MEMORY ARCHIVE — CHAPTER 01 · ENTERING THE MUSEUM
              </p>
              <button
                type="button"
                onClick={onBack}
                className="mono mt-8 text-[10px] tracking-[0.4em] text-bone/40 transition-colors duration-300 hover:text-amber md:text-[11px]"
              >
                RETURN TO THE ENTRANCE
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Memory Nº ${pad(selected + 1)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 p-6"
            onClick={close}
          >
            <button
              type="button"
              autoFocus
              onClick={close}
              className="mono absolute right-8 top-7 text-[11px] tracking-[0.32em] text-bone/55 transition-colors duration-300 hover:text-bone"
            >
              CLOSE
            </button>
            <motion.img
              src={PIECE_LARGE[selected]}
              alt={`Memory Nº ${pad(selected + 1)}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <div className="mt-6 flex items-center gap-6">
              <span className="mono text-[11px] tracking-[0.32em] text-bone/50">MEMORY Nº {pad(selected + 1)}</span>
            </div>
            <div className="mt-5 flex items-center gap-8">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selected > 0) setSelected(selected - 1);
                }}
                disabled={selected === 0}
                className="mono text-[11px] tracking-[0.32em] text-bone/50 transition-colors duration-300 hover:text-amber disabled:opacity-25"
              >
                ◂ PREV
              </button>
              <span className="mono text-[10px] tracking-[0.24em] text-bone/30">
                {pad(selected + 1)} / {pad(PIECE_COUNT)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selected < PIECE_COUNT - 1) setSelected(selected + 1);
                }}
                disabled={selected === PIECE_COUNT - 1}
                className="mono text-[11px] tracking-[0.32em] text-bone/50 transition-colors duration-300 hover:text-amber disabled:opacity-25"
              >
                NEXT ▸
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
