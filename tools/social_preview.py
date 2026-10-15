"""Render a share card with the site's font and a real MERL rollout frame."""
from pathlib import Path
import math
from PIL import Image,ImageDraw,ImageFont,ImageFilter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root=Path(__file__).resolve().parents[1]
font=TTFont(root/'assets/fonts/manrope.woff2')
font.flavor=None
if 'fvar' in font: font=instantiateVariableFont(font,{'wght':700},inplace=False)
font.save(root/'qa/manrope-bold.ttf')
def f(size):return ImageFont.truetype(str(root/'qa/manrope-bold.ttf'),size)
image=Image.new('RGB',(1200,630),'#faf7fc')
draw=ImageDraw.Draw(image)
for x in range(1200):
    k=max(0,(x-300)/900)
    draw.line((x,0,x,630),fill=(round(250-11*k),round(247-19*k),round(252-10*k)))
for n in range(5):
    points=[]
    for x in range(-100,1301,5):
        y=430+math.sin(x/200+n*.13)*80+n*13
        points.append((x,y))
    draw.line(points,fill='#e5c9e0',width=1)
draw.rounded_rectangle((55,50,195,82),radius=7,fill='#efdeee')
draw.text((70,56),'CoRL 2026',font=f(16),fill='#92278f')
draw.text((52,99),'MERL.',font=f(104),fill='#291c32',stroke_width=0)
for i,line in enumerate(['Trust-Calibrated VLA','Policy Post-Training','with Evolving Imagination']):
    draw.text((58,250+i*47),line,font=f(31),fill='#92278f' if i==2 else '#291c32')
draw.text((59,452),'Learning to trust imagination.',font=f(19),fill='#8b6e96')
draw.text((59,565),'li-wenzhan.github.io/MERL-project',font=f(15),fill='#8b6e96')
frame=Image.open(root/'assets/images/block-merl.webp').convert('RGB')
frame.thumbnail((510,287),Image.Resampling.LANCZOS)
panel=Image.new('RGB',(534,390),'white');d=ImageDraw.Draw(panel)
d.text((17,15),'MERL-Full  /  Physical robot',font=f(13),fill='#926d9e')
panel.paste(frame,(12,49))
d.text((17,350),'Ground  /  Calibrate  /  Improve',font=f(15),fill='#92278f')
image.paste(panel,(615,124))
draw.rounded_rectangle((615,124,1149,514),radius=12,outline='#dac7e0',width=2)
image.save(root/'assets/images/social-preview.png',optimize=True)
print('Rendered 1200 x 630 Open Graph preview using Manrope and the original robot frame.')
