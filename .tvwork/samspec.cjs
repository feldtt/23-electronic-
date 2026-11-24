const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');
const sec=[...h.matchAll(/an-la="accordion:([^"]+)"/g)].map(m=>[m.index,m[1]]);
const re=/content-item-title">([^<]*)<\/p>\s*<p class="pdd32-product-spec__content-item-desc">([^<]*)</g;
let m,out=[];while((m=re.exec(h))){let s='';for(const [i,n] of sec)if(i<m.index)s=n;out.push(s+' | '+m[1].trim()+' = '+m[2].trim().replace(/&amp;/g,'&').replace(/&trade;|™/g,''))}
console.log(out.join('\n'));
