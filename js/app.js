const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];

let conditions=[];
let acupoints=[];
let conditionMap=new Map();
let pointMap=new Map();
let currentResults=[];
let activeFilter="all";
let activeAutocompleteIndex=-1;
let selectedMapPointId="shen-men";

const mapPositions={
  "shen-men":[62,26],
  "point-zero":[51,46],
  "heart":[42,55],
  "sympathetic":[32,42],
  "kidney":[59,38],
  "occiput":[34,66],
  "stomach":[49,51],
  "spleen":[55,55],
  "brain":[39,70],
  "endocrine":[48,67],
  "mouth":[43,59],
  "cervical-spine":[66,58],
  "shoulder":[69,48],
  "jaw":[44,78]
};

const concernSymbols=["☾","≈","⌁","◡","◎","✦","⌒","♡","✿","◇","↟","◌"];

function normalize(value=""){
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

function escapeHtml(value=""){
  return value.replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
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
  if(!q) return 0;
  const name=normalize(item.name);
  const aliases=(item.aliases||[]).map(normalize);
  const haystack=searchableText(item);

  if(name===q) return 100;
  if(aliases.includes(q)) return 92;
  if(name.startsWith(q)) return 80;
  if(aliases.some(alias=>alias.startsWith(q))) return 70;
  if(haystack.includes(q)) return 45;
  return 0;
}

function getMatches(query,limit=50){
  const conditionMatches=conditions
    .map(item=>({kind:"condition",item,score:scoreMatch(item,query)}))
    .filter(result=>result.score>0);

  const pointMatches=acupoints
    .map(item=>({kind:"point",item,score:scoreMatch(item,query)}))
    .filter(result=>result.score>0);

  return [...conditionMatches,...pointMatches]
    .sort((a,b)=>b.score-a.score||a.item.name.localeCompare(b.item.name))
    .slice(0,limit);
}

const toast=$("#toast");
let toastTimer;

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

function openOverlay(element){
  element.classList.add("open");
  element.setAttribute("aria-hidden","false");
  document.body.classList.add("overlay-open");
}

function closeOverlay(element){
  element.classList.remove("open");
  element.setAttribute("aria-hidden","true");
  if(!$(".drawer.open")&&!$(".modal.open")) document.body.classList.remove("overlay-open");
}

const drawer=$("#detail-drawer");
const modal=$("#info-modal");

$$("[data-close-drawer]").forEach(button=>button.addEventListener("click",()=>closeOverlay(drawer)));
$$("[data-close-modal]").forEach(button=>button.addEventListener("click",()=>closeOverlay(modal)));
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeOverlay(drawer);
    closeOverlay(modal);
    hideAutocomplete();
  }
});

function detailTags(items,kind){
  return items.map(item=>`
    <button class="detail-tag" data-open-kind="${kind}" data-open-id="${escapeHtml(item.id)}">
      ${escapeHtml(item.name)}
    </button>
  `).join("");
}

function openPointDetail(pointId){
  const point=pointMap.get(pointId);
  if(!point) return;

  const relatedConditions=(point.relatedConditionIds||[])
    .map(id=>conditionMap.get(id))
    .filter(Boolean);

  $("#drawer-content").innerHTML=`
    <header class="detail-hero">
      <span class="detail-type">${escapeHtml(point.category||"Acupoint")}</span>
      <h2 id="drawer-title">${escapeHtml(point.name)}</h2>
      <p class="detail-summary">${escapeHtml(point.shortDescription||point.traditionalUse||"")}</p>
    </header>

    <section class="detail-section">
      <h3>General location</h3>
      <p>${escapeHtml(point.location)}</p>
    </section>

    <section class="detail-section">
      <h3>Traditional wellness use</h3>
      <p>${escapeHtml(point.traditionalUse)}</p>
    </section>

    <section class="detail-section">
      <h3>Gentle stimulation</h3>
      <p>${escapeHtml(point.howToStimulate)}</p>
    </section>

    <section class="detail-section">
      <h3>Related concerns</h3>
      <div class="detail-tags">
        ${relatedConditions.length ? detailTags(relatedConditions,"condition") : "<p>No related concern entries yet.</p>"}
      </div>
    </section>

    <section class="detail-section">
      <h3>Caution</h3>
      <p>${escapeHtml(point.caution)}</p>
    </section>
  `;

  bindDrawerLinks();
  openOverlay(drawer);
}

function openConditionDetail(conditionId){
  const condition=conditionMap.get(conditionId);
  if(!condition) return;

  const points=(condition.pointIds||[]).map(id=>pointMap.get(id)).filter(Boolean);

  $("#drawer-content").innerHTML=`
    <header class="detail-hero">
      <span class="detail-type">${escapeHtml(condition.category||"Concern")}</span>
      <h2 id="drawer-title">${escapeHtml(condition.name)}</h2>
      <p class="detail-summary">${escapeHtml(condition.summary)}</p>
    </header>

    <section class="detail-section">
      <h3>Suggested point combination</h3>
      <div class="detail-tags">${detailTags(points,"point")}</div>
    </section>

    <section class="detail-section">
      <h3>How to use this guide</h3>
      <p>Start with a small number of points, follow the beginner instructions, and stop if the skin becomes irritated or the ear feels significantly uncomfortable.</p>
    </section>

    <section class="detail-section">
      <h3>Important</h3>
      <p>This is general wellness education. Persistent, severe, sudden or unexplained symptoms should be assessed by a qualified healthcare professional.</p>
    </section>
  `;

  bindDrawerLinks();
  openOverlay(drawer);
}

function bindDrawerLinks(){
  $$("[data-open-kind]",$("#drawer-content")).forEach(button=>{
    button.addEventListener("click",()=>{
      const {openKind,openId}=button.dataset;
      if(openKind==="point") openPointDetail(openId);
      else openConditionDetail(openId);
    });
  });
}

function autocompleteMarkup(result,index){
  const icon=result.kind==="condition"?"♡":"◌";
  const subtitle=result.kind==="condition"
    ? result.item.summary
    : result.item.category;

  return `
    <button class="autocomplete-item" role="option" data-index="${index}" data-kind="${result.kind}" data-id="${escapeHtml(result.item.id)}">
      <span class="autocomplete-icon">${icon}</span>
      <span>
        <strong>${escapeHtml(result.item.name)}</strong>
        <small>${escapeHtml(subtitle||"")}</small>
      </span>
      <span class="autocomplete-type">${result.kind==="condition"?"Concern":"Point"}</span>
    </button>
  `;
}

function showAutocomplete(query){
  const list=$("#autocomplete-list");
  const matches=getMatches(query,7);

  if(!query.trim()||!matches.length){
    hideAutocomplete();
    return;
  }

  activeAutocompleteIndex=-1;
  list.innerHTML=matches.map(autocompleteMarkup).join("");
  list.hidden=false;

  $$(".autocomplete-item",list).forEach(button=>{
    button.addEventListener("mousedown",event=>{
      event.preventDefault();
      chooseAutocomplete(button.dataset.kind,button.dataset.id);
    });
  });
}

function hideAutocomplete(){
  const list=$("#autocomplete-list");
  list.hidden=true;
  list.innerHTML="";
  activeAutocompleteIndex=-1;
}

function chooseAutocomplete(kind,id){
  hideAutocomplete();
  const item=kind==="condition"?conditionMap.get(id):pointMap.get(id);
  $("#search-input").value=item?.name||"";
  if(kind==="condition") openConditionDetail(id);
  else openPointDetail(id);
}

function moveAutocomplete(direction){
  const items=$$(".autocomplete-item",$("#autocomplete-list"));
  if(!items.length) return;

  activeAutocompleteIndex=(activeAutocompleteIndex+direction+items.length)%items.length;
  items.forEach((item,index)=>item.classList.toggle("active",index===activeAutocompleteIndex));
  items[activeAutocompleteIndex].scrollIntoView({block:"nearest"});
}

function resultCard(result){
  const item=result.item;

  if(result.kind==="condition"){
    const points=(item.pointIds||[]).map(id=>pointMap.get(id)).filter(Boolean);
    return `
      <article class="result-card" data-kind="condition">
        <span class="result-type">Concern</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="point-list">
          ${points.map(point=>`<span class="point-pill">${escapeHtml(point.name)}</span>`).join("")}
        </div>
        <button class="result-open" data-open-kind="condition" data-open-id="${escapeHtml(item.id)}">Open concern guide →</button>
      </article>
    `;
  }

  return `
    <article class="result-card" data-kind="point">
      <span class="result-type">Acupoint</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.traditionalUse)}</p>
      <button class="result-open" data-open-kind="point" data-open-id="${escapeHtml(item.id)}">Open point guide →</button>
    </article>
  `;
}

function renderResults(){
  const filtered=activeFilter==="all"
    ? currentResults
    : currentResults.filter(result=>result.kind===activeFilter);

  $("#search-results").innerHTML=filtered.map(resultCard).join("");
  $("#empty-results").hidden=filtered.length>0;

  $$(".result-open",$("#search-results")).forEach(button=>{
    button.addEventListener("click",()=>{
      if(button.dataset.openKind==="condition") openConditionDetail(button.dataset.openId);
      else openPointDetail(button.dataset.openId);
    });
  });
}

function runSearch(query){
  const clean=query.trim();

  if(!clean){
    showToast("Type a concern or acupoint first.");
    return;
  }

  hideAutocomplete();
  currentResults=getMatches(clean);
  activeFilter="all";
  $$(".filter-button").forEach(button=>button.classList.toggle("active",button.dataset.filter==="all"));
  $("#results-heading").textContent=`Results for “${clean}”`;
  $("#search-results-section").hidden=false;
  renderResults();
  $("#search-results-section").scrollIntoView({behavior:"smooth",block:"start"});
}

function renderConcerns(){
  $("#concern-grid").innerHTML=conditions.map((condition,index)=>`
    <button class="concern-card reveal ${index>=4?"extra":""}" data-condition-id="${escapeHtml(condition.id)}">
      <span>${concernSymbols[index%concernSymbols.length]}</span>
      <h3>${escapeHtml(condition.name)}</h3>
      <p>${escapeHtml(condition.summary)}</p>
    </button>
  `).join("");

  $$(".concern-card").forEach(button=>{
    button.addEventListener("click",()=>openConditionDetail(button.dataset.conditionId));
  });

  observeReveals();
}

function renderMap(){
  const markers=$("#map-markers");

  markers.innerHTML=acupoints
    .filter(point=>mapPositions[point.id])
    .map(point=>{
      const [left,top]=mapPositions[point.id];
      return `
        <button
          class="map-marker ${point.id===selectedMapPointId?"active":""}"
          style="left:${left}%;top:${top}%"
          data-point-id="${escapeHtml(point.id)}"
          data-name="${escapeHtml(point.name)}"
          aria-label="${escapeHtml(point.name)}"
        ></button>
      `;
    }).join("");

  $$(".map-marker",markers).forEach(marker=>{
    marker.addEventListener("click",()=>selectMapPoint(marker.dataset.pointId));
  });

  selectMapPoint(selectedMapPointId,false);
}

function selectMapPoint(pointId,scroll=false){
  const point=pointMap.get(pointId);
  if(!point) return;

  selectedMapPointId=pointId;
  $$(".map-marker").forEach(marker=>marker.classList.toggle("active",marker.dataset.pointId===pointId));
  $("#map-selected-name").textContent=point.name;
  $("#map-selected-use").textContent=point.traditionalUse;
  $("#map-open-detail").dataset.pointId=pointId;

  if(scroll) $("#ear-map").scrollIntoView({behavior:"smooth",block:"start"});
}

function openPointDirectory(){
  currentResults=acupoints
    .slice()
    .sort((a,b)=>a.name.localeCompare(b.name))
    .map(item=>({kind:"point",item,score:1}));

  activeFilter="point";
  $("#results-heading").textContent="Browse all acupoints";
  $("#search-results-section").hidden=false;
  $$(".filter-button").forEach(button=>button.classList.toggle("active",button.dataset.filter==="point"));
  renderResults();
  $("#search-results-section").scrollIntoView({behavior:"smooth",block:"start"});
}

function openBeginnerGuide(){
  $("#modal-title").textContent="Beginner guide";
  $("#modal-copy").innerHTML=`
    <ol class="guide-list">
      <li><strong>Clean and dry the ear.</strong> Oils and moisture can weaken the adhesive.</li>
      <li><strong>Choose a small number of points.</strong> A simple routine is easier to follow.</li>
      <li><strong>Apply outside the ear canal.</strong> Position each seed gently with clean tweezers.</li>
      <li><strong>Press comfortably.</strong> Mild pressure is enough. Sharp pain is a sign to stop.</li>
      <li><strong>Check the skin daily.</strong> Remove seeds if irritation, swelling or significant discomfort appears.</li>
      <li><strong>Take regular breaks.</strong> Allow the skin to rest between applications.</li>
    </ol>
    <p>This guide supports general wellness only and does not replace medical assessment or treatment.</p>
  `;
  openOverlay(modal);
}

function observeReveals(){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12});

  $$(".reveal:not(.visible)").forEach(element=>observer.observe(element));
}

async function loadData(){
  try{
    const [conditionResponse,pointResponse]=await Promise.all([
      fetch("./data/conditions.json"),
      fetch("./data/acupoints.json")
    ]);

    if(!conditionResponse.ok||!pointResponse.ok) throw new Error("Database request failed.");

    conditions=await conditionResponse.json();
    acupoints=await pointResponse.json();
    conditionMap=new Map(conditions.map(item=>[item.id,item]));
    pointMap=new Map(acupoints.map(item=>[item.id,item]));

    renderConcerns();
    renderMap();
  }catch(error){
    console.error(error);
    showToast("The guide database could not load. Refresh the page.");
  }
}

const searchInput=$("#search-input");

searchInput.addEventListener("input",()=>showAutocomplete(searchInput.value));
searchInput.addEventListener("keydown",event=>{
  const list=$("#autocomplete-list");

  if(event.key==="ArrowDown"&&!list.hidden){
    event.preventDefault();
    moveAutocomplete(1);
  }else if(event.key==="ArrowUp"&&!list.hidden){
    event.preventDefault();
    moveAutocomplete(-1);
  }else if(event.key==="Enter"&&!list.hidden&&activeAutocompleteIndex>=0){
    event.preventDefault();
    const active=$$(".autocomplete-item",list)[activeAutocompleteIndex];
    chooseAutocomplete(active.dataset.kind,active.dataset.id);
  }
});

document.addEventListener("click",event=>{
  if(!event.target.closest(".search-wrap")) hideAutocomplete();
});

$("#hero-search").addEventListener("submit",event=>{
  event.preventDefault();
  runSearch(searchInput.value);
});

$$(".search-chip").forEach(button=>button.addEventListener("click",()=>{
  searchInput.value=button.dataset.query;
  runSearch(button.dataset.query);
}));

$$(".point").forEach(point=>point.addEventListener("click",()=>openPointDetail(point.dataset.pointId)));

$("#browse-points").addEventListener("click",openPointDirectory);
$("#map-open-detail").addEventListener("click",event=>openPointDetail(event.currentTarget.dataset.pointId));
$("#open-guide").addEventListener("click",openBeginnerGuide);

$("#view-all-concerns").addEventListener("click",event=>{
  const grid=$("#concern-grid");
  const isOpen=grid.classList.toggle("show-all");
  event.currentTarget.textContent=isOpen?"Show fewer concerns ↑":"View all concerns →";
});

$("#clear-results").addEventListener("click",()=>{
  $("#search-results-section").hidden=true;
  $("#search-results").innerHTML="";
  searchInput.value="";
  $("#home").scrollIntoView({behavior:"smooth"});
});

$$(".filter-button").forEach(button=>button.addEventListener("click",()=>{
  activeFilter=button.dataset.filter;
  $$(".filter-button").forEach(item=>item.classList.toggle("active",item===button));
  renderResults();
}));

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

$("#year").textContent=new Date().getFullYear();
observeReveals();
loadData();
