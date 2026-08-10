# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14 (App Router mental model), Tailwind CSS utility styling (tight spacing, consistent scale), Framer Motion-style scroll-linked animations/easing/transitions, HTML5 Canvas image-sequence playback for performance and smoothness. Static deploy target, no backend.

## Users

Visitors to a personal nostalgia web archive: former classmates of the creator's Junior High years, plus anyone invited to experience the archive. Their job is to feel — to re-enter a remembered time, then browse the memories collected there. The primary moment is a first visit: standing outside, walking in, discovering the archive.

## Product Purpose

A memory archive for the Junior High years ("What If We Go Back"). Chapter 01 opens as a cinematic, scroll-controlled walk into a museum of memories: the visitor physically enters the building frame by frame, reaches the exhibition, and is invited to view the art pieces inside. Success is a visitor who feels they walked into a real place and then looks at the memories collected inside.

## Positioning

Not a slideshow and not a conventional gallery. The experience is a physical journey — outside, approach, entrance, inside, exhibition — where the scroll position places the visitor at a real point in space. The archive's gallery is the exhibition *inside* the museum, never a separate website section.

## Operating Context

Desktop and mobile browsers; the journey is scroll-driven with an image-sequence the visitor walks through. The `/museum` folder holds 151 cinematic frames (1280x720) that form the walk-in camera; `/image` holds 192 JPEG art pieces (mixed orientation) that form the exhibition contents. `backgroundimage/backgroundimage.png` is an existing background asset.

## Capabilities and Constraints

- Scroll position maps directly to frame index across the 151 museum frames (frame 001 = outside, last frame = fully inside).
- The frames are the source of truth; no artificial camera movement is added on top of the sequence.
- Copy must appear in choreographed stages tied to physical location (outside → approach → entrance → inside → emotional turn → CTA).
- The SEE ARTPIECES CTA must transition by dissolving the final museum frame into the gallery rather than abruptly navigating.
- The gallery is presented as the exhibition inside the museum.
- Assets are author-provided; no external imagery should be fabricated for the museum or exhibition.
- Model cannot visually inspect images this session; build relies on the brief and file structure.

## Brand Commitments

- Title treatment: "MEMORY ARCHIVE".
- Copy is brief-pinned verbatim (see Chapter 01 brief): outside, approach, entrance, entering, inside, emotional turn, CTA (SEE ARTPIECES / Enter the archive).
- Cinematic, quiet, human pacing; no hype, no gamification.

## Evidence on Hand

- `/museum/ezgif-frame-001..151.jpg` — cinematic walk-in sequence, source of truth for the journey.
- `/image/1..192.jpeg` — art pieces for the exhibition interior.
- `backgroundimage/backgroundimage.png` — existing background asset.
- `LICENSE` — present in repo.

## Product Principles

- The visitor must feel physical progression without being told how it works.
- The frames carry the camera; the interface must never fight or repeat their movement.
- Text emerges from the place, at the pace of walking, never as a wall of copy.
- The gallery is entered through the museum, not linked away from it.
- Restraint is the tone: quiet typography over cinematic imagery, reveal, then allow lingering.

## Accessibility & Inclusion

- Scroll-driven content must also be navigable by keyboard (arrow/space/page) and reduced-motion must respect the user's preference.
- Text overlays need sufficient contrast over any frame.
