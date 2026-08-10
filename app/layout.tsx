import type { Metadata, Viewport } from "next";
import { Vollkorn, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const vollkorn = Vollkorn({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-vollkorn",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "What If We Go Back — A Memory Archive",
  description:
    "Chapter 01 — Entering the Museum. A memory archive of the Junior High years. Walk in, then look at what we kept.",
};

export const viewport: Viewport = {
  themeColor: "#0A0908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${vollkorn.variable} ${plexMono.variable} bg-ink text-bone antialiased`}>
        {/*
          CONTRACT — Chapter 01: Entering the Museum (seed c7720367)
          THESIS: A scroll is a walk. The visitor physically enters a museum of
          memories frame by frame; the interface is a hushed gallery around the
          camera, never a slideshow over it.
          OWN-WORLD: Amber-lit night museum. Near-black veils, bone-warm serif
          (Vollkorn) for the poetry, archival mono (IBM Plex Mono) labels, a
          brass-amber accent, hairline rules, filmic vignette and letterbox.
          STORY: You stand outside. You approach, reach the doors, enter, and
          the ordinary days surface until "WE WANT TO GO BACK." — then you
          step into the exhibition that is the memories themselves.
          FIRST VIEWPORT: Frame 001 full-bleed on a fixed canvas, a small
          tracked "MEMORY ARCHIVE" wordmark top-left, "SCROLL TO ENTER" bottom
          center, one amber tick. Nothing else.
          FORM: Scroll-linked canvas image-sequence (151 frames, eased), copy
          reveals keyed to walk progress, a dissolve-through-veil transition
          into the exhibition interior. Grounded candidate 7 of the assigned
          direction; the brief pins the museum walk and beats the roll.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, and DESIGN.md
        */}
        <div
          aria-hidden="true"
          style={{ display: "none" }}
          data-contract="impeccable"
        >
          CONTRACT c7720367 THESIS scroll-is-a-walk OWN-WORLD amber-lit-night-museum STORY outside-to-exhibition
          FIRST-VIEWPORT frame-001-full-bleed FORM canvas-sequence-dissolve FINISH unreviewed-and-undocumented-is-unfinished
        </div>
        {children}
      </body>
    </html>
  );
}
