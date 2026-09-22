from pathlib import Path

p = Path("greek-name-v4/index.html")
s = p.read_text(encoding="utf-8")

old1 = """   const idx=order.indexOf(analyzed.t)*2+(gv==='female'?1:0);
   const sx=(idx%4)*180, sy=Math.floor(idx/4)*270;

   const artW=360, artH=540, artX=(1080-artW)/2, artY=118;"""

new1 = """   const idx=order.indexOf(analyzed.t)*2+(gv==='female'?1:0);

   // スプライトの実寸から1コマの大きさを算出する。
   // 固定180x270で切ると、画像更新時に隣のコマが混ざるため固定値を使わない。
   const cols=4;
   const totalFrames=order.length*2;
   const rows=Math.ceil(totalFrames/cols);
   const frameW=img.naturalWidth/cols;
   const frameH=img.naturalHeight/rows;
   const sx=(idx%cols)*frameW;
   const sy=Math.floor(idx/cols)*frameH;

   // 元の縦横比を保ったまま、保存画像内に contain で収める
   const artMaxW=380, artMaxH=520;
   const artScale=Math.min(artMaxW/frameW,artMaxH/frameH);
   const artW=Math.round(frameW*artScale);
   const artH=Math.round(frameH*artScale);
   const artX=Math.round((1080-artW)/2);
   const artY=118;"""

old2 = """   ctx.drawImage(img,sx,sy,180,270,artX,artY,artW,artH);"""
new2 = """   ctx.drawImage(img,sx,sy,frameW,frameH,artX,artY,artW,artH);"""

if old1 not in s:
    raise SystemExit("sprite sizing block not found")
if old2 not in s:
    raise SystemExit("drawImage block not found")

s = s.replace(old1, new1, 1)
s = s.replace(old2, new2, 1)
p.write_text(s, encoding="utf-8")
