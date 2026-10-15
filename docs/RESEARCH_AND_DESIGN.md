# Research and design notes

Prepared for the English MERL project website on 2026-10-15 (Asia/Shanghai).

## Scientific basis

The primary source is the supplied 31-page camera-ready, **Trust-Calibrated VLA Policy Post-Training with Evolving Imagination**, by Wenzhan Li, Yiran Qin, Heng Zhou, Huirui Wang, Yulan Guo and Ruimao Zhang. The local paper copy has SHA-256 `2ccbbe7932455a230e03d54877c34694a518b66d8f025a600028cfbdb9828045`.

The user also supplied [arXiv:2610.16517](https://arxiv.org/abs/2610.16517), submitted on 12 October 2026. Its title and all six authors were verified against arXiv metadata. It is the main paper entry and the BibTeX target; the supplied Camera-Ready PDF remains separately available. CoRL 2026 is forthcoming and there is no official proceedings URL yet. No conference volume, page range or publication DOI is invented.

The narrative follows deployment shift → uneven simulator reliability → two-level trust → controlled evidence → physical execution. Simulator adaptation addresses staleness. The trust interface determines the imagined branch’s influence on policy optimization.

| Presented result | Source and condition |
| --- | --- |
| 79.7% LIBERO-PRO average SR | Table 2: 79.7 ± 0.7, mean ± SD over three training seeds |
| 10.9% fewer high-threshold stages | Table 1: matched MFRL 103.4 → MERL 92.1; `(103.4−92.1)/103.4` |
| 80.0% observed physical success | Table 3: 17/20 Block-to-Box and 15/20 Lid-to-Pot, 32/40 pooled; 95% CI [65.2, 89.5] |
| Component controls | Appendix Table 5: online-updated, +stage trust, +chunk trust, both; point estimates |
| Simulator diagnostics | Appendix D: frozen vs evolving PSNR 22.4 → 25.9, LPIPS 0.238 → 0.171, proxy MAE 0.183 → 0.126 |
| Recursive scoring | Appendix, Table 9: depths 2–4, N=1500, Pearson r=0.68 and Rank-AUC=0.80; futures withheld during scoring |

No new training run or independent replication was performed for the website. Table 1 point estimates and Table 2 multi-seed uncertainty must remain distinct. WMPO/WoVR are same-protocol adaptations. S2T-H measures refinement stages under matched grounded budgets, not wall-clock or total-compute speedup.

The physical study uses fixed-data offline refinement from 50 demonstrations/task and 20 closed-loop evaluation trials/task. It does not establish online physical RL. Full MERL and MERL-Visual confidence intervals overlap; the study does not resolve a proxy-only gain. The baseline method in the video source is unspecified and is therefore not named as a particular quantitative control.

## Mechanism explorer

The global slider supplies normalized **smoothed** error directly to the paper’s inverse-power mapping. With κ=1, χ=1/(1+ε̃/ε_ref), ρ=0.05+0.90χ and h=floor(8+24χ). It is not a reconstruction of the EMA training history. Horizon units are environment steps, with C=8 actions per policy call; partial final chunks are allowed.

The local example uses artificial errors [0.10, 0.40, 0.80, 1.60] to illustrate priority normalization and detached loss weights. The mappings use the live public repository’s configuration defaults: priority epsilon 0.001, exponent 1, weight eta 1 and minimum weight 0.05. These examples are explicitly marked as illustrative, not measured results.

Public implementation cross-checks: [trust implementation](https://github.com/li-wenzhan/MERL/blob/main/merl/trust.py), [configuration](https://github.com/li-wenzhan/MERL/blob/main/configs/merl.json), [no-oracle information flow](https://github.com/li-wenzhan/MERL/blob/main/docs/no_oracle_trust.md).

## Visual system

Retain the research materials’ SLAI magenta `#C82E70` and violet `#92278F`. Grounded experience is blue, imagination orange, and trust control magenta/violet. A pale editorial canvas supports paper reading; dark plum distinguishes interactive explanation and physical demonstrations. Orbit lines are abstract decoration, not research measurements.

Use locally hosted Manrope for English headings, prose and controls, with IBM Plex Mono for numerical/control metadata. This provides a consistent web system while carrying the existing materials’ palette and conceptual color assignments forward. Original figures, official institutional marks and baked-in video overlays retain their native typography.

## Reference benchmarking

The following live pages were read through web browsing; representative pages were also inspected in the browser. They informed presentation principles rather than supplying copied code or media.

- [DreamZero](https://dreamzero0.github.io/): task-grouped rollouts and a direct connection between claims and visible demonstrations.
- [VGGT](https://vgg-t.github.io/): a strong visual entry, accessible academic identity and concise research progression.
- [Diffusion Policy](https://diffusion-policy.cs.columbia.edu/): dense real-robot evidence organized as meaningful experiment groups.
- [Universal Manipulation Interface](https://umi-gripper.github.io/): demo-first storytelling and concrete physical context.
- [MimicPlay](https://mimic-play.github.io/): connecting long-horizon behavior to a readable method narrative.

## Deployment

Buildless HTML/CSS/JavaScript with a small Node packaging step keeps maintenance and GitHub Pages deployment simple. The workflow follows the official [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). No external analytics, API keys, CDN scripts or runtime framework are needed.
