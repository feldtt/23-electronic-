const s=require('sharp');const fs=require('fs');
(async()=>{for(const id of process.argv.slice(2)){
const src='public/assets/uploads/produk-'+id+'-1.png';
const x0=232,y0=280,W=736,H=640;
const {data,info}=await s(src).extract({left:x0,top:y0,width:W,height:H}).removeAlpha().raw().toBuffer({resolveWithObject:true});
const rows=[];for(let y=0;y<H;y++){let n=0;for(let x=0;x<W;x++){const i=(y*W+x)*3;if(data[i]<235||data[i+1]<235||data[i+2]<235)n++}rows.push(n>0)}
const runs=[];let st=-1,gap=0;for(let y=0;y<H;y++){if(rows[y]){if(st<0)st=y;gap=0;last=y}else if(st>=0){gap++;if(gap>10){runs.push([st,last]);st=-1;gap=0}}}
if(st>=0)runs.push([st,last]);
console.log(id,JSON.stringify(runs));
const r=runs[0];const out='tools/foto-produk/raw/'+id+'.png';
await s(src).extract({left:x0,top:y0+r[0],width:W,height:r[1]-r[0]+1}).png().toFile(out);
const m=await s(out).metadata();console.log(' ->',m.width,m.height)}})()
