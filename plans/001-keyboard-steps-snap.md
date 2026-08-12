# 001 — Keyboard-initiated corridor steps must not run the 750ms pan

- **Status**: TODO
- **Commit**: `5accc08`
- **Severity**: HIGH
- **Category**: Purpose & frequency, Performance
- **Estimated scope**: 1 file, ~10 lines

## Problem

In `components/Corridor.tsx`, pressing the arrow keys steps the gallery the same way the PREV/NEXT buttons do: every keypress runs a 750ms tween on **~11 mounted `motion.figure` elements** (two concurrent tweens each: `x` on the figure at line 172 and `scale` on the inner div at line 178 — ~20+ main-thread animations per step, animating large `max-h-[52vh]` images).

Keyboard navigation is a high-frequency action (arrows can be pressed dozens of times in a row, or held for auto-repeat). Per the audit playbook, animation on keyboard-initiated actions must be removed or drastically reduced. This also multiplies the main-thread animation cost on every keypress.

Current code:

```tsx
// components/Corridor.tsx:70-76 — step()
const step = useCallback(
  (delta: number) => {
    advance(delta);
    startTicker();
  },
  [advance, startTicker],
);
```

```tsx
// components/Corridor.tsx:78-85 — keyboard handler
const onKey = (e: KeyboardEvent) => {
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
};
```

```tsx
// components/Corridor.tsx:169-181 — the per-slot animations (current)
<motion.figure
  key={li}
  initial={false}
  animate={{ x: off * frameW }}
  transition={{ type: "tween", duration: 0.75, ease: EASE }}
  ...
  <motion.div
    animate={{ scale: isFocus ? 1.1 : 0.92 }}
    transition={{ type: "tween", duration: 0.5, ease: EASE }}
```

## Target

- **Keyboard-initiated steps** (ArrowLeft/ArrowRight) run a fast micro-slide: `duration: 0.15`, `ease: "easeOut"` — drastic reduction, preserving a hint of spatial continuity.
- **Button-initiated steps** (PREV/NEXT) keep the cinematic 750ms pan.
- **The auto-ticker** (every 3.5s) keeps the cinematic 750ms pan.
- The focus `scale` transition follows the same switch: `duration: 0.15` when instant, `0.5` otherwise.

## Repo conventions to follow

- The pan uses framer-motion `motion.figure` with `type: "tween"` and the shared `EASE = [0.22, 1, 0.36, 1]` const (`components/Corridor.tsx:12`). Keep that const; do not touch it (plan 004 swaps it for a shared import).
- State that affects rendering is React state; refs are used for values the rAF loop reads (`pausedRef`, `tickRef`). The `instant` flag affects the `transition` prop, so it must be React state.

## Steps

1. In `components/Corridor.tsx`, add state near line 33 (`const [start, setStart] = useState(0);`):

```tsx
const [instant, setInstant] = useState(false);
```

2. Change `step` (lines 70-76) to accept and record the initiator:

```tsx
const step = useCallback(
  (delta: number, instant = false) => {
    setInstant(instant);
    advance(delta);
    startTicker();
  },
  [advance, startTicker],
);
```

3. Update the keyboard handler (lines 78-85) to mark steps as instant:

```tsx
if (e.key === "ArrowLeft") step(-1, true);
if (e.key === "ArrowRight") step(1, true);
```

4. Update `startTicker` (lines 56-62) so a ticker advance is never instant-stale — reset the flag inside the interval callback, before advancing:

```tsx
tickRef.current = setInterval(() => {
  if (!pausedRef.current) {
    setInstant(false);
    advance(1);
  }
}, TICK_MS);
```

5. The PREV/NEXT buttons (lines 226 and 239) call `step(-1)` / `step(1)` — the new default `instant = false` keeps them cinematic. No change needed; leave them.

6. Change the figure's `transition` (line 173):

```tsx
transition={{ type: "tween", duration: instant ? 0.15 : 0.75, ease: instant ? "easeOut" : EASE }}
```

7. Change the inner scale div's `transition` (line 179):

```tsx
transition={{ type: "tween", duration: instant ? 0.15 : 0.5, ease: instant ? "easeOut" : EASE }}
```

## Boundaries

- Do NOT touch `components/MuseumJourney.tsx`, `components/Exhibition.tsx`, or `app/globals.css`.
- Do NOT change the `EASE` const (plan 004 owns that).
- Do NOT add reduced-motion gating here (plan 002 owns that).
- Do NOT change markup, layout, or the pan mechanics — only the transition durations/easings and the `step` signature.
- If the code has drifted since commit `5accc08`, STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npm run lint` must pass.
- **Feel check**: `npm run dev`, open the gallery:
  - Press ArrowRight repeatedly, fast. Each step should feel like a quick, snappy micro-slide (~150ms), never the slow 750ms glide. Holding the key (auto-repeat) should stay snappy.
  - Click PREV/NEXT: the slow cinematic glide returns.
  - Let the auto-ticker fire: still the slow glide.
  - In DevTools Animations panel set playback to 10%: the keyboard micro-slide should complete in ~15ms of screen time with a fast start (easeOut), the click pan should still visibly ease.
  - Press ArrowRight then ArrowLeft mid-motion: the motion retargets without restarting from zero (framer tweens do this natively — confirm no jump or freeze).
- **Done when**: keyboard steps complete noticeably faster than click steps and `tsc --noEmit` passes.
