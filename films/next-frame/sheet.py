import sys
from PIL import Image
fs=sys.argv[2:];out=sys.argv[1]
W=960;H=540;n=len(fs);rows=(n+1)//2
c=Image.new('RGB',(W*2,H*rows))
for i,f in enumerate(fs): c.paste(Image.open(f).resize((W,H)),((i%2)*W,(i//2)*H))
c.save(out,quality=88)
