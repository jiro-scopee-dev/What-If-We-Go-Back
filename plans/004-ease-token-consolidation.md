# 004 — Extract the shared museum easing curve into one constant

- **Status**: TODO
- **Commit**: `5accc08`
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 4 files, ~8 lines

## Problem

The museum easing curve `[0.22, 1, 0.36, 1]` is hand-typed in three places, plus a parallel Tailwind token:

- `components/Corridor.tsx:12` — `const EASE = [0.22, 1, 0.36, 1] as const;`
- `components/MuseumJourney.tsx:239` — `ease: [0.22, 1, 0.36, 1]` (dissolve)
- `components/Exhibition.tsx:24` — `ease: [0.22, 1, 0.36, 1]` (corridor entrance)
- `tailwind.config.ts:30` — `museum: "cubic-bezier(0.22, 1, 0.36, 1)"` (used by `ease-museum` — leave as is)

Three hand-typed copies of the same curve that *almost* match is exactly the consolidation pattern from the audit playbook. Consolidating to one TS constant keeps the framer-motion usages in lockstep (the Tailwind token cannot be referenced from framer-motion, so it stays a parallel but documented token).

Current code:

```tsx
// components/Corridor.tsx:12 — current
const EASE = [0.22, 1, 0.36, 1] as const;
```

```tsx
// components/MuseumJourney.tsx:239 — current
transition={{ duration: phase === "dissolve" ? 1.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
```

```tsx
// components/Exhibition.tsx:24 — current
transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
```

## Target

One shared constant imported by all three components:

```ts
// lib/motion.ts — new
export const EASE_MUSEUM = [0.22, 1, 0.36, 1] as const;
```

All three framer-motion sites reference `EASE_MUSEUM` by import. `tailwind.config.ts`'s `museum` token is untouched.

## Repo conventions to follow

- Shared lib constants live in `lib/` (see `lib/stages.ts` — `StageDef`, `STAGES`, `frameFromProgress`). `lib/motion.ts` follows the same shape.
- The `as const` tuple pattern is already proven in this codebase: `components/Corridor.tsx:12` compiles today with `as const` passed into a framer-motion `ease` prop.
- Naming: existing exported names are SCREAMING_SNAKE for constants (`FRAME_COUNT`, `WALK_MS`, `PIECE_COUNT`, `TICK_MS`, `LOOP_RESET` in `components/Corridor.tsx` / `components/MuseumJourney.tsx`). `EASE_MUSEUM` matches.

## Steps

1. Create `lib/motion.ts`:

```ts
export const EASE_MUSEUM = [0.22, 1, 0.36, 1] as const;
```

2. `components/Corridor.tsx` — add `import { EASE_MUSEUM } from "@/lib/motion";` and replace lines 12-13 (`const EASE = [0.22, 1, 0.36, 1] as const;` and the now-empty line) by removing the local const. Replace the three `ease: EASE` usages (the two `transition` props at lines 173 and 179) with `ease: EASE_MUSEUM`.

3. `components/MuseumJourney.tsx` — add the same import; replace `ease: [0.22, 1, 0.36, 1]` at line 239 with `ease: EASE_MUSEUM`.

4. `components/Exhibition.tsx` — add the same import; replace `ease: [0.22, 1, 0.36, 1]` at line 24 with `ease: EASE_MUSEUM`.

5. If `npx tsc --noEmit` reports a type error on the readonly tuple (unexpected, since `Corridor.tsx:12` already proves the pattern), drop the `as const` and retry — but only then.

## Boundaries

- Do NOT touch `tailwind.config.ts` — the `museum` / `ease-museum` token is out of scope and stays.
- Do NOT change any duration, easing value, or behavior — this is a pure extraction.
- Do NOT touch `lib/stages.ts` or `lib/types.ts`.
- If a site you expect to contain the inline array has drifted since commit `5accc08`, STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npm run lint` must pass; `grep -rn "0.22, 1, 0.36, 1" components/ app/ lib/` must return only `lib/motion.ts`.
- **Feel check**: `npm run dev` and confirm the dissolve, the corridor entrance, and the corridor pan feel exactly as before — this is a no-op behavior change. Spot-check by watching the corridor pan: identical ease, identical 0.75s duration.
- **Done when**: `tsc --noEmit` passes and the curve exists in exactly one TS location (plus the intentionally-parallel Tailwind token).
