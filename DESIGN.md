# Design — What If We Go Back

<!-- impeccable:design-schema 1 -->

## World

**Amber-lit night museum.** The frames are the camera; the interface is the museum around them — a hushed gallery lit only by the sequence itself. Near-black warm veils, bone-warm serif poetry, archival mono labels, one brass-amber accent, hairline rules, filmic vignette and letterbox.

## Source

The `/museum` sequence (151 frames, 1280×720) is the walk-in camera — never a slideshow. Scroll maps to frame with a gentle `easeInOutSine`, holding on frame 001 at rest and settling on frame 151 for the final ~8% of the track. No artificial camera motion is added.

## Surface — Chapter 01: Entering the Museum (Experience mode)

Scroll track is `5.5 × 100vh`. A fixed full-viewport canvas plays the frames cover-fit via rAF; copy stages fade in/out as progress ramps, each line eased with a slight upward drift. Stages: wordmark + "SCROLL TO ENTER" → "Somewhere between then and now…" → approach lines → "Junior High." entrance → "making memories" → interior list (classrooms / laughter / people / ordinary days) → "until they became memories." → "And somehow…" → **WE WANT TO GO BACK.** → "Just one more time." → CTA.

**SEE ARTPIECES** dissolves through a dark veil: canvas blurs/scales out while the first piece crossfades in, then the exhibition interior fades up. The gallery is the exhibition inside the museum — not a separate section. "Walk back out" reopens the track and scrolls home through the reversed frames.

## Palette

| Token | Value | Role |
|---|---|---|
| ink | `#0A0908` / `#050404` | grounds, veils, letterbox |
| bone | `#EBE3D2` / `#B6AD9A` | text + muted text |
| amber | `#C99A48` / `#DFB967` | the single accent: tick, CTA border, exhibition eyebrow, "became memories" |

## Type

- **Vollkorn** (serif) — narrative lines, exhibition title, footer; poetic, warm, bookish; italics carry the sentimental beats.
- **IBM Plex Mono** — all labels: wordmark, FIG counter, CTA, exhibition eyebrow, piece captions; small, widely tracked (`0.2em`–`0.42em`).

## Components

- **Canvas journey** — fixed `#canvas`, cover-fit draw, dpr-capped at 1.75, progressive preload (lookahead window + idle fill; 3.8 MB total).
- **Chrome** — wordmark (top-left, amber tick), "SCROLL TO ENTER" → amber progress hairline + `FIG. NNN / 151`, filmic vignette + letterbox gradients.
- **CTA** — outlined brass button, `ENTER THE ARCHIVE` sublabel; loop-driven opacity/scale, pointer-events toggled.
- **Exhibition** — fixed hero backdrop (piece 001), header ("EXHIBITION ONE / The Hall of Ordinary Days"), CSS-column masonry wall of 192 numbered memories (lazy webp thumbs), lightbox with prev/next + Esc, "Walk back out" loop.
- **Dissolve transition** — veil → canvas blur/scale-out ↔ hero crossfade-in → interior fade-up, timed 550/1750 ms.

## Responsive

Cover-fit crop on all viewports (16:9 source). Grid: 2 → 3 → 4 columns. Text scales up at `md:` breakpoints; no horizontal overflow (verified at 390×844). Reduced-motion strips the blur/scale and drift, keeping opacity crossfades.

## Accessibility

Canvas is `aria-hidden` with an sr-only narrative; CTA is a labeled button; lightbox is `role="dialog"`/`aria-modal` with Esc and body scroll lock; piece thumbs carry `alt`; stage copy has its own sr-only block. Text shadows and bottom/top veils keep contrast over any frame.

**Focus visibility** — every interactive control shows an amber focus ring: bordered buttons `focus-visible:border-amber`, text-only buttons `focus-visible:text-amber` (CTA pattern, `MuseumJourney.tsx`; applied to all corridor controls in `Corridor.tsx`).

## Notes

- Assets: `/public/museum` (copied frames) and `/public/image/{thumbs,large}` (sharp-generated webp) are build artifacts — regenerate with `npm run assets`; originals stay in `/museum` and `/image`.
- `framer-motion` is used for transition/interior animation only; the scroll choreography is a native rAF loop for 60 fps canvas playback.
