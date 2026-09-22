from pathlib import Path
p=Path("greek-name-v4/index.html")
s=p.read_text(encoding="utf-8")
start=s.find("save.onclick=")
if start<0:
    raise SystemExit("save onclick not found")
end=s.find(";['name','reading'].forEach", start)
if end<0:
    raise SystemExit("save end not found")

new="""document.getElementById('save').onclick=async()=>{
 const btn=document.getElementById('save');
 const original=btn.textContent;
 btn.disabled=true;
 btn.textContent='画像を作成中…';
 try{
   const currentName=document.getElementById('name').value.trim()||'name';
   const c=document.getElementById('canvas');
   const ctx=c.getContext('2d');
   ctx.clearRect(0,0,c.width,c.height);
   ctx.fillStyle='#fff8ea';ctx.fillRect(0,0,c.width,c.height);
   ctx.fillStyle='#a47727';ctx.textAlign='center';ctx.font='bold 34px serif';
   ctx.fillText('名に、物語を',540,68);
   ctx.strokeStyle='#a47727';ctx.lineWidth=4;ctx.strokeRect(32,30,1016,1560);

   const img=new Image();
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=SPRITE});

   const analyzed=analyze(currentName);
   const gv=(document.querySelector('input[name=gender]:checked')||{}).value||'male';
   const idx=order.indexOf(analyzed.t)*2+(gv==='female'?1:0);
   const sx=(idx%4)*180,sy=Math.floor(idx/4)*270;
   ctx.drawImage(img,sx,sy,180,270,135,120,810,1215);

   ctx.fillStyle='#fff8ea';ctx.fillRect(80,1260,920,290);
   ctx.fillStyle='#111';ctx.font='bold 70px serif';
   ctx.fillText(document.getElementById('greekName').textContent,540,1355);
   ctx.font='34px serif';
   ctx.fillText(document.getElementById('epithet').textContent,540,1415);
   ctx.font='26px serif';
   ctx.fillText(currentName+' → '+document.getElementById('greekScript').textContent,540,1475);

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
