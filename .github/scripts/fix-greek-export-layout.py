from pathlib import Path
p=Path("greek-name-v4/index.html")
s=p.read_text(encoding="utf-8")
start=s.find("document.getElementById('save').onclick=async()=>")
if start<0:
    start=s.find("save.onclick=async()=>")
if start<0:
    raise SystemExit("save handler not found")
end=s.find(";['name','reading'].forEach", start)
if end<0:
    raise SystemExit("save handler end not found")

new="""document.getElementById('save').onclick=async()=>{
 const btn=document.getElementById('save');
 const original=btn.textContent;
 btn.disabled=true;
 btn.textContent='画像を作成中…';
 try{
   const currentName=document.getElementById('name').value.trim()||'name';
   const reading=document.getElementById('reading').value.trim();
   const c=document.getElementById('canvas');
   c.width=1080;
   c.height=1920;
   const ctx=c.getContext('2d');

   const gold='#a47727', paper='#fff8ea', ink='#211d18', soft='#6f6252';
   ctx.clearRect(0,0,c.width,c.height);
   ctx.fillStyle=paper;
   ctx.fillRect(0,0,c.width,c.height);
   ctx.strokeStyle=gold;
   ctx.lineWidth=4;
   ctx.strokeRect(32,32,1016,1856);

   ctx.textAlign='center';
   ctx.fillStyle=gold;
   ctx.font='bold 38px serif';
   ctx.fillText('名に、物語を',540,88);

   // illustration
   const img=new Image();
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=SPRITE});
   const analyzed=analyze(currentName);
   let gv=(document.querySelector('input[name=gender]:checked')||{}).value||'male';
   if(gv==='oracle') gv=h(currentName+reading)%2?'male':'female';
   const idx=order.indexOf(analyzed.t)*2+(gv==='female'?1:0);
   const sx=(idx%4)*180, sy=Math.floor(idx/4)*270;

   const artW=620, artH=930, artX=(1080-artW)/2, artY=130;
   ctx.save();
   ctx.beginPath();
   ctx.rect(artX,artY,artW,artH);
   ctx.clip();
   ctx.drawImage(img,sx,sy,180,270,artX,artY,artW,artH);
   ctx.restore();
   ctx.strokeStyle='#d8c49a';
   ctx.lineWidth=2;
   ctx.strokeRect(artX,artY,artW,artH);

   const greekName=document.getElementById('greekName').textContent;
   const greekScript=document.getElementById('greekScript').textContent;
   const epithet=document.getElementById('epithet').textContent;
   const storyText=document.getElementById('story').textContent;
   const cityText=document.getElementById('city').textContent;
   const roleText=document.getElementById('role').textContent;
   const skillText=document.getElementById('skill').textContent;
   const aliasText=document.getElementById('alias').textContent;

   ctx.fillStyle=ink;
   ctx.font='bold 64px serif';
   ctx.fillText(greekName,540,1145);

   ctx.fillStyle=soft;
   ctx.font='32px serif';
   ctx.fillText(epithet,540,1205);

   ctx.fillStyle=ink;
   ctx.font='28px serif';
   ctx.fillText(currentName+' → '+greekScript,540,1255);

   ctx.strokeStyle='#d8c49a';
   ctx.lineWidth=2;
   ctx.beginPath();
   ctx.moveTo(150,1290);
   ctx.lineTo(930,1290);
   ctx.stroke();

   function wrapText(text,x,y,maxWidth,lineHeight,maxLines){
     const chars=[...text];
     let line='', lines=[];
     for(const ch of chars){
       const test=line+ch;
       if(ctx.measureText(test).width>maxWidth && line){
         lines.push(line);
         line=ch;
         if(lines.length>=maxLines) break;
       }else{
         line=test;
       }
     }
     if(line && lines.length<maxLines) lines.push(line);
     if(lines.length===maxLines && chars.join('').length>lines.join('').length){
       lines[maxLines-1]=lines[maxLines-1].replace(/.$/,'…');
     }
     lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
     return y+lines.length*lineHeight;
   }

   ctx.textAlign='left';
   ctx.fillStyle='#3f3a34';
   ctx.font='26px -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif';
   let nextY=wrapText(storyText,120,1350,840,42,6);

   nextY+=28;
   ctx.strokeStyle='#d8c49a';
   ctx.beginPath();
   ctx.moveTo(120,nextY);
   ctx.lineTo(960,nextY);
   ctx.stroke();
   nextY+=40;

   function fact(label,value,x,y,w){
     ctx.fillStyle='#f8efd9';
     ctx.fillRect(x,y,w,112);
     ctx.strokeStyle='#e0cfaa';
     ctx.strokeRect(x,y,w,112);
     ctx.fillStyle=gold;
     ctx.font='bold 20px -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif';
     ctx.fillText(label,x+18,y+32);
     ctx.fillStyle=ink;
     ctx.font='24px -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif';
     const val=[...value].slice(0,22).join('')+(value.length>22?'…':'');
     ctx.fillText(val,x+18,y+72);
   }

   fact('都市国家',cityText,120,nextY,400);
   fact('役割',roleText,560,nextY,400);
   fact('得意なこと',skillText,120,nextY+132,400);
   fact('人々からの呼び名',aliasText,560,nextY+132,400);

   ctx.textAlign='center';
   ctx.fillStyle='#8f816d';
   ctx.font='18px sans-serif';
   ctx.fillText('※漢字の意味をもとにした、架空の古代ギリシャ風プロフィールです。',540,1850);

   const blob=await new Promise((resolve,reject)=>
      c.toBlob(b=>b?resolve(b):reject(new Error('blob failed')),'image/png')
   );
   const filename='greek-certificate-'+currentName+'.png';
   const file=new File([blob],filename,{type:'image/png'});

   if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      btn.textContent='共有画面を開きます…';
      await navigator.share({files:[file],title:'名に、物語を'});
   }else{
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=filename;
      a.rel='noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
   }
 }catch(err){
   console.error(err);
   alert('画像の保存に失敗しました。もう一度お試しください。');
 }finally{
   btn.disabled=false;
   btn.textContent=original;
 }
}"""

s=s[:start]+new+s[end:]
p.write_text(s,encoding="utf-8")
