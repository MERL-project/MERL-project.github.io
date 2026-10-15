"""Extract all eight original robot clips without changing their frame timing."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'MERL介绍_东方理工大学交流_CN.pptx'
CLIPS = [
    (1, 'block-baseline', 'block-red', 'baseline', 3, 9),
    (2, 'block-merl', 'block-red', 'merl', 2, 9),
    (3, 'block-baseline-2', 'block-blue', 'baseline', 3, 9),
    (4, 'block-merl-2', 'block-blue', 'merl', 2, 9),
    (5, 'lid-baseline', 'lid-first', 'baseline', 3, 10),
    (6, 'lid-merl', 'lid-first', 'merl', 2, 10),
    (7, 'lid-baseline-2', 'lid-second', 'baseline', 3, 10),
    (8, 'lid-merl-2', 'lid-second', 'merl', 3, 10),
]


def probe(path):
    result = subprocess.run([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name,pix_fmt,avg_frame_rate,nb_frames,duration',
        '-of', 'json', str(path),
    ], check=True, capture_output=True)
    return json.loads(result.stdout)['streams'][0]


def prepare_robot_videos(only_missing=False):
    raw = ROOT / 'qa' / 'extracted_video'
    raw.mkdir(parents=True, exist_ok=True)
    records, clips = [], []
    with zipfile.ZipFile(SOURCE) as archive:
        for number, slug, pair, method, speed, slide in CLIPS:
            member = f'ppt/media/media{number}.mp4'
            source_bytes = archive.read(member)
            original = raw / f'media{number}.mp4'
            original.write_bytes(source_bytes)
            video = ROOT / 'assets' / 'videos' / f'{slug}.mp4'
            poster = ROOT / 'assets' / 'images' / f'{slug}.webp'
            if not only_missing or not video.exists():
                subprocess.run([
                    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original),
                    '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'medium',
                    '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(video),
                ], check=True)
            if not only_missing or not poster.exists():
                subprocess.run([
                    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '3',
                    '-i', str(video), '-frames:v', '1', '-quality', '92', str(poster),
                ], check=True)
            before, after = probe(original), probe(video)
            assert before['nb_frames'] == after['nb_frames'], slug
            assert before['avg_frame_rate'] == after['avg_frame_rate'], slug
            assert abs(float(before['duration']) - float(after['duration'])) < .001, slug
            clips.append({
                'id': slug, 'pair': pair, 'method': method, 'source_slide': slide,
                'source_member': member, 'source_speed': speed,
                'source_sha256': hashlib.sha256(source_bytes).hexdigest(),
                'video': video.relative_to(ROOT).as_posix(),
                'poster': poster.relative_to(ROOT).as_posix(),
                'sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
                'width': after['width'], 'height': after['height'],
                'frame_count': int(after['nb_frames']), 'frame_rate': after['avg_frame_rate'],
                'duration_seconds': float(after['duration']),
            })
            for target in (video, poster):
                records.append({
                    'source': SOURCE.name + '#' + member,
                    'output': target.relative_to(ROOT).as_posix(),
                    'processing': f'H.264/WebP; original frames and {speed}x source overlay retained',
                    'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                })
    manifest = {'effective_playback_speed': 2, 'clips': clips}
    (ROOT / 'assets' / 'videos' / 'robot-demos.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8', newline='\n')
    return records


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only-missing', action='store_true', help='Keep previously prepared video/poster files.')
    args = parser.parse_args()
    records = prepare_robot_videos(args.only_missing)
    print(json.dumps({'clips': len(CLIPS), 'prepared_assets': len(records)}))
