"""Prepare web assets from the supplied MERL materials; leave originals untouched."""
from pathlib import Path
import hashlib
import json
import os
import shutil

import pymupdf
from PIL import Image
from prepare_robot_videos import prepare_robot_videos

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent
ASSETS = ROOT / 'assets'
QA = ROOT / 'qa'
for directory in ('images', 'videos', 'fonts', 'documents', 'brand'):
    (ASSETS / directory).mkdir(parents=True, exist_ok=True)
QA.mkdir(exist_ok=True)
provenance = []

def record(source, target, process):
    provenance.append({'source': os.path.relpath(source, SOURCE),
                       'output': str(target.relative_to(ROOT)).replace('\\', '/'),
                       'processing': process,
                       'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})

def web_image(source, name, width=2200):
    target = ASSETS / 'images' / name
    if source.suffix == '.pdf':
        document = pymupdf.open(source)
        page = document[0]
        pix = page.get_pixmap(matrix=pymupdf.Matrix(width/page.rect.width, width/page.rect.width), alpha=False)
        image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    else:
        image = Image.open(source).convert('RGB')
        image.thumbnail((width, width*2), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=92, method=6)
    record(source, target, 'WebP; retain complete figure; no data changes')
    return image

fig = SOURCE / 'MERL_CoRL2026_Camera_Ready Latex 项目' / 'fig'
for src, dst in [('2-method_camera_ready.pdf','method.webp'), ('app_sim_verse.pdf','imagination-comparison.webp'),
                 ('subplot_goal_sr.pdf','goal-learning.webp'), ('subplot_long_sr.pdf','long-learning.webp')]:
    web_image(fig/src, dst, 2800 if dst=='method.webp' else 1800)

poster = SOURCE/'MERL_poster_EN'/'MERL_Poster_EN_A0_SLAI_v10.pdf'
web_image(poster, 'poster.webp', 1400)
for source, filename in [(SOURCE.parent/'MERL_CoRL2026_Camera_Ready.pdf','MERL_CoRL2026.pdf'),
                         (poster,'MERL_Poster.pdf')]:
    target = ASSETS/'documents'/filename
    shutil.copy2(source,target)
    record(source,target,'Unmodified PDF copy')

for filename in ['sysu_white.png','slai_white.png','cuhk_white.png','sysu_color.png','slai_color.png','cuhk_logo.png','shlab.webp','oxford_logo.svg','ustc.png','corl_official_0.png']:
    source = SOURCE/'MERL_poster_EN'/'assets'/'brand'/filename
    target = ASSETS/'brand'/filename
    shutil.copy2(source,target)
    record(source,target,'Original institutional artwork')

for family in ['grounded','frozen','updated']:
    for n in [0,2,4,7]:
        source=SOURCE/'MERL_ppt_CN'/'assets'/'talk_v2'/f'{family}_{n}.png'
        web_image(source,f'{family}-{n}.webp',720)

# Prepare every original clip, including the second color and second placement.
provenance.extend(prepare_robot_videos())
(QA/'asset_provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'assets':len(provenance),'total_MB':round(sum(f.stat().st_size for f in ASSETS.rglob('*') if f.is_file())/1e6,2)}))
