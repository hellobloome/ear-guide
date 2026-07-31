const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

let conditions=[];
let acupoints=[];
const pointMap=new Map();

const toast=$("#toast");
let toastTimer;

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

const modal=$("#info-modal");

function openModal(title,copy){
  $("#modal-title").textContent=title;
  $("#modal-copy").textContent=copy;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
}

function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

$$("[data-close-modal]").forEach(button=>button.addEventListener("click",closeModal));
document.addEventListener("keydown",event=>{if(event.key==="Escape") closeModal();});

const menuButton=$(".menu-button");
const mobileMenu=$(".mobile-menu");

menuButton.addEventListener("click",()=>{
  const isOpen=mobileMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded",String(isOpen));
});

$$(".mobile-menu a").forEach(link=>link.addEventListener("click",()=>{
  mobileMenu.classList.remove("open");
  menuButton.setAttribute("aria-expanded","false");
}));

function normalize(value=""){
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

function searchableText(item){
  return normalize([
    item.name,
    item.category,
    item.summary,
    item.location,
    item.traditionalUse,
    ...(item.aliases||[])
  ].filter(Boolean).join(" "));
}

function scoreMatch(item,query){
  const q=normalize(query);
  const name=normalize(item.name);
  const aliases=(item.aliases||[]).map(normalize);
  const haystack=searchableText(item);

  if(name===q) return 100;
  if(aliases.includes(q)) return 90;
  if(name.startsWith(q)) return 75;
  if(aliases.some(alias=>alias.startsWith(q))) return 65;
  if(haystack.includes(q)) return 40;
  return 0;
}

function pointPills(ids=[]){
  return ids.map(id=>{
    const point=pointMap.get(id);
    return point ? `<span class="point-pill">${point.name}</span>` : "";
  }).join("");
}

function conditionCard(item){
  return `
    <article class="result-card condition-result">
      <span class="result-type">Concern</span>
      <h3>${item.name}</h3>
      <p>${item.summary}</p>
      <div class="point-list">${pointPills(item.pointIds)}</div>
    </article>
  `;
}

function pointCard(item){
  return `
    <article class="result-card point-result">
      <span class="result-type">Acupoint</span>
      <h3>${item.name}</h3>
      <p>${item.traditionalUse}</p>
      <dl>
        <dt>General location</dt>
        <dd>${item.location}</dd>
        <dt>Gentle stimulation</dt>
        <dd>${item.howToStimulate}</dd>
      </dl>
    </article>
  `;
}

function renderSearch(query){
  const clean=query.trim();
  if(!clean){
    showToast("Type a concern or acupoint first.");
    return;
  }

  const conditionMatches=conditions
    .map(item=>({item,score:scoreMatch(item,clean)}))
    .filter(match=>match.score>0)
    .sort((a,b)=>b.score-a.score);

  const pointMatches=acupoints
    .map(item=>({item,score:scoreMatch(item,clean)}))
    .filter(match=>match.score>0)
    .sort((a,b)=>b.score-a.score);

  const results=[...conditionMatches.map(x=>conditionCard(x.item)),...pointMatches.map(x=>pointCard(x.item))];
  const section=$("#search-results-section");
  const grid=$("#search-results");
  const empty=$("#empty-results");

  $("#results-heading").textContent=`Results for “${clean}”`;
  grid.innerHTML=results.join("");
  empty.hidden=results.length>0;
  section.hidden=false;
  section.scrollIntoView({behavior:"smooth",block:"start"});
}

async function loadData(){
  try{
    const [conditionResponse,pointResponse]=await Promise.all([
      fetch("./data/conditions.json"),
      fetch("./data/acupoints.json")
    ]);

    if(!conditionResponse.ok||!pointResponse.ok){
      throw new Error("Could not load the guide database.");
    }

    conditions=await conditionResponse.json();
    acupoints=await pointResponse.json();
    acupoints.forEach(point=>pointMap.set(point.id,point));
  }catch(error){
    console.error(error);
    showToast("The guide database could not load. Refresh the page.");
  }
}

$("#hero-search").addEventListener("submit",event=>{
  event.preventDefault();
  renderSearch($("#search-input").value);
});

$$(".search-chip,.concern-card").forEach(button=>{
  button.addEventListener("click",()=>{
    const query=button.dataset.query;
    $("#search-input").value=query;
    renderSearch(query);
  });
});

$("#clear-results").addEventListener("click",()=>{
  $("#search-results-section").hidden=true;
  $("#search-results").innerHTML="";
  $("#search-input").value="";
  $("#home").scrollIntoView({behavior:"smooth"});
});

$("#map-preview").addEventListener("click",()=>openModal(
  "Interactive ear map",
  "The visual shell is ready. Clickable point placement and detailed map panels will be added in a later package."
));

$("#learn-shenmen").addEventListener("click",()=>{
  $("#search-input").value="Shen Men";
  renderSearch("Shen Men");
});

$("#open-guide").addEventListener("click",()=>openModal(
  "Beginner guide",
  "Clean and dry the ear. Apply each seed carefully with tweezers, press gently for a few seconds, and remove it if irritation or significant discomfort occurs."
));

$("#view-all-concerns").addEventListener("click",event=>{
  const grid=$("#concern-grid");
  const isOpen=grid.classList.toggle("show-all");
  event.currentTarget.textContent=isOpen?"Show fewer concerns ↑":"View all concerns →";
});

$$(".point").forEach(point=>point.addEventListener("click",()=>{
  $("#search-input").value=point.dataset.label;
  renderSearch(point.dataset.label);
}));

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.12});

$$(".reveal").forEach(element=>revealObserver.observe(element));
$("#year").textContent=new Date().getFullYear();

loadData();
