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
| `assets/videos/lid-baseline.mp4` | Original presentation `ppt/media/media5.mp4` |
| `assets/videos/lid-merl.mp4` | Original presentation `ppt/media/media6.mp4` |
| Institutional artwork | Existing official brand assets reused from the English poster |
| `social-preview.png` | Site typography and an actual MERL-Full robot frame, composed for link previews |

The four MP4s are extracted directly from the original `.pptx` ZIP archive. Their SHA-256 hashes are checked against the already extracted report assets before transcoding. Website encoding uses H.264, yuv420p, a maximum width of 1280, CRF 23, no audio and MP4 faststart. The video frames are not generated; chronology and source timestamps remain intact. A poster frame is extracted at three seconds.

## Effective playback speed

Visual inspection of the actual source frames found **3× overlays on baseline videos and 2× overlays on MERL videos**. Historical speaker notes describing equal source rates are therefore not used as evidence.

The comparison player sets the baseline’s HTML video playback rate to **2/3** and MERL’s to **1**. Both then represent 2× physical-time playback. Source overlays remain visible, and the page explains the adjustment. Paired play restarts both qualitative trials; it does not claim frame alignment, identical initial conditions or controlled execution-time evidence. Native playback-rate changes are reset to preserve this stated comparison convention.

The hero uses the original MERL-Full clip at normal media rate, retaining its 2× physical-time playback. Autoplay is muted, visibility-aware and disabled for reduced-motion or save-data preferences. The gallery loads video media only after interaction, with controls available for manual playback.

## Fonts

Manrope and IBM Plex Mono are locally hosted Latin WOFF2 files distributed with their SIL Open Font License text. Font files were obtained from Google Fonts; their licenses are included alongside the files. Original research figures and institutional marks are not retypeset.
