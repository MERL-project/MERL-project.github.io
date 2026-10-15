"""Prepare web assets from the supplied MERL materials; leave originals untouched."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import zipfile
import xml.etree.ElementTree as ET

import pymupdf
from PIL import Image, ImageOps, ImageDraw

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

# Extract videos directly from their original presentation archive.
# Original slide notes identify media1/media5 as baselines, media2/media6 as MERL.
original = SOURCE/'MERL介绍_东方理工大学交流_CN.pptx'
media_map = [('media1.mp4','block-baseline'),('media2.mp4','block-merl'),
             ('media5.mp4','lid-baseline'),('media6.mp4','lid-merl')]
raw = QA/'extracted_video'
raw.mkdir(exist_ok=True)
contact = Image.new('RGB',(960,600),'#faf8fb')
draw=ImageDraw.Draw(contact)
with zipfile.ZipFile(original) as archive:
    for idx,(filename,slug) in enumerate(media_map):
        extracted=raw/filename
        extracted.write_bytes(archive.read('ppt/media/'+filename))
        # Confirm that the reusable PPT assets are the same original media.
        prior=SOURCE/'MERL_ppt_CN'/'assets'/'talk_v2'/filename
        if prior.exists():
            assert hashlib.sha256(prior.read_bytes()).digest()==hashlib.sha256(extracted.read_bytes()).digest(),filename
        target=ASSETS/'videos'/f'{slug}.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(extracted),'-an',
                        '-vf','scale=1280:-2','-c:v','libx264','-preset','medium','-crf','23',
                        '-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
        # Transcoding preserves the source timestamps and its baked-in 2x mark.
        record(original,target,f'Extract ppt/media/{filename}; H.264; max width 1280; muted; original timing and speed overlay retained (baseline 3x; MERL 2x)')
        poster_file=ASSETS/'images'/f'{slug}.webp'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss','3','-i',str(target),
                        '-frames:v','1','-quality','92',str(poster_file)],check=True)
        image=Image.open(poster_file).convert('RGB')
        image.thumbnail((460,260))
        x=(idx%2)*480+10;y=(idx//2)*300+28
        contact.paste(image,(x,y));draw.text((x,y-20),slug,fill='#321937')
contact.save(QA/'video_contact_sheet.jpg',quality=92)
(QA/'asset_provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'assets':len(provenance),'total_MB':round(sum(f.stat().st_size for f in ASSETS.rglob('*') if f.is_file())/1e6,2)}))
