# Animation Plans — What If We Go Back

Audit by `improve-animations`, stamped at commit `5accc08`.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Keyboard-initiated corridor steps must not run the 750ms pan | HIGH | DONE |
| 002 | Make reduced-motion consistent with the documented design | MEDIUM | DONE |
| 003 | Press feedback on all pressable controls + faster color hovers | MEDIUM | DONE |
| 004 | Extract the shared museum easing curve into one constant | LOW | DONE |

> Note: the `focus-visible` amber classes on all corridor controls (from the ui-ux-pro-max review, see `design-system/MASTER.md`) are already in the code; plan 003's target strings include them.

All four plans executed and reviewed (verdict: approve) at working-tree commit `5accc08`. `npx tsc --noEmit` and `npm run lint` pass.
| 004 | Extract the shared museum easing curve into one constant | LOW | TODO |

## Recommended execution order

1. **001** — the only feel-breaking, high-frequency fix; largest leverage.
2. **002** — accessibility consistency; touches `app/page.tsx` and `globals.css`, no overlap with 001/003/004.
3. **003** — press feedback; touches class strings only.
4. **004** — token extraction; low risk, can run any time.

## Dependencies

- None of the plans depend on each other.
- **004 touches `Corridor.tsx:12` (the `EASE` const) and 001/003 touch the same file** — if 004 runs before 001, 001's references to `EASE` will have become `EASE_MUSEUM`; 001's step 1 stays valid (it only adds state and changes `transition` props, never naming the const), and 003 touches only class strings. To keep reviews trivial, run 004 last.
- **002 wraps `app/page.tsx` in `MotionConfig`** — no other plan touches that file.

## Applying plans

Each plan is self-contained. Execute with `improve-animations execute <NNN-slug>` or hand the file to any agent with repository access. After a plan lands, re-run its Verification section and mark the status column DONE.
