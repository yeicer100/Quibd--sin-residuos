/* ===== Reportes + mapa (versión sencilla: cuentas en js/admins.js, reportes en el navegador) ===== */
const map=L.map('leaflet-map').setView([5.6922,-76.6582],14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
const ES={Pendiente:'bg-red-600',Atención:'bg-amber-500',Resuelto:'bg-brand-600'};
const EJEMPLOS=[{lat:5.6980,lng:-76.6580,barrio:'Barrio Niño Jesús',desc:'Acumulación de residuos en vía pública.',estado:'Pendiente',ej:1},{lat:5.6910,lng:-76.6630,barrio:'Barrio El Carmen',desc:'Residuos cerca de una quebrada.',estado:'Atención',ej:1},{lat:5.6880,lng:-76.6650,barrio:'Barrio La Playita',desc:'Jornada de limpieza realizada.',estado:'Resuelto',ej:1}];
const KEY='qsr_reportes',SES='qsr_admin';
let datos=EJEMPLOS,markers=[],foto='',admin=false;
const leer=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
const guardar=l=>{try{localStorage.setItem(KEY,JSON.stringify(l));return true}catch(e){alert('No hay espacio para guardar. Prueba con una foto más pequeña o sin foto.');return false}};

function tarjeta(r){
 const d=document.createElement('div');d.className='bg-white border border-brand-200 rounded-2xl overflow-hidden shadow-sm';
 const ctl=admin&&r.id?`<div class="flex gap-2 pt-2"><select data-id="${esc(r.id)}" class="text-[11px] border border-slate-300 rounded-lg p-1 flex-1">${Object.keys(ES).map(k=>`<option ${k===r.estado?'selected':''}>${k}</option>`).join('')}</select><button data-del="${esc(r.id)}" class="text-[11px] text-red-600 font-bold px-2" title="Eliminar"><i class="fa-solid fa-trash"></i></button></div>`:'';
 d.innerHTML=`${r.foto?`<img src="${esc(r.foto)}" class="w-full h-28 object-cover" alt="Foto">`:`<div class="h-2 ${ES[r.estado]}"></div>`}<div class="p-4 space-y-1"><span class="text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${ES[r.estado]}">${esc(r.estado)}${r.ej?' · Ejemplo':''}</span><b class="block text-sm text-brand-800 mt-1">• ${esc(r.barrio)}</b><p class="text-xs text-slate-600">${esc(r.desc)}</p>${ctl}</div>`;
 return d}
function pintar(){
 const l=leer();datos=l.length?l:EJEMPLOS;
 markers.forEach(m=>m.remove());markers=[];$('#listaRep').innerHTML='';
 datos.forEach(r=>{
  markers.push(L.marker([r.lat,r.lng]).addTo(map).bindPopup(`<b>${esc(r.barrio)}</b><br>${esc(r.desc)}<br><span class="text-white px-1.5 py-0.5 rounded text-[10px] font-bold ${ES[r.estado]}">${esc(r.estado)}</span>`));
  $('#listaRep').append(tarjeta(r))});
 $('#total').textContent=datos.length+' reportes'}

/* ---------- Sesión ---------- */
const modal=$('#modalLogin'),errBox=$('#loginError');
const abrir=()=>{errBox.textContent='';modal.classList.remove('hidden');modal.classList.add('flex');$('#loginEmail').focus()};
const cerrar=()=>{modal.classList.add('hidden');modal.classList.remove('flex')};
function sesion(email){
 admin=!!email;
 $('#adminForm').classList.toggle('hidden',!admin);$('#bloqueado').classList.toggle('hidden',admin);
 $('#btnLogin').innerHTML=admin?'<i class="fa-solid fa-right-from-bracket"></i> Salir':'<i class="fa-solid fa-lock"></i> Administración';
 $('#adminEmail').textContent=email||'';
 pintar()}
$('#btnLogin').onclick=()=>{if(admin){sessionStorage.removeItem(SES);sesion(null)}else abrir()};
$('#btnLogin2').onclick=abrir;$('#btnCancelar').onclick=cerrar;
modal.onclick=e=>{if(e.target===modal)cerrar()};
$('#formLogin').onsubmit=e=>{e.preventDefault();
 const m=$('#loginEmail').value.trim().toLowerCase(),p=$('#loginPass').value;
 const ok=ADMINS.some(a=>a.correo.toLowerCase()===m&&a.clave===p);
 if(!ok){errBox.textContent='Correo o contraseña incorrectos.';return}
 sessionStorage.setItem(SES,m);e.target.reset();cerrar();sesion(m)};

/* ---------- Foto y ubicación ---------- */
$('#repFoto').onchange=e=>{const f=e.target.files[0];foto='';if(!f)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,640/i.width),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);foto=c.toDataURL('image/jpeg',.6);$('#imgPreview').src=foto;$('#imgPreview').classList.remove('hidden')};i.src=r.result};r.readAsDataURL(f)};
async function coords(b){try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(b+', Quibdó, Chocó, Colombia'));const j=await r.json();if(j[0])return{lat:+j[0].lat,lng:+j[0].lon}}catch(e){}return{lat:5.6922,lng:-76.6582}}

/* ---------- Publicar / editar / borrar (solo con sesión iniciada) ---------- */
$('#formReporte').onsubmit=async e=>{e.preventDefault();if(!admin)return;
 const btn=$('#btnSubmit'),b=$('#repBarrio').value.trim(),d=$('#repDesc').value.trim();if(!b||!d)return;
 btn.disabled=true;btn.textContent='Buscando ubicación...';
 const c=await coords(b),l=leer();
 l.unshift({id:String(Date.now()),...c,barrio:b,desc:d,estado:$('#repEstado').value,foto});
 if(guardar(l)){pintar();map.flyTo([c.lat,c.lng],16);e.target.reset();foto='';$('#imgPreview').classList.add('hidden')}
 btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-paper-plane"></i> Publicar reporte'};
$('#listaRep').addEventListener('change',e=>{const id=e.target.dataset.id;if(!id||!admin)return;const l=leer(),r=l.find(x=>x.id===id);if(r){r.estado=e.target.value;guardar(l);pintar()}});
$('#listaRep').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b&&admin&&confirm('¿Eliminar este reporte?')){guardar(leer().filter(x=>x.id!==b.dataset.del));pintar()}});

/* ---------- Arranque ---------- */
sesion(sessionStorage.getItem(SES));
