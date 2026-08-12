"use client";

import { AnimatePresence, motion } from "framer-motion";
import Corridor from "@/components/Corridor";
import { EASE_MUSEUM } from "@/lib/motion";
import type { Phase } from "@/lib/types";

interface ExhibitionProps {
  phase: Phase;
  onBack: () => void;
}

export default function Exhibition({ phase, onBack }: ExhibitionProps) {
  const galleryVisible = phase === "gallery";

  return (
    <section id="exhibition" aria-label="The Exhibition" className="relative">
      <AnimatePresence>
        {galleryVisible && (
          <motion.div
            key="corridor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_MUSEUM }}
          >
            <Corridor onBack={onBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
