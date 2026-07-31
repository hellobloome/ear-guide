const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const toast=$("#toast");let timer;
function showToast(m){toast.textContent=m;toast.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove("show"),2400)}
const modal=$("#info-modal");
function openModal(t,c){$("#modal-title").textContent=t;$("#modal-copy").textContent=c;modal.classList.add("open");document.body.classList.add("modal-open")}
function closeModal(){modal.classList.remove("open");document.body.classList.remove("modal-open")}
$$("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));
$(".menu-button").addEventListener("click",e=>{const open=$(".mobile-menu").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",String(open))});
$$(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>$(".mobile-menu").classList.remove("open")));
function search(q){q=q.trim();if(!q)return showToast("Type a concern or acupoint first.");openModal("Search: "+q,"The search interface is working. Package 2 will connect it to the Bloomé concern and acupoint database.")}
$("#hero-search").addEventListener("submit",e=>{e.preventDefault();search($("#search-input").value)});
$$(".search-chip,.concern-card").forEach(b=>b.addEventListener("click",()=>{$("#search-input").value=b.dataset.query;search(b.dataset.query)}));
$("#map-preview").addEventListener("click",()=>openModal("Interactive ear map","The visual shell is ready. Clickable map data will be added in Package 2."));
$("#learn-shenmen").addEventListener("click",()=>openModal("Shen Men","This preview works. Package 2 will add full location, common uses and related concerns."));
$("#open-guide").addEventListener("click",()=>openModal("Beginner guide","Clean and dry the ear, apply with tweezers, press gently, and remove if irritation occurs."));
$("#view-all-concerns").addEventListener("click",e=>{const g=$("#concern-grid"),open=g.classList.toggle("show-all");e.currentTarget.textContent=open?"Show fewer concerns ↑":"View all concerns →"});
$$(".point").forEach(p=>p.addEventListener("click",()=>showToast(p.dataset.label+" selected")));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{threshold:.12});$$(".reveal").forEach(el=>obs.observe(el));
$("#year").textContent=new Date().getFullYear();
