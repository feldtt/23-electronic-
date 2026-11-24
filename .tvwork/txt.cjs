const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\n\s*\n+/g,'\n');
const lines=h.split('\n').map(s=>s.trim()).filter(s=>s.length>1);
const k=process.argv[3]?new RegExp(process.argv[3],'i'):null;
const out=k?lines.filter(l=>k.test(l)):lines;
console.log(out.slice(0,+process.argv[4]||80).join('\n'));
