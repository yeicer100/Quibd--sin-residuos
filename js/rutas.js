const key=z=>z.n==='3'?(z.t.startsWith('6')?'3d':'3n'):z.n;
const nz=z=>z.nombre||'Zona '+z.n,dt=d=>d.map(i=>DIAS[i]).join(', ').replace(/, ([^,]*)$/,' y $1');
const prox=(z,h)=>{for(let i=0;i<7;i++){const d=(h+i)%7;if(z.d.includes(d))return{d,i}}};
const hoy=new Date().getDay(),DI=[1,2,3,4,5,6,0],DL=['L','M','M','J','V','S','D'];

const B2Z={};ZONAS.forEach(z=>(BS[z.n]||[]).forEach(b=>(B2Z[b]=B2Z[b]||[]).push(z)));
const bs=$('#selectBarrio');bs.innerHTML='<option value="">-- Seleccionar barrio --</option>'+Object.keys(B2Z).sort((a,b)=>a.localeCompare(b,'es')).map(b=>`<option>${b}</option>`).join('');
bs.onchange=()=>{const zs=B2Z[bs.value],o=$('#infoRutaBox');if(!zs){o.textContent='Elige un barrio y te mostramos su zona, días y horario.';return}
o.innerHTML=`<b class="text-base">${esc(bs.value)}</b>`+zs.map(z=>{const p=prox(z,hoy),t=TH[key(z)];return `<p class="mt-2"><span class="inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${t.on}">${nz(z)}</span> 🗓️ ${dt(z.d)} · ⏰ ${z.t}<br><span class="text-xs">Próximo paso: ${p.i===0?'¡hoy!':p.i===1?'mañana':'el '+DIAS[p.d]}</span></p>`}).join('')+'<p class="text-[11px] text-brand-700 mt-3 pt-2 border-t border-brand-200">📢 Saca tus residuos máximo 3 horas antes del horario.</p>'};

const pasan=ZONAS.filter(z=>z.d.includes(hoy));
$('#todayBox').textContent=`🚛 Hoy es ${DIAS[hoy]}: pasa el camión por ${pasan.map(nz).join(' y ')}.`;$('#heroHoy').textContent=$('#todayBox').textContent;
$('#weekGrid').innerHTML=DI.map(d=>`<div class="rounded-2xl border-2 p-3 text-center ${d===hoy?'border-brand-800 bg-lime-100 shadow-lg':'border-brand-200 bg-white'}"><div class="text-[11px] font-extrabold uppercase text-brand-800">${DIAS[d].slice(0,3)}${d===hoy?' · HOY':''}</div><div class="mt-2 space-y-1.5">${ZONAS.filter(z=>z.d.includes(d)).map(z=>`<div class="text-xs font-bold text-white rounded-lg py-1 bg-gradient-to-r ${TH[key(z)].h}">${z.n==='D'?'Dom':'Z'+z.n} ${z.t.startsWith('6')?'☀️':'🌙'}</div>`).join('')}</div></div>`).join('');
const chipsOf=(bl,t)=>bl.replace(/\.$/,'').split(/,\s+/).map(x=>`<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full border ${t.chip}">${esc(x.charAt(0).toUpperCase()+x.slice(1))}</span>`).join('');
$('#zonesGrid').innerHTML=ZONAS.map(z=>{const t=TH[key(z)],pasa=z.d.includes(hoy),noche=!z.t.startsWith('6');
return `<article class="zone break-inside-avoid mb-5 bg-white rounded-3xl overflow-hidden shadow-md border-2 ${t.bd} ${pasa?'ring-4 ring-offset-2 '+t.ring:''}" data-d="${z.d}" data-h="${noche?'noche':'dia'}">
<div class="bg-gradient-to-br ${t.h} text-white p-5 relative overflow-hidden"><div class="absolute -right-4 -top-4 text-8xl opacity-20 select-none">${noche?'🌙':'☀️'}</div>
<div class="flex items-center gap-4 relative"><span class="text-4xl font-black bg-white/25 rounded-2xl w-16 h-16 flex items-center justify-center">${z.n}</span><div><b class="block text-xl leading-tight">${nz(z)}</b><span class="text-sm opacity-90">${noche?'🌙 Turno de noche':'☀️ Turno de día'}</span></div>${pasa?'<span class="ml-auto bg-white text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full">🚛 PASA HOY</span>':''}</div>
<div class="mt-4 inline-block bg-white text-slate-900 font-extrabold text-base px-4 py-1.5 rounded-full relative">⏰ ${z.t}</div></div>
<div class="px-5 pt-4 flex gap-1.5">${DI.map((d,i)=>`<span class="flex-1 text-center text-xs font-bold py-1.5 rounded-lg ${z.d.includes(d)?t.on+' text-white':'bg-slate-100 text-slate-400'} ${d===hoy?'outline outline-2 outline-offset-1 outline-slate-800':''}">${DL[i]}</span>`).join('')}</div>
<div class="p-5 space-y-3">${z.b.map(bl=>`<div class="flex flex-wrap gap-1.5">${chipsOf(bl,t)}</div>`).join(`<div class="border-t border-dashed ${t.bd}"></div>`)}</div></article>`}).join('');
const CH=[['todas','Todas'],['hoy','Pasan hoy'],['dia','☀️ Turno de día'],['noche','🌙 Turno de noche']],on='bg-brand-800 text-white border-brand-800',off='bg-white text-brand-800 border-brand-200';
$('#chips').innerHTML=CH.map(([f,l],i)=>`<button data-f="${f}" class="chip border px-4 py-1.5 rounded-full text-sm font-semibold ${i?off:on}">${l}</button>`).join('');
$$('.chip').forEach(c=>c.onclick=()=>{$$('.chip').forEach(x=>x.className='chip border px-4 py-1.5 rounded-full text-sm font-semibold '+off);c.className='chip border px-4 py-1.5 rounded-full text-sm font-semibold '+on;const f=c.dataset.f;$$('.zone').forEach(z=>z.classList.toggle('hidden',!(f==='todas'||(f==='hoy'&&z.dataset.d.split(',').includes(String(hoy)))||z.dataset.h===f)))});
