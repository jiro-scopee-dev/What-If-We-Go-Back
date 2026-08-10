"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuseumJourney from "@/components/MuseumJourney";
import Exhibition from "@/components/Exhibition";
import type { Phase } from "@/lib/types";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("journey");
  const timers = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const enter = useCallback(() => {
    if (phaseRef.current !== "journey") return;
    setPhase("veil");
    timers.current.push(window.setTimeout(() => setPhase("dissolve"), 550));
    timers.current.push(
      window.setTimeout(() => {
        window.scrollTo(0, 0);
        setPhase("gallery");
      }, 1800),
    );
  }, []);

  const back = useCallback(() => {
    setPhase("journey");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <main className="relative">
      <MuseumJourney phase={phase} onEnter={enter} />
      <Exhibition phase={phase} onBack={back} />
    </main>
  );
}
