const API = "/api";
const saved = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const state = { destinations: [], filter: "All", user: saved("tm_user"), token: localStorage.getItem("tm_token") || "" };
const $ = s => document.querySelector(s);
const toast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove("show"),2800); };
async function api(path, options={}) {
  const headers = { "Content-Type":"application/json", ...(options.headers||{}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(API+path,{...options,headers});
  const data = await response.json().catch(()=>({}));
  if (response.status === 401 && state.token && !path.startsWith("/auth/")) logout(false);
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
function logout(notify=true){state.user=null;state.token="";localStorage.removeItem("tm_user");localStorage.removeItem("tm_token");updateAuthUI();if(notify)toast("You have been logged out.");}
function updateAuthUI(){ $("#loginBtn").textContent=state.user?"My trips":"Log in"; $("#signupBtn").textContent=state.user?"Log out":"Get started ↗"; }
function destinationCard(d){return `<article class="destination-card" tabindex="0" aria-label="View ${escapeHtml(d.name)}" data-id="${d._id||""}"><div class="destination-image"><img src="${escapeHtml(d.image)}" alt="${escapeHtml(d.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900'"><span class="tag">${escapeHtml(d.region||"Explore")}</span><button class="save-dot" aria-label="View ${d.name}">↗</button></div><div class="destination-info"><span class="destination-location">⌖ ${escapeHtml(d.state||"India")}</span><div class="destination-title-row"><h3>${escapeHtml(d.name)}</h3><span class="rating">★ ${d.rating||"4.8"}</span></div><p>${escapeHtml(d.description||"")}</p><div class="card-bottom"><span>From <b>₹${Number(d.budget||0).toLocaleString("en-IN")}</b> / person</span><b>${escapeHtml(d.duration||"Explore")}</b></div></div></article>`;}
async function loadDestinations(){
  try { state.destinations=await api("/destinations"); renderDestinations(); }
  catch(e){ $("#destinationGrid").innerHTML=`<div class="empty">Could not connect to the travel database yet.<br><small>Start the server and MongoDB, then refresh this page.</small></div>`; }
}
function renderDestinations(){
 const q=($("#searchInput").value||"").toLowerCase(), vibe=$("#vibeSelect").value;
 const list=state.destinations.filter(d=>(state.filter==="All"||d.region===state.filter)&&(vibe==="All"||d.region===vibe||d.tags?.includes(vibe))&&(`${d.name} ${d.state} ${d.description} ${(d.tags||[]).join(" ")}`).toLowerCase().includes(q));
 $("#destinationGrid").innerHTML=list.length?list.map(destinationCard).join(""):`<div class="empty">No destinations match that search. Try another place or category.</div>`;
}
function openModal(html){$("#modalContent").innerHTML=html;$("#modalBackdrop").hidden=false;}
function closeModal(){$("#modalBackdrop").hidden=true;}
function authModal(mode="login"){
 const signup=mode==="signup";
 openModal(`<span class="eyebrow">YOUR NEXT ADVENTURE AWAITS</span><h2>${signup?"Create your account":"Welcome back"}</h2><p>${signup?"Join TravelMitra and keep all your trip ideas in one place.":"Log in to see and manage your saved trips."}</p><form id="authForm">${signup?'<input name="name" placeholder="Your name" required maxlength="60">':''}<input name="email" type="email" placeholder="Email address" required><input name="password" type="password" placeholder="Password (at least 6 characters)" required minlength="6"><button class="btn btn-orange" type="submit">${signup?"Create account":"Log in"} ↗</button></form><p class="helper">${signup?'Already a member? <a href="#" id="switchAuth">Log in</a>':'New to TravelMitra? <a href="#" id="switchAuth">Create an account</a>'}</p>`);
 $("#switchAuth").onclick=e=>{e.preventDefault();authModal(signup?"login":"signup")};
 $("#authForm").onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{const data=await api(`/auth/${signup?"register":"login"}`,{method:"POST",body:JSON.stringify(body)});state.token=data.token;state.user=data.user;localStorage.setItem("tm_token",state.token);localStorage.setItem("tm_user",JSON.stringify(state.user));updateAuthUI();closeModal();toast(signup?"Welcome to TravelMitra!":"You're logged in!");}catch(err){toast(err.message)}};
}
async function showTrips(){
 if(!state.token){authModal();return}
 try{const trips=await api("/trips");openModal(`<span class="eyebrow">YOUR LITTLE TRAVEL BOOK</span><h2>My trips ✦</h2><p>All your saved plans, together in one place.</p><button class="btn btn-orange" id="newTrip">＋ Plan a new trip</button><div class="trip-list">${trips.length?trips.map(t=>`<div class="trip-item"><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.destination)} · ${fmt(t.startDate)} – ${fmt(t.endDate)}${t.budget?` · ₹${Number(t.budget).toLocaleString("en-IN")}`:""}</small></div><button data-delete="${t._id}">Delete</button></div>`).join(""):'<div class="empty">No trips saved yet. Your next story starts here!</div>'}</div>`);
 $("#newTrip").onclick=tripModal;
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this trip?"))return;try{await api(`/trips/${b.dataset.delete}`,{method:"DELETE"});toast("Trip removed.");showTrips()}catch(e){toast(e.message)}});
 }catch(e){toast(e.message)}
}
const fmt=d=>new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function tripModal(){
 if(!state.token){closeModal();authModal();return}
 openModal(`<span class="eyebrow">MAKE IT HAPPEN</span><h2>Plan a little getaway ✈</h2><p>Put the basics in place. You can always change the plan later.</p><form id="tripForm"><div class="modal-grid"><label class="full">Trip name<input name="title" placeholder="A long weekend in the hills" required></label><label class="full">Destination<input name="destination" placeholder="e.g. Chopta, Uttarakhand" required></label><label>Start date<input name="startDate" type="date" required></label><label>End date<input name="endDate" type="date" required></label><label>Travellers<input name="travelers" type="number" min="1" max="30" value="2" required></label><label>Budget (₹)<input name="budget" type="number" min="0" value="8000"></label><label class="full">Travel vibe<select name="travelStyle"><option>Adventure</option><option>Relaxed</option><option>Backpacking</option><option>Culture</option><option>Nature</option></select></label><label class="full">Notes<textarea name="notes" placeholder="Places to see, things to remember…"></textarea></label></div><button class="btn btn-orange" type="submit">Save my trip ↗</button></form>`);
 const f=$("#tripForm"),today=new Date().toISOString().slice(0,10);f.startDate.min=today;f.startDate.onchange=()=>{f.endDate.min=f.startDate.value||today;};
 $("#tripForm").onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));body.travelers=Number(body.travelers);body.budget=Number(body.budget);try{await api("/trips",{method:"POST",body:JSON.stringify(body)});closeModal();toast("Your trip is saved. Let the countdown begin!");}catch(err){toast(err.message)}};
}
function destinationModal(d){
 openModal(`<span class="eyebrow">${escapeHtml(d.region||"INDIA")} · ${escapeHtml(d.state||"")}</span><h2>${escapeHtml(d.name)}</h2><img class="detail-image" src="${d.image}" alt="${escapeHtml(d.name)}"><p>${escapeHtml(d.description)}</p><div class="detail-pills"><span>★ ${d.rating||"4.8"} rating</span><span>₹${Number(d.budget||0).toLocaleString("en-IN")} est. / person</span><span>${escapeHtml(d.duration||"Flexible")}</span></div><p><b>Best time:</b> ${escapeHtml(d.bestTime||"Check local conditions")}</p><b class="helper">DON'T MISS</b><ul class="detail-list">${(d.highlights||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul><button class="btn btn-orange" id="planThis">Plan a trip here ↗</button>`);
 $("#planThis").onclick=()=>{tripModal();const dest=document.querySelector('#tripForm [name="destination"]');if(dest)dest.value=d.name+", "+d.state;};
}
$("#destinationGrid").addEventListener("click",e=>{const card=e.target.closest(".destination-card");if(card){const d=state.destinations.find(x=>x._id===card.dataset.id);if(d)destinationModal(d);}});
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;state.filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderDestinations();});
$("#searchForm").onsubmit=e=>{e.preventDefault();state.filter="All";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="All"));renderDestinations();$("#explore").scrollIntoView({behavior:"smooth"});};
$("#searchInput").oninput=renderDestinations;$("#vibeSelect").onchange=renderDestinations;
$("#loginBtn").onclick=()=>state.user?showTrips():authModal("login");
$("#signupBtn").onclick=()=>state.user?logout():authModal("signup");
$("#openPlanner").onclick=tripModal;$("#modalClose").onclick=closeModal;$("#modalBackdrop").onclick=e=>{if(e.target.id==="modalBackdrop")closeModal()};
$("#menuBtn").onclick=()=>$("#mainNav").classList.toggle("open");
$("#viewAll").onclick=()=>{state.filter="All";$("#searchInput").value="";$("#vibeSelect").value="All";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="All"));renderDestinations();};
$("#feedbackForm").onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));body.rating=Number(body.rating);try{const r=await api("/feedback",{method:"POST",body:JSON.stringify(body)});toast(r.message);e.target.reset()}catch(err){toast(err.message)}};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
$("#destinationGrid").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("destination-card"))e.target.click();});
updateAuthUI();loadDestinations();
