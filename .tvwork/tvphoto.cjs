// usage: node .tvwork/tvphoto.cjs <product-id> <raw-file> <left,top,width,height>  (crop of the TV in the raw photo)
const fs=require('fs');const sharp=require('C:/Users/nanam/Documents/Website/toko-23/node_modules/sharp');
const I='C:/Users/nanam/AppData/Local/Temp/claude/8362fe5f5525fc3b/4003451b-cb9d-4eb3-b610-6a6ad6c424fc/images/';
const logoSrc={aqua:[I+'14.jpg'],sharp:[I+'17.png'],lg:[I+'21.webp'],polytron:[I+'23.webp'],tcl:[I+'24.png'],samsung:[I+'25.jpg']};
async function getLogo(b){
  if(!logoSrc[b])return null;const [f]=logoSrc[b];
  const src=await sharp(f,{density:300}).flatten({background:'#fff'}).png().toBuffer();
  const t=await sharp(src).trim({background:'#fff',threshold:30}).toBuffer();
  return sharp(t).resize(330,100,{fit:'inside'}).png().toBuffer();
}
const [id,raw,box,wm]=process.argv.slice(2);const [l,t,w,h]=box.split(',').map(Number);
(async()=>{
 const p=JSON.parse(fs.readFileSync('content/products/'+id+'.json','utf8'));
 let base=await sharp(raw).flatten({background:'#fff'}).png().toBuffer();
 if(wm){const [x0,y0,w0,h0]=wm.split(',').map(Number);const m=34;const x=x0-m,y=y0-m,ww=w0+2*m,hh=h0+2*m;
  const blurred=await sharp(base).extract({left:x,top:y,width:ww,height:hh}).blur(10).png().toBuffer();
  const maskSvg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+ww+'" height="'+hh+'"><rect x="'+m+'" y="'+m+'" width="'+w0+'" height="'+h0+'" fill="#fff"/></svg>');
  const mask=await sharp({create:{width:ww,height:hh,channels:3,background:'#000'}}).composite([{input:maskSvg}]).blur(18).greyscale().png().toBuffer();
  const alpha=await sharp(mask).extractChannel(0).raw().toBuffer();const rgb=await sharp(blurred).removeAlpha().raw().toBuffer();const out=Buffer.alloc(ww*hh*4);
  for(let i=0;i<ww*hh;i++){out[i*4]=rgb[i*3];out[i*4+1]=rgb[i*3+1];out[i*4+2]=rgb[i*3+2];out[i*4+3]=alpha[i];}
  const patch=await sharp(out,{raw:{width:ww,height:hh,channels:4}}).png().toBuffer();base=await sharp(base).composite([{input:patch,left:x,top:y}]).png().toBuffer();}
 const crop=await sharp(base).extract({left:l,top:t,width:w,height:h}).png().toBuffer();
 const trimmed=await sharp(crop).trim({background:'#fff',threshold:14}).toBuffer();
 const photo=await sharp(trimmed).resize(700,470,{fit:'inside'}).png().toBuffer();
 const pm=await sharp(photo).metadata();
 const logo=await getLogo(p.title.split(' ')[0].toLowerCase());const lm=logo?await sharp(logo).metadata():{width:0,height:0};
 const white=await sharp({create:{width:740,height:740,channels:3,background:'#fff'}}).png().toBuffer();
 const gap1=logo?28:0,gap2=22,th=56,total=lm.height+gap1+pm.height+gap2+th,y0=Math.round(275+(740-total)/2);
 const model=String(p.model||p.title);const size=Math.min(50,Math.floor(680/(model.length*0.62)));
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="740" height="90"><text x="370" y="50" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="'+size+'" fill="#1a1a8c">'+model.replace(/&/g,'&amp;')+'</text></svg>');
 const comps=[{input:white,left:230,top:275}];
 if(logo)comps.push({input:logo,left:Math.round(600-lm.width/2),top:y0});
 comps.push({input:photo,left:Math.round(600-pm.width/2),top:y0+lm.height+gap1},{input:svg,left:230,top:y0+lm.height+gap1+pm.height+gap2-14});
 const out=await sharp(I+'13.png').composite(comps).png().toBuffer();
 const name='produk-'+id+'-1.png';
 for(const d of ['mockup/toko-23','public']) fs.writeFileSync(d+'/assets/uploads/'+name,out);
 p.photo='/assets/uploads/'+name;p.photos=[p.photo];
 fs.writeFileSync('content/products/'+id+'.json',JSON.stringify(p,null,2)+'\n');
 fs.writeFileSync('.tvwork/preview-'+id+'.png',out);
 console.log('ok',name,pm.width,pm.height,logo?'logo':'no logo');
})();
