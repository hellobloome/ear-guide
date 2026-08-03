const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

let conditions=[];
let acupoints=[];
let pointMap=new Map();
let conditionMap=new Map();
let activeSuggestion=-1;
let mapSelectedId="shen-men";
let mapZoom=1;
let selectedConditionPoint=new Map();

const mapPositions={
  "shen-men":[61,25],"point-zero":[50,44],"heart":[42,54],"sympathetic":[31,40],
  "kidney":[59,37],"occiput":[34,65],"stomach":[49,50],"spleen":[55,54],
  "brain":[39,69],"endocrine":[48,66],"mouth":[43,58],"cervical-spine":[66,57],
  "shoulder":[70,47],"jaw":[44,77]
};

const anatomicalEarSvg=(extraClass="")=>`
<div class="premium-ear-wrap ${extraClass}" aria-label="Minimal line-art ear illustration">
  <img class="premium-ear-image" src="./images/ear-option-1.webp" alt="Minimal line-art illustration of an ear">
</div>`;

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
function openQuickHelp(){
  $("#quick-help-sheet").hidden=false;
  document.body.classList.add("sheet-open");
  $("#quick-help-button").setAttribute("aria-expanded","true");
}
function closeQuickHelp(){
  $("#quick-help-sheet").hidden=true;
  document.body.classList.remove("sheet-open");
  $("#quick-help-button").setAttribute("aria-expanded","false");
}

function searchBoxMarkup(id="route-search"){
  return `
  <div class="search-box">
    <form class="search-shell" data-search-form>
      <span aria-hidden="true">⌕</span>
      <input id="${id}" data-search-input type="search" placeholder="Try “sleep”, “stress” or “Shen Men”" autocomplete="off">
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
  const journeys=[["☾","Sleep","Wind down and explore a calm bedtime combination.","sleep"],["♡","Stress","Explore points traditionally used in calming routines.","stress"],["⌁","Digestion","Find a simple digestive-wellness combination.","digestion"],["✿","Women's wellness","Explore a menstrual-comfort combination.","menstrual-comfort"],["✦","Energy","Explore a traditional low-energy combination.","low-energy"],["◎","Focus","Find points commonly used in focus routines.","focus"]];
  return `
  <section class="route premium-home">
    <div class="route-hero premium-hero"><div class="container route-grid">
      <div class="hero-copy reveal-item"><p class="eyebrow">Bloomé Ear Acupoint Guide</p><h1>What would you like support with today?</h1><p class="lead">Choose a wellness need or search by name. We’ll show the suggested points directly on the ear.</p>${searchBoxMarkup("home-search")}<div class="hero-trust"><span>◌ Visual point guidance</span><span>✧ Beginner friendly</span></div></div>
      <div class="hero-card premium-hero-card reveal-item">${anatomicalEarSvg("hero-ear")}<div class="hero-card-note">A calmer way to find your points</div></div>
    </div></div>
    <section class="section soft-section need-section"><div class="container"><div class="section-heading centered-heading reveal-item"><p class="eyebrow">Start with a need</p><h2>Choose what feels most relevant.</h2><p>Each guide opens with a focused ear map, so you can see the combination before reading the details.</p></div><div class="need-grid">${journeys.map((j,i)=>`<button class="need-card reveal-item" style="--delay:${i*55}ms" data-open-route="condition" data-open-id="${j[3]}"><span class="need-icon">${j[0]}</span><h3>${j[1]}</h3><p>${j[2]}</p><span class="need-link">View guide <b>→</b></span></button>`).join("")}</div></div></section>
    <section class="section"><div class="container premium-paths"><div class="section-heading reveal-item"><p class="eyebrow">Or explore your way</p><h2>Already know what you're looking for?</h2></div><div class="quick-grid compact-paths"><a class="feature-card reveal-item" href="#/discover"><span class="feature-icon">⌕</span><div><h3>Browse A–Z</h3><p>Search concerns and individual acupoints.</p></div><span>→</span></a><a class="feature-card reveal-item" href="#/map"><span class="feature-icon">◌</span><div><h3>Explore the ear</h3><p>Open the complete interactive reference map.</p></div><span>→</span></a><a class="feature-card reveal-item" href="#/guide"><span class="feature-icon">✧</span><div><h3>First time?</h3><p>Read the simple application guide first.</p></div><span>→</span></a></div></div></section>
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
        <h1>Search by need or point name.</h1>
        <p class="lead">Condition pages now open with an interactive map showing the suggested combination immediately.</p>
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
        <div class="directory-grid" id="directory-grid">${directoryCards(initial)}</div>
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
      <span class="data-type">${kind==="condition"?"Visual concern guide":"Acupoint"}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(copy||"")}</p>
      <div class="meta">${kind==="condition"?`${item.pointIds.length} highlighted points`:escapeHtml(item.category||"")}</div>
    </button>`;
  }).join("");
}

function fullMapView(){
  const first=pointMap.get(mapSelectedId)||acupoints[0];
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <p class="eyebrow">Interactive ear map</p>
        <h1>Explore one point at a time.</h1>
        <p class="lead">The illustration has been refined for a calmer, more anatomical appearance. It remains a simplified educational aid.</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container map-shell">
        <div class="map-canvas">
          <div class="map-stage" id="map-stage">
            ${anatomicalEarSvg()}
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

function combinationRole(index,total){
  if(index===0)return ["Primary","Start here","The anchor point in this Bloomé combination."];
  if(index===total-1 && total>3)return ["Optional support","Add if useful","A supporting point that rounds out the routine."];
  return ["Support",`Step ${index+1}`,"Paired with the primary point as part of the suggested routine."];
}
function conditionInfoMarkup(point,role=["Selected point","",""]){
  return `<div class="role-line"><span class="role-badge">${escapeHtml(role[0])}</span><small>${escapeHtml(role[1])}</small></div><h2 id="condition-point-title">${escapeHtml(point.name)}</h2><p class="role-explainer">${escapeHtml(role[2])}</p><div class="info-section"><div class="info-label"><span>⌖</span>Location</div><p id="condition-point-location">${escapeHtml(point.location)}</p></div><div class="info-section"><div class="info-label"><span>✦</span>Traditional wellness use</div><p id="condition-point-use">${escapeHtml(point.traditionalUse)}</p></div><div class="info-section"><div class="info-label"><span>◌</span>Gentle stimulation</div><p id="condition-point-stimulate">${escapeHtml(point.howToStimulate)}</p></div>`;
}

function conditionView(id){
  const condition=conditionMap.get(id);
  if(!condition)return notFoundView();
  const points=(condition.pointIds||[]).map(pid=>pointMap.get(pid)).filter(Boolean);
  const currentId=selectedConditionPoint.get(id)||points[0]?.id;
  const current=pointMap.get(currentId)||points[0];
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
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Recommended point combination</p>
          <h2>See every suggested point at a glance.</h2>
          <p class="lead">Tap a numbered marker or point name. The explanation updates without leaving this page.</p>
        </div>

        <div class="condition-experience">
          <div class="condition-map-card">
            ${anatomicalEarSvg("compact")}
            ${points.map((point,index)=>{
              const position=mapPositions[point.id]||[50,50];
              return `<button class="condition-point ${point.id===current.id?"active":""}" style="left:${position[0]}%;top:${position[1]}%" data-condition-point="${escapeHtml(point.id)}" data-label="${escapeHtml(point.name)}" aria-label="${index+1}. ${escapeHtml(point.name)}">${index+1}</button>`;
            }).join("")}
          </div>

          <aside class="condition-info-card">
            <div id="condition-info-content">${conditionInfoMarkup(current,combinationRole(Math.max(0,points.findIndex(p=>p.id===current.id)),points.length))}</div>
            <div class="point-tabs">
              ${points.map((point,index)=>`<button class="point-tab ${point.id===current.id?"active":""}" data-condition-point-tab="${escapeHtml(point.id)}"><span>${index+1}. ${escapeHtml(point.name)}</span><small>${combinationRole(index,points.length)[0]}</small></button>`).join("")}
            </div>
            <div class="condition-actions">
              <button class="primary-button" id="open-selected-point" data-point-id="${escapeHtml(current.id)}">Open full point guide</button>
              <a class="secondary-button" href="#/guide">Application guide</a>
            </div>
          </aside>
        </div>

        <div class="notice" style="margin-top:24px">This illustration is a simplified educational guide, not a clinical placement chart. Use only on clean, intact skin and seek professional care for severe, persistent, sudden or unexplained symptoms.</div>
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
          <p class="eyebrow">Related visual guides</p>
          <div class="tag-list">
            ${related.length?related.map(c=>`<button class="tag-button" data-open-route="condition" data-open-id="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>`).join(""):"<p>No related concerns listed yet.</p>"}
          </div>
          <div class="notice" style="margin-top:22px">This page provides general wellness education and does not replace professional medical advice.</div>
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
        <div><h2>Visual guidance before dense explanation.</h2></div>
        <div>
          <p>Bloomé creates approachable self-care tools and educational resources for everyday wellness.</p>
          <p>Condition pages now begin with the ear itself, because customers need to see where the suggested points are before reading deeper details.</p>
          <p>This guide distinguishes traditional auricular uses from medical treatment. It is not designed to diagnose illness or replace professional care.</p>
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
function wireFullMap(){
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
    select(ids[(ids.indexOf(mapSelectedId)+1)%ids.length]);
  });
  function applyZoom(){stage.style.transform=`scale(${mapZoom})`}
  $("#zoom-in").addEventListener("click",()=>{mapZoom=Math.min(1.65,mapZoom+.15);applyZoom()});
  $("#zoom-out").addEventListener("click",()=>{mapZoom=Math.max(.8,mapZoom-.15);applyZoom()});
  $("#zoom-reset").addEventListener("click",()=>{mapZoom=1;applyZoom()});
}
function wireCondition(id){
  const condition=conditionMap.get(id);
  if(!condition)return;
  const points=(condition.pointIds||[]).map(pid=>pointMap.get(pid)).filter(Boolean);
  function select(pointId){
    const point=pointMap.get(pointId);
    if(!point)return;
    selectedConditionPoint.set(id,pointId);
    $$("[data-condition-point]").forEach(button=>button.classList.toggle("active",button.dataset.conditionPoint===pointId));
    $$("[data-condition-point-tab]").forEach(button=>button.classList.toggle("active",button.dataset.conditionPointTab===pointId));
    const idx=points.findIndex(p=>p.id===pointId);
    $("#condition-info-content").innerHTML=conditionInfoMarkup(point,combinationRole(idx,points.length));
    $("#open-selected-point").dataset.pointId=pointId;
  }
  $$("[data-condition-point]").forEach(button=>button.addEventListener("click",()=>select(button.dataset.conditionPoint)));
  $$("[data-condition-point-tab]").forEach(button=>button.addEventListener("click",()=>select(button.dataset.conditionPointTab)));
  $("#open-selected-point")?.addEventListener("click",event=>navigate("point",event.currentTarget.dataset.pointId));
}

function render(){
  const {route,id}=getRoute();
  updateActiveNav(route);
  closeMobileMenu();
  closeQuickHelp();
  const app=$("#app");

  let html;
  if(route==="home")html=homeView();
  else if(route==="discover"){
    const search=id&&id.startsWith("search-")?decodeURIComponent(id.replace(/^search-/,"")):null;
    html=discoverView(search);
  }
  else if(route==="map")html=fullMapView();
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
  wireFullMap();
  if(route==="condition")wireCondition(id);
  requestAnimationFrame(()=>$$('.reveal-item').forEach(el=>el.classList.add('revealed')));
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
$("#quick-help-button").addEventListener("click",openQuickHelp);
$("#quick-help-close").addEventListener("click",closeQuickHelp);
$("#quick-help-backdrop").addEventListener("click",closeQuickHelp);
$$(".quick-help-grid a").forEach(link=>link.addEventListener("click",closeQuickHelp));
window.addEventListener("keydown",event=>{if(event.key==="Escape")closeQuickHelp()});
window.addEventListener("hashchange",render);
loadData();
