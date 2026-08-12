# 002 — Make reduced-motion consistent with the documented design

- **Status**: TODO
- **Commit**: `5accc08`
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 3 files, ~15 lines

## Problem

DESIGN.md documents the intent: *"Reduced-motion strips the blur/scale and drift, keeping opacity crossfades."* The implementation only does half of it, and contradicts the other half:

1. **The dissolve blur/scale still runs under reduced motion.** `components/MuseumJourney.tsx:234-239` animates `opacity: 0, scale: 1.05, filter: "blur(10px)"` over 1.1s with no reduced-motion branch. Only the stage-copy drift is gated (`MuseumJourney.tsx:178-182`).

2. **The corridor pan and focus-scale still run under reduced motion.** `components/Corridor.tsx:169-181` tweens `x` and `scale` with no gating — a 750ms full-screen pan of ~11 figures happens under `prefers-reduced-motion`.

3. **The global CSS rule nukes what DESIGN.md says to keep.** `app/globals.css:41-51` sets `transition-duration: 0.01ms !important` on `*` — this kills the CTA's opacity fade (`MuseumJourney.tsx:300` uses a CSS `transition-[opacity,…]`) and all hover color transitions, which are exactly the "opacity/color" feedback the doc says should survive.

Current code:

```css
/* app/globals.css:41-51 — current */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// components/MuseumJourney.tsx:234-239 — current, un-gated
animate={
  phase === "dissolve"
    ? { opacity: 0, scale: 1.05, filter: "blur(10px)" }
    : { opacity: 1, scale: 1, filter: "blur(0px)" }
}
transition={{ duration: phase === "dissolve" ? 1.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
```

## Target

- **No movement under reduced motion**: corridor `x`/`scale` tweens snap, dissolve `blur`/`scale` are dropped.
- **Opacity crossfades survive**: dissolve opacity fade, CTA CSS opacity fade, hover color changes all still animate.
- The stage-copy drift branch (`MuseumJourney.tsx:178-182`) is already correct — leave it.

## Repo conventions to follow

- `useReducedMotion` is already imported and used in `components/MuseumJourney.tsx` (line 4, used at 70-72 and 178) — this is the repo's existing pattern for JS gating. Imitate it.
- DESIGN.md line 42 is the spec: strips blur/scale/drift, keeps opacity crossfades.
- The repo already resets `scroll-behavior` under reduced motion in the same block (`globals.css:41-51`) — keep that.

## Steps

1. In `app/page.tsx`, wrap the whole experience in `MotionConfig` so every framer-motion transform animation (corridor `x`, corridor `scale`) auto-snaps when the user prefers reduced motion:

```tsx
import { MotionConfig } from "framer-motion";
// …
return (
  <main className="relative">
    <MotionConfig reducedMotion="user">
      <MuseumJourney phase={phase} onEnter={enter} />
      <Exhibition phase={phase} onBack={back} />
    </MotionConfig>
  </main>
);
```

   `MotionConfig reducedMotion="user"` disables transform animations but keeps opacity animations when `prefers-reduced-motion` is set.

2. In `components/MuseumJourney.tsx`, gate the dissolve blur/scale on the already-available `reduced` value (from `useReducedMotion()`, line 70). Replace the animate prop at lines 234-239:

```tsx
animate={
  phase === "dissolve"
    ? reduced
      ? { opacity: 0 }
      : { opacity: 0, scale: 1.05, filter: "blur(10px)" }
    : reduced
      ? { opacity: 1 }
      : { opacity: 1, scale: 1, filter: "blur(0px)" }
}
```

   Keep the existing `transition` line unchanged. The opacity crossfade survives; the blur/scale does not run.

3. In `app/globals.css`, replace the blanket `*` nuke (lines 44-51) with the scroll-behavior reset only:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

   All remaining motion is framer-driven and is now handled by `MotionConfig` + the JS branches. The CTA's CSS opacity fade and all hover color transitions (`transition-colors` on the corridor buttons) now behave like every other reduced-motion implementation in the app: color/opacity feedback stays, movement goes.

## Boundaries

- Do NOT touch `components/Corridor.tsx` (the pan itself is fixed by the `MotionConfig` wrap; its keyboard behavior is plan 001's concern).
- Do NOT remove the existing drift branch in `MuseumJourney.tsx:178-182` — it is correct and must stay.
- Do NOT add new dependencies.
- Do NOT change durations or easings.
- If the code has drifted since commit `5accc08`, STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npm run lint` must pass.
- **Feel check**: in DevTools Rendering panel, emulate `prefers-reduced-motion: reduce`, then:
  - Enter the gallery: the dissolve shows a pure opacity fade — no blur ramp, no scale-out — and the corridor appears via the Exhibition 0.9s opacity fade only.
  - Press ArrowRight / click NEXT in the corridor: the pieces **snap** to the next position instantly — no pan, no focus scale change.
  - Hover a button (e.g. PIN): the border/color still transitions (0.3s color fade preserved).
  - Click the ENTER THE MUSEUM CTA and confirm its opacity fade still plays.
  - Turn the emulation back off and confirm the cinematic pan, dissolve blur/scale, and drift are all back.
- **Done when**: no transform-based motion plays under `prefers-reduced-motion: reduce` while opacity/color transitions still animate, and `tsc --noEmit` passes.
