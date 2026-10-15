"""Pass a UTF-8 program directly to the installed Tabbit launcher."""
from pathlib import Path
import os
import subprocess
import sys
import json
import shutil

program=Path(sys.argv[1]).resolve()
request_id=sys.argv[2]
launcher=Path(os.environ['LOCALAPPDATA'])/'Tabbit'/'LocalAgent'/'bin'/'tabbit-cli.exe'
result=subprocess.run([str(launcher),'nodejs','--task','MERL Website','--request-id',request_id],
                      input=program.read_bytes(),capture_output=True)
try:
    receipt=json.loads(result.stdout)
    qa=Path(__file__).resolve().parents[1]/'qa'
    qa.mkdir(exist_ok=True)
    (qa/f'{request_id}.receipt.json').write_bytes(result.stdout)
    shots=receipt.get('result',{}).get('screenshotsDelta',[])
    exported=[]
    for i,shot in enumerate(shots):
        source=Path(shot.get('path',''))
        if source.is_file():
            target=qa/f'{request_id}-{i+1}.png';shutil.copy2(source,target);exported.append(str(target))
    if exported:
        print(json.dumps({'status':receipt.get('status'),'screenshots':exported},ensure_ascii=True))
    else:sys.stdout.buffer.write(result.stdout)
except (ValueError,TypeError):sys.stdout.buffer.write(result.stdout)
sys.stderr.buffer.write(result.stderr)
raise SystemExit(result.returncode)
