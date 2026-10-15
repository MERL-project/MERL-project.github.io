# MERL project website

**Trust-Calibrated VLA Policy Post-Training with Evolving Imagination · CoRL 2026**

[Project page](https://li-wenzhan.github.io/MERL-project/) · [Research implementation](https://github.com/li-wenzhan/MERL) · [arXiv](https://arxiv.org/abs/2610.16517) · [Camera-Ready PDF](assets/documents/MERL_CoRL2026.pdf)

This repository contains the English academic project website. The policy-training implementation lives in the separate [MERL repository](https://github.com/li-wenzhan/MERL).

The paper is available as arXiv:2610.16517. CoRL 2026 has not yet taken place and no official proceedings link is available; the site cites the arXiv preprint and displays the conference as venue information.

## Run locally

Requires Node.js 20 or newer. There are no npm dependencies to install.

```sh
npm run dev
# http://127.0.0.1:4173/MERL-project/

npm run check
npm run build
npm run preview
```

`dist/` is a complete static site. It can be served from the domain root or a project subdirectory. All assets use relative URLs. The local server supports byte-range requests for video seeking and accepts the GitHub project prefix for verification.

## Experience

- A real MERL-Full robot rollout in the hero, with a pause control.
- Five keyboard-accessible method steps and the complete original method figure.
- A two-level trust explorer: global loss mixture/horizon and local replay probability/loss weight.
- Original simulator predictions with a sampled-frame selector.
- Same-protocol result comparisons, component ablations, uncertainty bars and original learning curves.
- Eight physical-robot rollouts across two tasks and four comparisons, all visible in a compact gallery, with pair/all playback, an enlarged video viewer and matched effective playback speed.
- Paper, implementation and poster links; copyable BibTeX.
- Responsive layouts, local fonts, reduced-motion support and an Open Graph preview.

## Editing

| File | Purpose |
| --- | --- |
| `index.html` | Paper identity, narrative, resources and semantic page structure |
| `styles.css` | SLAI-derived violet/magenta palette, Manrope typography and responsive layouts |
| `app.js` | Method explorer, explanatory trust mappings, reported-result data and video controls |
| `assets/` | Fonts, institutional artwork, paper figures, PDFs and H.264 videos |
| `tools/build.mjs` | Verifies and copies only public website files into `dist/` |
| `tools/verify.mjs` | JavaScript syntax, references, anchors and selected scientific guardrails |
| `tools/serve.mjs` | Local preview with video range support |
| `.github/workflows/pages.yml` | Verify, build and deploy to GitHub Pages |

The interactive trust inputs are illustrative; experiment results are transcribed from the supplied camera-ready paper. Keep the distinctions described in [research and design notes](docs/RESEARCH_AND_DESIGN.md) when updating the content.

The optional Python preparation utilities reuse the authors’ presentation and figure directories. They require PyMuPDF, Pillow, fontTools and ffmpeg, and are **not** required to build or deploy this already prepared website.

## GitHub Pages

The deployment workflow targets the `main` branch. In the repository’s **Settings → Pages**, select **GitHub Actions** as the publishing source. A push to `main` then runs verification, builds `dist/` and deploys the resulting artifact.

The expected URL is `https://li-wenzhan.github.io/MERL-project/`. If the repository name or domain changes, update the canonical URL, Open Graph URLs, JSON-LD, `sitemap.xml`, `robots.txt`, BibTeX and this README. Relative media paths need no prefix changes.

## Research assets and rights

Figures, video clips and paper materials belong to their respective research authors. Institutional marks retain their original artwork and ownership. Manrope and IBM Plex Mono are distributed with their SIL Open Font License files in `assets/fonts/`. No blanket license over third-party or research assets is implied by this website repository.

See [asset notes](docs/ASSETS.md) for media treatment and playback conventions.

To prepare just the robot clips from the original presentation, run `python tools/prepare_robot_videos.py`. Add `--only-missing` to retain existing web encodings. The script verifies frame counts, frame rates and durations, and writes `assets/videos/robot-demos.json`; the website check verifies all eight gallery entries against that manifest.
