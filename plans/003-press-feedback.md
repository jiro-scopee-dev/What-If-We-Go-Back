# 003 — Press feedback on all pressable controls + faster color hovers

- **Status**: TODO
- **Commit**: `5accc08`
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files, ~8 class strings

## Problem

Five pressable controls have **zero press feedback** — no `:active` scale, so the button gives no physical "pressed" response:

- CTA `ENTER THE MUSEUM` — `components/MuseumJourney.tsx:300-302`
- PIN button — `components/Corridor.tsx:203-207`
- PREV / NEXT — `components/Corridor.tsx:228-229, 239-240`
- DOWNLOAD PINNED — `components/Corridor.tsx:255`
- WALK BACK OUT — `components/Corridor.tsx:156`
- CLEAR — `components/Corridor.tsx:263`

Additionally, all corridor buttons use `transition-colors duration-300` for their hover color change — 300ms is slow for a color change (budget is ~150-200ms), so the hover feels laggy.

> Note: `focus-visible:*` amber classes were already applied to all corridor controls (separate a11y pass). Keep them in every replacement string below — do not drop them.

Current class strings:

```tsx
// components/MuseumJourney.tsx:300 — current CTA
className={`absolute right-6 top-1/2 z-20 -translate-y-1/2 border border-amber/60 bg-ink/40 px-8 py-5 text-left outline-none backdrop-blur-[2px] transition-[opacity,border-color,background-color] duration-500 ease-out focus-visible:border-amber hover:border-amber hover:bg-amber/10 md:right-12 md:px-10 ${
  ctaVisible ? "opacity-100" : "pointer-events-none opacity-0"
}`}
```

```tsx
// components/Corridor.tsx:156 — current WALK BACK OUT
className="mono text-[10px] tracking-[0.4em] text-bone/55 transition-colors duration-300 hover:text-amber focus-visible:text-amber md:text-[11px]"
```

```tsx
// components/Corridor.tsx:203-207 — current pin button (representative of all corridor buttons)
className={`mono absolute -top-3 right-1 z-30 flex items-center gap-1 border px-2 py-1 text-[9px] tracking-[0.22em] transition-colors duration-300 md:right-2 md:text-[10px] ${
  pinned.has(idx)
    ? "border-amber bg-amber/15 text-amber"
    : "border-bone/25 bg-ink/60 text-bone/70 hover:border-amber/60 hover:text-amber focus-visible:border-amber"
}`}
```

## Target

- **Press feedback**: `transform: scale(0.97)` on `:active` on every pressable control, subtle (0.95–0.98 budget).
- **Press timing**: 100–160ms, ease-out.
- **Corridor color hovers**: 150ms (within the 150–200ms color budget), easing `ease-out`.
- The CTA keeps its slower 500ms **opacity** entrance fade (it is a rare, one-shot cinematic moment), but its press still needs a fast transform. The CTA is hit ~once per session, so a single `duration-500` for the press there is acceptable — but to respect the budget, give the CTA a split: press uses 160ms via Tailwind's `ease-out` on a transform-aware transition list; simplest correct approach is `transition-[transform,opacity,border-color,background-color] duration-500 ease-out` — press scale takes 500ms, which is sluggish on a button. Use the stricter approach below: add `active:scale-[0.97]` and switch the CTA to `transition-[transform,opacity,border-color,background-color] duration-300 ease-out` (300ms is a compromise between the 500ms entrance and the 160ms press budget; the CTA is rare — this is intentional).

Tailwind note: `-translate-y-1/2` (CTA, PREV, NEXT) and `active:scale-[0.97]` compose safely — Tailwind v3 combines translate and scale via CSS variables into one `transform`.

## Repo conventions to follow

- Tailwind utility classes only — the codebase has no custom button CSS layer; all styling is inline class strings.
- Existing hover feedback uses `hover:` variants with `transition-colors` (e.g. `Corridor.tsx:156`, `228`). The plan extends this pattern with `active:` variants and adds `transform` to the transitioned property lists.

## Steps

1. **CTA** (`components/MuseumJourney.tsx:300`). Replace the class string:

```tsx
className={`absolute right-6 top-1/2 z-20 -translate-y-1/2 border border-amber/60 bg-ink/40 px-8 py-5 text-left outline-none backdrop-blur-[2px] transition-[transform,opacity,border-color,background-color] duration-300 ease-out focus-visible:border-amber hover:border-amber hover:bg-amber/10 active:scale-[0.97] md:right-12 md:px-10 ${
  ctaVisible ? "opacity-100" : "pointer-events-none opacity-0"
}`}
```

2. **WALK BACK OUT** (`components/Corridor.tsx:156`). Replace `transition-colors duration-300` with `transition-[transform,color] duration-150 ease-out active:scale-[0.97]` (keep `focus-visible:text-amber`):

```tsx
className="mono text-[10px] tracking-[0.4em] text-bone/55 transition-[transform,color] duration-150 ease-out hover:text-amber focus-visible:text-amber active:scale-[0.97] md:text-[11px]"
```

3. **PIN button** (`components/Corridor.tsx:203-207`). Replace the transition classes and add the active scale (keep the `focus-visible:border-amber` on the unpinned branch):

```tsx
className={`mono absolute -top-3 right-1 z-30 flex items-center gap-1 border px-2 py-1 text-[9px] tracking-[0.22em] transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.97] md:right-2 md:text-[10px] ${
  pinned.has(idx)
    ? "border-amber bg-amber/15 text-amber"
    : "border-bone/25 bg-ink/60 text-bone/70 hover:border-amber/60 hover:text-amber focus-visible:border-amber"
}`}
```

4. **PREV** (`components/Corridor.tsx:228-229`) and **NEXT** (`components/Corridor.tsx:239-240`). Replace `transition-colors duration-300` with `transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.97]` (keep `focus-visible:border-amber`).

5. **DOWNLOAD PINNED** (`components/Corridor.tsx:255`). Replace `transition-colors duration-300` with `transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.97]` (keep the `disabled:` and `focus-visible:border-amber` classes untouched).

6. **CLEAR** (`components/Corridor.tsx:263`). Replace `transition-colors duration-300` with `transition-[transform,color] duration-150 ease-out active:scale-[0.97]` (keep `focus-visible:text-amber`).

## Boundaries

- Do NOT touch any motion/animation code outside these class strings — no framer-motion props, no keyframes.
- Do NOT change colors, spacing, or layout.
- Do NOT add `:active` feedback to non-button elements.
- If a class string you expect does not match the code (drift since commit `5accc08`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npm run lint` must pass. Confirm Tailwind generates the new utilities (no build errors).
- **Feel check**: `npm run dev`, then:
  - Hold the PIN button: it should visibly compress to ~97% within 150ms and spring back on release — a subtle, physical "click" feel.
  - Click PREV/NEXT rapidly: each click gives a quick press dip while the 750ms pan continues — the press feedback must not fight the pan (it's on the button itself, not the figure).
  - Hover WALK BACK OUT: the amber color should arrive noticeably snappier than before (150ms vs 300ms).
  - Check the CTA: hover border-color/background still fades (300ms), press dips slightly, and the enter/exit opacity fade still plays.
- **Done when**: every button above compresses on `:active` and the hover color change feels immediate.
