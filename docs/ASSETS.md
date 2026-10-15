# Asset provenance and playback

The provided paper, original editable figure files, poster v10 and original Chinese presentation are the source materials. `tools/prepare_assets.py` writes a detailed local manifest to ignored `qa/asset_provenance.json` without changing those originals.

| Website asset | Source |
| --- | --- |
| `assets/documents/MERL_CoRL2026.pdf` | Unmodified user-specified camera-ready PDF |
| `assets/documents/MERL_Poster.pdf` | English poster v10 |
| `assets/images/method.webp` | Original editable method figure’s vector PDF export |
| `assets/images/goal-learning.webp`, `long-learning.webp` | Original paper curve PDFs; no redrawing or resampling of numerical data |
| `grounded-*`, `frozen-*`, `updated-*` | Existing presentation assets from the original paper’s simulator comparison |
| `assets/videos/block-baseline.mp4` | Original presentation `ppt/media/media1.mp4` |
| `assets/videos/block-merl.mp4` | Original presentation `ppt/media/media2.mp4` |
| `assets/videos/block-baseline-2.mp4` | Original presentation `ppt/media/media3.mp4` |
| `assets/videos/block-merl-2.mp4` | Original presentation `ppt/media/media4.mp4` |
| `assets/videos/lid-baseline.mp4` | Original presentation `ppt/media/media5.mp4` |
| `assets/videos/lid-merl.mp4` | Original presentation `ppt/media/media6.mp4` |
| `assets/videos/lid-baseline-2.mp4` | Original presentation `ppt/media/media7.mp4` |
| `assets/videos/lid-merl-2.mp4` | Original presentation `ppt/media/media8.mp4` |
| Institutional artwork | Existing official brand assets reused from the English poster |
| `social-preview.png` | Site typography and an actual MERL-Full robot frame, composed for link previews |

All eight MP4s are extracted directly from the original `.pptx` ZIP archive. Slide 9 places media1/media2 in the red-block comparison and media3/media4 in the blue-block comparison, with baseline on the left and MERL-Full on the right. Slide 10 similarly pairs media5/media6 and media7/media8 for two lid placements. The slide text identifies the baseline as Online-Updated MBRL.

Website encoding uses H.264, yuv420p, a maximum width of 1280, CRF 23, no audio and MP4 faststart. The video frames are not generated; chronology and source timestamps remain intact. A poster frame is extracted at three seconds. `tools/prepare_robot_videos.py` checks frame counts, frame rates and durations against the original clips. `assets/videos/robot-demos.json` records source/output SHA-256 hashes, slide/media mappings and per-clip source speed. The original four website encodings were retained when adding the four missing clips.

## Effective playback speed

Visual inspection found **3× overlays on media1, media3, media5, media7 and media8; 2× overlays on media2, media4 and media6**. In particular, media8 is a MERL-Full rollout with a 3× overlay. Source rate is a per-clip property, not a method-level assumption. Historical speaker notes describing equal source rates are not used as evidence.

Every gallery player uses HTML playback rate **2 / source_speed**: 2/3 for a 3× source clip and 1 for a 2× clip. All eight then represent 2× physical-time playback. Source overlays remain visible, and the page explains the adjustment. Pair and all-demo controls restart the selected qualitative trials; they do not claim frame alignment, identical initial conditions or controlled execution-time evidence. Native playback-rate changes are reset to preserve this stated comparison convention.

The hero uses the original MERL-Full clip at normal media rate, retaining its 2× physical-time playback. Autoplay is muted, visibility-aware and disabled for reduced-motion or save-data preferences. The gallery exposes all eight players without task tabs, with four columns on desktop and two on mobile. It requests video media only after interaction, loops user-started playback, provides individual/pair/all controls, and pauses when the page is hidden. Expand opens the same video in a larger accessible dialog, preserving its playback position; Escape or the close button returns it to its card and pauses it. Native controls include the browser's full-screen option.

## Fonts

Manrope and IBM Plex Mono are locally hosted Latin WOFF2 files distributed with their SIL Open Font License text. Font files were obtained from Google Fonts; their licenses are included alongside the files. Original research figures and institutional marks are not retypeset.
