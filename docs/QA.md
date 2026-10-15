# Website validation

Local review performed on 2026-10-15 (Asia/Shanghai).

## Eight-clip gallery update

- All eight source videos were extracted from the original presentation. Slide positions and actual source frames establish the four baseline/MERL pairings and per-clip speed overlays.
- Original and web-encoded frame counts, frame rates and video durations match. The four existing web encodings retain their previous SHA-256 hashes; four new clips add approximately 12.13 MB.
- Browser playback checks pass for all four pairs and for all eight clips together. Every video decodes at 1280 × 720 and plays at 2× equivalent physical speed, including media8 with its original 3× overlay. Changing native playback rate restores the stated comparison convention.
- Individual playback updates the pair/all control states. Enlarged playback retains a tested five-second position; Escape and the close button restore the original player. Figure-dialog closing is separately scoped to preserve the existing figure viewer.
- Measured layouts at 1440, 768, 390 and 320 CSS pixels have no horizontal overflow. All eight clips remain exposed in the page, with four columns on desktop and two on mobile.
- Before interaction, no gallery MP4 requests were made. The reduced-motion hero behavior remains intact. No JavaScript page errors occurred during the gallery tests.
- The gallery's automated screenshot capture timed out in the background browser task. The updated layout was checked through browser DOM measurements and interaction tests; the visual screenshots described below belong to the initial site review.

The following checks describe the initial site baseline; the gallery-specific checks above supersede its original four-clip comparison behavior.

## Automated and browser checks

- Static build succeeds with Node and no installed npm dependencies.
- JavaScript syntax, unique element IDs, local resource references, internal anchors and relative paths pass.
- Referenced local resources return HTTP 200. Video byte-range requests return HTTP 206.
- Original camera-ready PDF retains all 31 pages and its source SHA-256.
- Four video assets decode as H.264/yuv420p at 1280 × 720, with their original chronology and video duration retained.
- Browser tests pass 24 checks, including method tabs, keyboard navigation, global trust values at three inputs, normalized chunk probabilities, result switches, figure dialogs, citation copying, paired playback, mobile navigation and reduced-motion autoplay behavior.
- Layouts at 1440, 1024, 768, 390 and 360 CSS pixels have no horizontal document overflow. Decorative SVG paths extending beyond their viewBox are intentionally clipped.
- Paired video playback verifies baseline rate 2/3 and MERL rate 1, giving the stated 2× equivalent physical speed.
- No JavaScript page errors or failed local resource requests were observed during the functional run.

## Visual review

Desktop hero, trust lab and physical demo views were rendered and inspected at 1440 × 1000. Mobile hero, trust lab and physical demo views were inspected at 390 × 844. Review repaired white-on-white institutional artwork, mobile line-break spacing and a missing arrow glyph in the share-card font subset.

All six institutional marks retain their source artwork and order. Original research figures retain full content and are available in enlarged views. Native video controls, a hero pause button and keyboard-accessible controls remain available.

Machine-readable local receipts, screenshots, asset provenance and resource checks are stored in ignored `qa/`. These are development evidence and are not included in the deployed static site. The deployment workflow independently repeats the source checks and build on GitHub Actions.

The website reports paper results; this validation is not an independent replication of the research experiments. Browser checks use desktop Chromium with emulated viewport sizes; separate physical iOS/Android device testing was not performed.
