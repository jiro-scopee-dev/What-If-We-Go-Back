# Design System MASTER - What If We Go Back

> Generated via `ui-ux-pro-max` (Parallax Storytelling + Minimalist Monochrome Editorial), adapted to the canonical art direction in `DESIGN.md` - which remains the source of truth. Where this file and DESIGN.md disagree, DESIGN.md wins. Page-specific overrides, when present, live in `design-system/pages/<page>.md` and take precedence over this MASTER; none exist yet.

## Pattern

Storytelling + Feature-Rich. CTA above fold. Structure: Hero/narrative (scroll track, 5.5x100vh) > Dissolve > Exhibition interior. The frames are the camera; the interface is the museum around them.

## Style

- **Parallax Storytelling** (scroll-driven, layered, progressive disclosure, cinematic) - confirmed by the skill database as the site's exact pattern; its documented weaknesses (performance poor, motion accessibility poor) are precisely what `plans/001` and `plans/002` address.
- **Minimalist Monochrome Editorial** in warm amber: typography-led, hairline rules, zero border-radius, mono labels, exactly one accent.
- Dark-only. Mood: hushed, bookish, amber-lit night museum. No glassmorphism, no gradients beyond the veil/vignette, no shadows beyond the piece frames.

## Colors

| Token | Value | Role |
| --- | --- | --- |
| ink | `#0A0908` / ink-deep `#050404` | grounds, veils, letterbox |
| bone | `#EBE3D2` / bone-mute `#B6AD9A` | text + muted text |
| amber | `#C99A48` / amber-bright `#DFB967` | the single accent |

Contrast: bone-on-ink ~ 14:1. Degraded opacities (`text-bone/35` etc.) are decorative only and stay >= 4.5:1 on ink. No pure `#000000` backgrounds (ink is `#0A0908`).

## Typography

- **Vollkorn** (serif) - all narrative lines, headings, exhibition title; italics carry the sentimental beats.
- **IBM Plex Mono** - all labels: wordmark, FIG counter, CTA, eyebrow, piece captions; 0.2-0.42em tracking.
- Validated against the skill's triple-stack recommendation (display serif + body serif + mono labels): the site's stack is the warmer, bookish variant - keep it. No UI sans-serif, ever.

## Motion

- **Ease token**: `cubic-bezier(0.22, 1, 0.36, 1)` - Tailwind `ease-museum` (`tailwind.config.ts:30`) and `EASE_MUSEUM` (`lib/motion.ts`, plan 004). One curve, one place.
- Scroll choreography: native rAF loop (60fps canvas playback), progress-to-frame with `easeInOutSine`, hold on frame 001, settle on 151 for the final ~8% - deliberate; do not convert to JS animation libraries.
- Durations: cinematic beats (dissolve 550/1750ms veil, corridor pan 750ms ticker) are deliberate; UI micro-feedback stays < 300ms.
- Reduced motion: strips blur/scale/drift, keeps opacity/color crossfades (`plans/002`).
- Keyboard-initiated steps snap/micro-slide (`plans/001`).
- Press feedback: `scale(0.97)` on `:active`, 150ms, ease-out (`plans/003`).

## Components

Canvas journey - chrome (wordmark + amber tick, progress hairline, FIG counter) - CTA (outlined brass) - exhibition corridor (auto-ticker 3.5s pan, keyboard snap, pin/download) - dissolve transition.

## Accessibility requirements

- `focus-visible` on every interactive control: bordered buttons -> `focus-visible:border-amber`; text-only buttons -> `focus-visible:text-amber` (mirrors the CTA pattern, `MuseumJourney.tsx:300`).
- Reduced motion per DESIGN.md: strips blur/scale/drift, keeps opacity/color.
- Canvas `aria-hidden` + sr-only narrative; CTA is a labeled button; lightbox is `role="dialog"`/`aria-modal` with Esc and body scroll lock; piece thumbs carry `alt`.
- Contrast: primary text >= 4.5:1; secondary >= 3:1 on ink surfaces (see Colors).
- Responsive: cover-fit on all viewports (16:9 source), grid 2 -> 3 -> 4 columns, no horizontal overflow (verified at 390x844).

## Avoid (anti-patterns)

- Generic AI defaults: pink/violet accents, Inter UI font, light backgrounds, glassmorphism, rounded cards, emoji icons.
- `scale(0)`, `ease-in` on UI, `transition: all`.
- Animation on keyboard/high-frequency actions (corridor arrow keys).
- New gradient languages that compete with the veil/vignette; solid-grey borders (hairlines only).

## Pre-delivery checklist

- [ ] No emojis as icons; vector-only assets.
- [ ] `focus-visible` on every button (corridor controls - in progress).
- [ ] Primary text contrast >= 4.5:1 (bone on ink).
- [ ] `prefers-reduced-motion` respected (plans/002).
- [ ] Responsive: 375px, 768px, 1024px, 1440px; verified at 390x844.
- [ ] Press feedback on all pressable controls (plans/003).
- [ ] Motion timing: micro-interactions < 300ms; cinematic beats deliberate.

## Overrides

Page-specific deviations live in `design-system/pages/<page>.md` when present; otherwise MASTER governs. (None yet.)
