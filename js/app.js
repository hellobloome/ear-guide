const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

let conditions=[];
let acupoints=[];
let pointMap=new Map();
let conditionMap=new Map();
let activeSuggestion=-1;
let mapSelectedId="shen-men";
let mapZoom=1;

const mapPositions={
  "shen-men":[62,26],"point-zero":[51,46],"heart":[42,55],"sympathetic":[32,42],
  "kidney":[59,38],"occiput":[34,66],"stomach":[49,51],"spleen":[55,55],
  "brain":[39,70],"endocrine":[48,67],"mouth":[43,59],"cervical-spine":[66,58],
  "shoulder":[69,48],"jaw":[44,78]
};

const earSvg=`
<svg class="map-ear" viewBox="0 0 360 470" aria-label="Simplified interactive ear illustration">
  <path d="M196 38c82 0 128 67 116 148-10 65-54 87-72 140-13 40-7 77-50 96-38 17-89-3-95-43-4-29 17-44 28-68 15-34-5-64-24-91-34-48-24-109 12-148 23-24 51-34 85-34Z"/>
  <path d="M198 97c42 0 68 35 61 76-6 35-31 49-50 73-23 28-10 70-38 85-20 11-46-2-46-25 0-19 15-29 21-46 10-25-11-46-15-68-8-49 19-95 67-95Z"/>
  <path d="M182 182c27-19 61 8 49 38-9 21-37 21-50 37-10 12-10 29-5 43"/>
</svg>`;

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}
function normalize(value=""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}
function searchableText(item){
  return normalize([item.name,item.category,item.summary,item.location,item.traditionalUse,...(item.aliases||[]),...(item.keywords||[])].filter(Boolean).join(" "));
}
function score(item,query){
  const q=normalize(query);
  if(!q)return 0;
  const name=normalize(item.name);
  const aliases=(item.aliases||[]).map(normalize);
  const haystack=searchableText(item);
  if(name===q)return 100;
  if(aliases.includes(q))return 94;
  if(name.startsWith(q))return 82;
  if(aliases.some(a=>a.startsWith(q)))return 74;
  if(haystack.includes(q))return 45;
  return 0;
}
function matches(query,limit=30){
  return [
    ...conditions.map(item=>({kind:"condition",item,score:score(item,query)})),
    ...acupoints.map(item=>({kind:"point",item,score:score(item,query)}))
  ].filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.item.name.localeCompare(b.item.name)).slice(0,limit);
}

const toast=$("#toast");
let toastTimer;
function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}

function getRoute(){
  const raw=(location.hash||"#/home").replace(/^#\//,"");
  const [route,id]=raw.split("/");
  return {route:route||"home",id:id||null};
}
function navigate(route,id=null){
  location.hash=id?`#/${route}/${id}`:`#/${route}`;
}
function updateActiveNav(route){
  const activeBase=["condition","point"].includes(route)?"discover":route;
  $$("[data-nav-route]").forEach(link=>link.classList.toggle("active",link.dataset.navRoute===activeBase));
}
function closeMobileMenu(){
  $("#mobile-menu").classList.remove("open");
  $("#menu-button").setAttribute("aria-expanded","false");
}

function searchBoxMarkup(id="route-search"){
  return `
  <div class="search-box">
    <form class="search-shell" data-search-form>
      <span aria-hidden="true">⌕</span>
      <input id="${id}" data-search-input type="search" placeholder="Try “stress”, “sleep” or “Shen Men”" autocomplete="off">
      <button type="submit">Search</button>
    </form>
    <div class="suggestions" data-suggestions hidden></div>
  </div>`;
}
function suggestionMarkup(result,index){
  const summary=result.kind==="condition"?result.item.summary:result.item.category;
  return `
  <button class="suggestion" data-suggestion-index="${index}" data-kind="${result.kind}" data-id="${escapeHtml(result.item.id)}">
    <span class="suggestion-icon">${result.kind==="condition"?"♡":"◌"}</span>
    <span><strong>${escapeHtml(result.item.name)}</strong><small>${escapeHtml(summary||"")}</small></span>
    <span class="suggestion-kind">${result.kind==="condition"?"Concern":"Point"}</span>
  </button>`;
}
function wireSearch(scope=document){
  const form=$("[data-search-form]",scope);
  if(!form)return;
  const input=$("[data-search-input]",scope);
  const suggestions=$("[data-suggestions]",scope);

  function hide(){suggestions.hidden=true;suggestions.innerHTML="";activeSuggestion=-1}
  function show(){
    const results=matches(input.value,7);
    if(!input.value.trim()||!results.length){hide();return}
    activeSuggestion=-1;
    suggestions.innerHTML=results.map(suggestionMarkup).join("");
    suggestions.hidden=false;
    $$("[data-kind]",suggestions).forEach(button=>button.addEventListener("mousedown",event=>{
      event.preventDefault();
      navigate(button.dataset.kind,button.dataset.id);
      hide();
    }));
  }
  input.addEventListener("input",show);
  input.addEventListener("keydown",event=>{
    const items=$$("[data-suggestion-index]",suggestions);
    if(!items.length)return;
    if(event.key==="ArrowDown"){event.preventDefault();activeSuggestion=(activeSuggestion+1)%items.length}
    else if(event.key==="ArrowUp"){event.preventDefault();activeSuggestion=(activeSuggestion-1+items.length)%items.length}
    else if(event.key==="Enter"&&activeSuggestion>=0){
      event.preventDefault();
      const item=items[activeSuggestion];
      navigate(item.dataset.kind,item.dataset.id);
      hide();
      return;
    }else return;
    items.forEach((item,index)=>item.classList.toggle("active",index===activeSuggestion));
  });
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const results=matches(input.value,1);
    if(!input.value.trim())return showToast("Type a concern or acupoint first.");
    if(results.length)navigate(results[0].kind,results[0].item.id);
    else navigate("discover",`search-${encodeURIComponent(input.value.trim())}`);
  });
  document.addEventListener("click",event=>{
    if(!event.target.closest(".search-box"))hide();
  },{once:true});
}

function homeView(){
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container route-grid">
        <div>
          <p class="eyebrow">Bloomé Ear Acupoint Guide</p>
          <h1>Find the right ear points with calm, clear guidance.</h1>
          <p class="lead">Search common wellness concerns, browse acupoints, and explore a simplified interactive ear map.</p>
          ${searchBoxMarkup("home-search")}
        </div>
        <div class="hero-card">
          ${earSvg}
          <div class="hero-card-note">A calmer way to explore ear-seed guidance</div>
        </div>
      </div>
    </div>

    <section class="section soft-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Choose your path</p>
          <h2>What would you like to explore?</h2>
        </div>
        <div class="quick-grid">
          <a class="feature-card" href="#/discover"><span class="feature-icon">⌕</span><div><h3>Discover</h3><p>Browse concerns and acupoints in one searchable directory.</p></div><span>→</span></a>
          <a class="feature-card" href="#/map"><span class="feature-icon">◌</span><div><h3>Interactive ear map</h3><p>Tap markers and open the matching point guide.</p></div><span>→</span></a>
          <a class="feature-card" href="#/guide"><span class="feature-icon">✧</span><div><h3>Beginner guide</h3><p>Learn a simple, skin-conscious application routine.</p></div><span>→</span></a>
          <a class="feature-card" href="#/about"><span class="feature-icon">♡</span><div><h3>About Bloomé</h3><p>Learn what the guide is designed to do, and what it is not.</p></div><span>→</span></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Featured guidance</p>
          <h2>Popular places to begin.</h2>
        </div>
        <div class="card-grid">
          ${conditions.filter(c=>c.featured).slice(0,4).map(condition=>`
            <button class="data-card" data-open-route="condition" data-open-id="${escapeHtml(condition.id)}">
              <span class="data-type">Concern</span>
              <h3>${escapeHtml(condition.name)}</h3>
              <p>${escapeHtml(condition.summary)}</p>
              <div class="meta">${condition.pointIds.length} suggested points</div>
            </button>`).join("")}
        </div>
      </div>
    </section>
  </section>`;
}

function discoverView(searchTerm=null){
  const allItems=[
    ...conditions.map(item=>({kind:"condition",item})),
    ...acupoints.map(item=>({kind:"point",item}))
  ];
  const initial=searchTerm?matches(searchTerm,100):allItems;

  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">Discover</p>
        <h1>Browse concerns and acupoints.</h1>
        <p class="lead">Use natural words such as “can’t sleep”, “TMJ”, “bloating” or a point name.</p>
        ${searchBoxMarkup("discover-search")}
      </div>
    </div>
    <section class="section soft-section">
      <div class="container">
        <div class="filter-row">
          <button class="filter-chip active" data-directory-filter="all">All</button>
          <button class="filter-chip" data-directory-filter="condition">Concerns</button>
          <button class="filter-chip" data-directory-filter="point">Acupoints</button>
        </div>
        <div class="directory-grid" id="directory-grid">
          ${directoryCards(initial)}
        </div>
      </div>
    </section>
  </section>`;
}
function directoryCards(items){
  if(!items.length)return `<div class="empty-state">No matches found. Try a broader term.</div>`;
  return items.map(entry=>{
    const kind=entry.kind;
    const item=entry.item;
    const copy=kind==="condition"?item.summary:item.traditionalUse;
    return `
    <button class="data-card" data-kind-card="${kind}" data-open-route="${kind}" data-open-id="${escapeHtml(item.id)}">
      <span class="data-type">${kind==="condition"?"Concern":"Acupoint"}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(copy||"")}</p>
      <div class="meta">${escapeHtml(item.category||"")}</div>
    </button>`;
  }).join("");
}

function mapView(){
  const first=pointMap.get(mapSelectedId)||acupoints[0];
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">Interactive ear map</p>
        <h1>Tap a marker to explore.</h1>
        <p class="lead">This simplified illustration is a navigation aid, not a clinical placement chart.</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container map-shell">
        <div class="map-canvas">
          <div class="map-stage" id="map-stage">
            ${earSvg}
            ${acupoints.filter(p=>mapPositions[p.id]).map(point=>{
              const [left,top]=mapPositions[point.id];
              return `<button class="map-marker ${point.id===mapSelectedId?"active":""}" style="left:${left}%;top:${top}%" data-map-id="${escapeHtml(point.id)}" data-label="${escapeHtml(point.name)}" aria-label="${escapeHtml(point.name)}"></button>`;
            }).join("")}
          </div>
          <div class="zoom-controls">
            <button id="zoom-in" aria-label="Zoom in">+</button>
            <button id="zoom-out" aria-label="Zoom out">−</button>
            <button id="zoom-reset" aria-label="Reset zoom">↺</button>
          </div>
        </div>
        <aside class="map-panel">
          <p class="eyebrow">Selected point</p>
          <h2 id="map-title">${escapeHtml(first.name)}</h2>
          <p id="map-copy">${escapeHtml(first.traditionalUse)}</p>
          <div class="map-actions">
            <button class="primary-button" id="map-open-point" data-point-id="${escapeHtml(first.id)}">Open full point guide</button>
            <button class="secondary-button" id="map-next-point">Next marker</button>
          </div>
        </aside>
      </div>
    </section>
  </section>`;
}

function pointView(id){
  const point=pointMap.get(id);
  if(!point)return notFoundView();
  const related=(point.relatedConditionIds||[]).map(cid=>conditionMap.get(cid)).filter(Boolean);
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(point.category||"Acupoint")}</p>
        <h1>${escapeHtml(point.name)}</h1>
        <p class="lead">${escapeHtml(point.traditionalUse)}</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container detail-layout">
        <article class="detail-card">
          <section><h3>General location</h3><p>${escapeHtml(point.location)}</p></section>
          <section><h3>Traditional wellness use</h3><p>${escapeHtml(point.traditionalUse)}</p></section>
          <section><h3>Gentle stimulation</h3><p>${escapeHtml(point.howToStimulate)}</p></section>
          <section><h3>Caution</h3><p>${escapeHtml(point.caution||"Use only on clean, intact skin and remove if irritation occurs.")}</p></section>
        </article>
        <aside class="side-card">
          <p class="eyebrow">Related concerns</p>
          <div class="tag-list">
            ${related.length?related.map(c=>`<button class="tag-button" data-open-route="condition" data-open-id="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>`).join(""):"<p>No related concerns listed yet.</p>"}
          </div>
          <div class="notice" style="margin-top:22px">This page provides general wellness education and does not replace professional medical advice.</div>
        </aside>
      </div>
    </section>
  </section>`;
}

function conditionView(id){
  const condition=conditionMap.get(id);
  if(!condition)return notFoundView();
  const points=(condition.pointIds||[]).map(pid=>pointMap.get(pid)).filter(Boolean);
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(condition.category||"Concern")}</p>
        <h1>${escapeHtml(condition.name)}</h1>
        <p class="lead">${escapeHtml(condition.summary)}</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container detail-layout">
        <article class="detail-card">
          <section>
            <h3>Suggested point combination</h3>
            <div class="tag-list">
              ${points.map(p=>`<button class="tag-button" data-open-route="point" data-open-id="${escapeHtml(p.id)}">${escapeHtml(p.name)}</button>`).join("")}
            </div>
          </section>
          <section><h3>How to use this guide</h3><p>Begin with a small number of points, follow the beginner instructions, and stop if the skin becomes irritated or the ear feels significantly uncomfortable.</p></section>
          <section><h3>When to seek help</h3><p>Persistent, severe, sudden or unexplained symptoms should be assessed by a qualified healthcare professional.</p></section>
        </article>
        <aside class="side-card">
          <p class="eyebrow">Quick actions</p>
          <div class="tag-list">
            <a class="tag-button" href="#/map">Open ear map</a>
            <a class="tag-button" href="#/guide">Read beginner guide</a>
          </div>
          <div class="notice" style="margin-top:22px">Bloomé Guide is for general wellness education only.</div>
        </aside>
      </div>
    </section>
  </section>`;
}

function guideView(){
  const steps=[
    ["Clean","Wash your hands. Clean and thoroughly dry the outer ear before application."],
    ["Choose","Start with a small number of points so the routine stays simple and comfortable."],
    ["Apply","Use clean tweezers and place each seed on intact skin, outside the ear canal."],
    ["Stimulate","Press gently for a few seconds. Mild pressure is enough. Sharp pain is not the goal."],
    ["Check","Inspect the skin daily and remove seeds if irritation, swelling or significant discomfort appears."],
    ["Rest","Give the skin regular breaks between applications."]
  ];
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">Beginner guide</p>
        <h1>A simple, skin-conscious routine.</h1>
        <p class="lead">The gentlest useful routine usually beats the most complicated one.</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container guide-grid">
        ${steps.map((s,i)=>`<article class="guide-step"><span>${i+1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join("")}
      </div>
      <div class="container" style="margin-top:26px"><div class="notice">Remove the seeds if irritation, swelling, dizziness or significant discomfort occurs. Keep all seeds outside the ear canal.</div></div>
    </section>
  </section>`;
}

function aboutView(){
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">About Bloomé</p>
        <h1>Wellness guidance, made easier to understand.</h1>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container about-panel">
        <div><h2>Calm information, not loud promises.</h2></div>
        <div>
          <p>Bloomé creates approachable self-care tools and educational resources for everyday wellness.</p>
          <p>This guide distinguishes traditional auricular uses from medical treatment. It is not designed to diagnose illness or replace professional care.</p>
          <p>As the guide grows, the content will remain organized around clarity, cautious language and ease of use.</p>
        </div>
      </div>
    </section>
  </section>`;
}

function notFoundView(){
  return `<section class="route"><div class="route-hero"><div class="container"><p class="eyebrow">Not found</p><h1>This page wandered off.</h1><p class="lead">Return to the guide and continue exploring.</p><a class="primary-button" href="#/home">Back home</a></div></div></section>`;
}

function wireCommonActions(){
  $$("[data-open-route]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.openRoute,button.dataset.openId)));
  wireSearch($("#app"));
}

function wireDiscover(){
  const grid=$("#directory-grid");
  if(!grid)return;
  $$("[data-directory-filter]").forEach(button=>button.addEventListener("click",()=>{
    const filter=button.dataset.directoryFilter;
    $$("[data-directory-filter]").forEach(b=>b.classList.toggle("active",b===button));
    const items=filter==="all"
      ? [...conditions.map(item=>({kind:"condition",item})),...acupoints.map(item=>({kind:"point",item}))]
      : filter==="condition"
        ? conditions.map(item=>({kind:"condition",item}))
        : acupoints.map(item=>({kind:"point",item}));
    grid.innerHTML=directoryCards(items);
    wireCommonActions();
  }));
}

function wireMap(){
  const stage=$("#map-stage");
  if(!stage)return;
  function select(id){
    mapSelectedId=id;
    const point=pointMap.get(id);
    $$(".map-marker").forEach(marker=>marker.classList.toggle("active",marker.dataset.mapId===id));
    $("#map-title").textContent=point.name;
    $("#map-copy").textContent=point.traditionalUse;
    $("#map-open-point").dataset.pointId=id;
  }
  $$("[data-map-id]").forEach(marker=>marker.addEventListener("click",()=>select(marker.dataset.mapId)));
  $("#map-open-point").addEventListener("click",event=>navigate("point",event.currentTarget.dataset.pointId));
  $("#map-next-point").addEventListener("click",()=>{
    const ids=acupoints.filter(p=>mapPositions[p.id]).map(p=>p.id);
    const next=ids[(ids.indexOf(mapSelectedId)+1)%ids.length];
    select(next);
  });
  function applyZoom(){stage.style.transform=`scale(${mapZoom})`}
  $("#zoom-in").addEventListener("click",()=>{mapZoom=Math.min(1.65,mapZoom+.15);applyZoom()});
  $("#zoom-out").addEventListener("click",()=>{mapZoom=Math.max(.8,mapZoom-.15);applyZoom()});
  $("#zoom-reset").addEventListener("click",()=>{mapZoom=1;applyZoom()});
}

function render(){
  const {route,id}=getRoute();
  updateActiveNav(route);
  closeMobileMenu();
  const app=$("#app");

  let html;
  if(route==="home")html=homeView();
  else if(route==="discover"){
    const search=id&&id.startsWith("search-")?decodeURIComponent(id.replace(/^search-/,"")):null;
    html=discoverView(search);
  }
  else if(route==="map")html=mapView();
  else if(route==="point")html=pointView(id);
  else if(route==="condition")html=conditionView(id);
  else if(route==="guide")html=guideView();
  else if(route==="about")html=aboutView();
  else html=notFoundView();

  app.innerHTML=html;
  app.focus({preventScroll:true});
  window.scrollTo({top:0,behavior:"instant"});
  wireCommonActions();
  wireDiscover();
  wireMap();
}

async function loadData(){
  try{
    const [conditionResponse,pointResponse]=await Promise.all([
      fetch("./data/conditions.json"),
      fetch("./data/acupoints.json")
    ]);
    if(!conditionResponse.ok||!pointResponse.ok)throw new Error("Data load failed");
    conditions=await conditionResponse.json();
    acupoints=await pointResponse.json();
    conditionMap=new Map(conditions.map(item=>[item.id,item]));
    pointMap=new Map(acupoints.map(item=>[item.id,item]));
    render();
  }catch(error){
    console.error(error);
    $("#app").innerHTML=`<div class="route-loading"><p>The guide database could not load. Refresh the page.</p></div>`;
  }
}

$("#menu-button").addEventListener("click",()=>{
  const open=$("#mobile-menu").classList.toggle("open");
  $("#menu-button").setAttribute("aria-expanded",String(open));
});
$$("#mobile-menu a").forEach(link=>link.addEventListener("click",closeMobileMenu));
window.addEventListener("hashchange",render);
loadData();
