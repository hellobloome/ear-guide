const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];

let conditions=[];
let acupoints=[];
let sourceConditions=[];
let sourceAcupoints=[];
let localeData={};
let currentLocale=localStorage.getItem("bloome-locale")==="ms"?"ms":"en";
let pointMap=new Map();
let conditionMap=new Map();
let activeSuggestion=-1;
let mapSelectedId="shen-men";
let mapZoom=1;
let selectedConditionPoint=new Map();
let applicationProgress=new Map();

const mapPositions={
  "shen-men":[61,25],
  "point-zero":[50,44],
  "heart":[42,54],
  "sympathetic":[31,40],
  "kidney":[59,37],
  "occiput":[34,65],
  "stomach":[49,50],
  "spleen":[55,54],
  "brain":[39,69],
  "endocrine":[48,66],
  "mouth":[43,58],
  "cervical-spine":[66,57],
  "shoulder":[70,47],
  "jaw":[44,77],
  "liver":[57,44],
  "lung":[47,56],
  "large-intestine":[43,39],
  "small-intestine":[49,40],
  "bladder":[54,35],
  "gallbladder":[58,32],
  "pancreas":[61,34],
  "adrenal":[33,58],
  "subcortex":[37,68],
  "thalamus":[41,67],
  "ear-apex":[50,13],
  "eye":[38,80],
  "inner-ear":[48,82],
  "thoracic-spine":[66,51],
  "lumbar-spine":[64,44],
  "hip":[62,38]
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

function localeRecord(type,id){
  return localeData?.[type]?.[id]||null;
}

function mergeLocaleItem(item,type){
  if(currentLocale!=="ms")return {...item};
  const translated=localeRecord(type,item.id);
  if(!translated)return {...item};

  return {
    ...item,
    ...translated,
    aliases:[...(item.aliases||[]),...(translated.aliases||[])],
    keywords:[...(item.keywords||[]),...(translated.keywords||[])]
  };
}

function rebuildLocalizedData(){
  conditions=sourceConditions.map(item=>mergeLocaleItem(item,"conditions"));
  acupoints=sourceAcupoints.map(item=>mergeLocaleItem(item,"points"));
  conditionMap=new Map(conditions.map(item=>[item.id,item]));
  pointMap=new Map(acupoints.map(item=>[item.id,item]));
}

function uiText(english){
  if(currentLocale!=="ms")return english;
  return localeData?.ui?.ms?.exact?.[english]||english;
}

function pointCountText(count,{suggested=false}={}){
  if(currentLocale==="ms")return suggested?`${count} titik dicadangkan`:`${count} titik`;
  return suggested?`${count} suggested point${count===1?"":"s"}`:`${count} point${count===1?"":"s"}`;
}

function translateUi(root=document){
  document.documentElement.lang=currentLocale==="ms"?"ms":"en";

  const exact=localeData?.ui?.ms?.exact||{};
  const reverseExact={};
  Object.entries(exact).forEach(([english,malay])=>{
    if(!(malay in reverseExact))reverseExact[malay]=english;
  });

  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);

  nodes.forEach(node=>{
    const raw=node.nodeValue;
    const trimmed=raw.trim();
    if(!trimmed)return;

    const replacement=currentLocale==="ms"
      ? exact[trimmed]
      : reverseExact[trimmed];

    if(replacement)node.nodeValue=raw.replace(trimmed,replacement);
  });

  const placeholders=localeData?.ui?.ms?.placeholders||{};
  const reversePlaceholders={};
  Object.entries(placeholders).forEach(([english,malay])=>{
    if(!(malay in reversePlaceholders))reversePlaceholders[malay]=english;
  });

  $$("[placeholder]",root).forEach(el=>{
    const current=el.getAttribute("placeholder");
    const replacement=currentLocale==="ms"
      ? placeholders[current]
      : reversePlaceholders[current];

    if(replacement)el.setAttribute("placeholder",replacement);
  });

  updateLanguageToggle();
}

function updateLanguageToggle(){
  const toggle=$("#language-toggle");
  if(!toggle)return;
  $$("[data-locale-option]",toggle).forEach(option=>{
    option.classList.toggle("active",option.dataset.localeOption===currentLocale);
  });
  toggle.setAttribute("aria-label",currentLocale==="ms"?"Tukar ke bahasa Inggeris":"Switch to Bahasa Melayu");
}

function setLocale(locale){
  currentLocale=locale==="ms"?"ms":"en";
  localStorage.setItem("bloome-locale",currentLocale);
  selectedConditionPoint.clear();
  rebuildLocalizedData();
  render();
}

function searchableText(item){
  const extra=localeRecord("points",item.id)||localeRecord("conditions",item.id)||{};
  return normalize([
    item.name,item.category,item.summary,item.location,item.traditionalUse,
    ...(item.aliases||[]),...(item.keywords||[]),
    extra.name,extra.category,extra.summary,extra.location,extra.traditionalUse,
    ...(extra.aliases||[]),...(extra.keywords||[])
  ].filter(Boolean).join(" "));
}

function pointIsMapped(point){
  return Boolean(point && (mapPositions[point.id] || point.mapReady===true));
}

function pointStatusLabel(point){
  return pointIsMapped(point) ? "Mapped acupoint" : "Reference acupoint";
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
  const activeBase=["condition","point"].includes(route)?"discover":route==="apply"?"guide":route;
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
  const item=result.item;
  if(result.kind==="condition"){
    const points=(item.pointIds||[]).map(id=>pointMap.get(id)).filter(Boolean);
    return `
    <button class="suggestion suggestion-condition" data-suggestion-index="${index}" data-kind="condition" data-id="${escapeHtml(item.id)}">
      <span class="suggestion-icon">♡</span>
      <span class="suggestion-content">
        <span class="suggestion-topline">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="suggestion-kind">Wellness guide</span>
        </span>
        <small>${escapeHtml(item.summary||"")}</small>
        <span class="suggestion-point-preview">
          ${points.slice(0,4).map(point=>`<span>${escapeHtml(point.name)}</span>`).join("")}
        </span>
        <span class="suggestion-footer">
          <b>${pointCountText(points.length,{suggested:true})}</b>
          <em>Open guide →</em>
        </span>
      </span>
    </button>`;
  }

  const mapped=pointIsMapped(item);
  return `
  <button class="suggestion suggestion-point-result ${mapped?"is-mapped":"is-reference"}" data-suggestion-index="${index}" data-kind="point" data-id="${escapeHtml(item.id)}">
    <span class="suggestion-icon">${mapped?"◉":"◌"}</span>
    <span class="suggestion-content">
      <span class="suggestion-topline">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="suggestion-kind">${mapped?"Mapped point":"Reference point"}</span>
      </span>
      <small>${escapeHtml(item.traditionalUse||item.category||"")}</small>
      <span class="suggestion-footer">
        <b>${escapeHtml(item.category||"Ear point")}</b>
        <em>${mapped?"View point →":"Open reference →"}</em>
      </span>
    </span>
  </button>`;
}

function searchEmptyMarkup(query){
  const quick=[
    ["Sleep","sleep"],
    ["Stress","stress"],
    ["Focus","focus"],
    ["Digestion","digestion"],
    ["Energy","low-energy"]
  ];
  return `
    <div class="search-empty">
      <strong>We couldn’t find “${escapeHtml(query)}” yet.</strong>
      <p>Try one of these common guides instead:</p>
      <div class="search-empty-chips">
        ${quick.map(([label,id])=>`<button type="button" data-empty-condition="${id}">${label}</button>`).join("")}
      </div>
    </div>`;
}
function wireSearch(scope=document){
  const form=$("[data-search-form]",scope);
  if(!form)return;
  const input=$("[data-search-input]",scope);
  const suggestions=$("[data-suggestions]",scope);

  function hide(){suggestions.hidden=true;suggestions.innerHTML="";activeSuggestion=-1}
  function show(){
    const query=input.value.trim();
    if(!query){hide();return}

    const results=matches(query,6);
    activeSuggestion=-1;

    if(!results.length){
      suggestions.innerHTML=searchEmptyMarkup(query);
      suggestions.hidden=false;
      translateUi(suggestions);
      $$("[data-empty-condition]",suggestions).forEach(button=>button.addEventListener("mousedown",event=>{
        event.preventDefault();
        navigate("condition",button.dataset.emptyCondition);
        hide();
      }));
      return;
    }

    suggestions.innerHTML=results.map(suggestionMarkup).join("");
    suggestions.hidden=false;
    translateUi(suggestions);
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
  if(!items.length)return `<div class="empty-state search-directory-empty"><strong>We couldn’t find that yet.</strong><p>Try Sleep, Stress, Focus, Digestion or Energy.</p><div class="empty-state-actions"><button data-open-route="condition" data-open-id="sleep">Sleep</button><button data-open-route="condition" data-open-id="stress">Stress</button><button data-open-route="condition" data-open-id="focus">Focus</button></div></div>`;
  return items.map(entry=>{
    const kind=entry.kind;
    const item=entry.item;
    const copy=kind==="condition"?item.summary:item.traditionalUse;
    const mapped=kind==="point" ? pointIsMapped(item) : false;
    return `
    <button class="data-card ${kind==="point"?(mapped?"mapped-point-card":"reference-point-card"):""}" data-kind-card="${kind}" data-open-route="${kind}" data-open-id="${escapeHtml(item.id)}">
      <span class="data-type">${kind==="condition"?"Visual concern guide":mapped?"Mapped acupoint":"Reference acupoint"}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(copy||"")}</p>
      <div class="meta">${kind==="condition"?pointCountText(item.pointIds.length,{suggested:true}):`${escapeHtml(item.category||"")} · ${mapped?uiText("On map"):uiText("Reference only")}`}</div>
    </button>`;
  }).join("");
}

function mapRelatedMarkup(point){
  const related=(point.relatedConditionIds||[])
    .map(id=>conditionMap.get(id))
    .filter(Boolean)
    .slice(0,6);

  if(!related.length)return `<p class="map-related-empty">No related guides listed yet.</p>`;

  return related.map(condition=>`
    <button class="tag-button map-related-link" data-map-condition-id="${escapeHtml(condition.id)}">
      ${escapeHtml(condition.name)}
    </button>`).join("");
}

function fullMapView(){
  const mappedPoints=acupoints.filter(point=>pointIsMapped(point));
  const allPoints=acupoints.slice().sort((a,b)=>a.name.localeCompare(b.name));
  const first=pointMap.get(mapSelectedId)||mappedPoints[0]||allPoints[0];
  const categories=[...new Set(allPoints.map(point=>point.category).filter(Boolean))].sort();
  const letters=[...new Set(allPoints.map(point=>point.name.charAt(0).toUpperCase()))].sort();

  return `
  <section class="route map-explorer-route">
    <div class="route-hero map-explorer-hero">
      <div class="container">
        <p class="eyebrow">Full Ear Map Explorer</p>
        <h1>Explore the ear, one point at a time.</h1>
        <p class="lead">Search the full Bloomé point library. Every point in the current library is now plotted on the simplified interactive ear.</p>
      </div>
    </div>

    <section class="section soft-section map-explorer-section">
      <div class="container">
        <div class="map-library-summary complete-map-summary">
          <div><strong>${mappedPoints.length}</strong><span>Complete visual library</span></div>
          <p>All points in Bloomé’s current library are now plotted on the simplified educational ear map.</p>
        </div>

        <div class="map-explorer-toolbar">
          <label class="map-point-search">
            <span aria-hidden="true">⌕</span>
            <input id="map-point-search" type="search" placeholder="Search the point library, e.g. Shen Men or Liver" autocomplete="off">
            <button id="map-search-clear" type="button" aria-label="Clear point search" hidden>×</button>
          </label>

          <div class="map-category-row" aria-label="Filter ear points by type">
            <button class="map-filter-chip active" data-map-category="all">All points</button>
            ${categories.map(category=>`
              <button class="map-filter-chip" data-map-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
            `).join("")}
          </div>
        </div>

        <div class="map-explorer-grid">
          <div class="map-canvas map-explorer-canvas">
            <div class="map-stage map-explorer-stage" id="map-stage">
              ${anatomicalEarSvg()}
              ${mappedPoints.map(point=>{
                const [left,top]=mapPositions[point.id];
                return `<button class="map-marker ${point.id===first.id?"active":""}" style="left:${left}%;top:${top}%" data-map-id="${escapeHtml(point.id)}" data-label="${escapeHtml(point.name)}" aria-label="${escapeHtml(point.name)}"></button>`;
              }).join("")}
            </div>

            <div class="zoom-controls">
              <button id="zoom-in" aria-label="Zoom in">+</button>
              <button id="zoom-out" aria-label="Zoom out">−</button>
              <button id="zoom-reset" aria-label="Reset zoom">↺</button>
            </div>
          </div>

          <aside class="map-panel map-explorer-panel">
            <div class="map-selected-heading">
              <div>
                <p class="eyebrow">Selected point</p>
                <h2 id="map-title">${escapeHtml(first.name)}</h2>
              </div>
              <div class="map-status-stack">
                <span class="map-point-category" id="map-category">${escapeHtml(first.category||"Ear point")}</span>
                <span class="map-plot-status ${pointIsMapped(first)?"mapped":"reference"}" id="map-plot-status">${pointIsMapped(first)?"On map":"Reference only"}</span>
              </div>
            </div>

            <div class="map-reference-note" id="map-reference-note" ${pointIsMapped(first)?"hidden":""}>
              This point is in Bloomé’s reference library but has not yet been placed on the simplified interactive ear.
            </div>

            <div class="map-info-block">
              <div class="info-label"><span>⌖</span>Location</div>
              <p id="map-location">${escapeHtml(first.location||"")}</p>
            </div>

            <div class="map-info-block">
              <div class="info-label"><span>✦</span>Traditional wellness use</div>
              <p id="map-copy">${escapeHtml(first.traditionalUse||"")}</p>
            </div>

            <div class="map-info-block">
              <div class="info-label"><span>◌</span>Gentle stimulation</div>
              <p id="map-stimulate">${escapeHtml(first.howToStimulate||"")}</p>
            </div>

            <div class="map-related-section">
              <p class="map-mini-label">Related guides</p>
              <div class="tag-list" id="map-related">${mapRelatedMarkup(first)}</div>
            </div>

            <div class="map-actions">
              <button class="primary-button" id="map-open-point" data-point-id="${escapeHtml(first.id)}">Open full point guide</button>
              <button class="secondary-button" id="map-next-point">Next visible point</button>
            </div>
          </aside>
        </div>

        <section class="map-directory-section">
          <div class="map-directory-heading">
            <div>
              <p class="eyebrow">Browse A–Z</p>
              <h2>Bloomé point library.</h2>
            </div>
            <span id="map-result-count">${pointCountText(allPoints.length)}</span>
          </div>

          <div class="map-alpha-row" aria-label="Browse points alphabetically">
            <button class="map-alpha-chip active" data-map-letter="all">All</button>
            ${letters.map(letter=>`<button class="map-alpha-chip" data-map-letter="${letter}">${letter}</button>`).join("")}
          </div>

          <div class="map-point-directory" id="map-point-directory">
            ${allPoints.map(point=>{
              const mapped=pointIsMapped(point);
              return `
                <button class="map-point-card ${point.id===first.id?"active":""} ${mapped?"mapped-library-point":"reference-library-point"}" data-map-list-id="${escapeHtml(point.id)}">
                  <span class="map-point-card-icon">${mapped?"◉":"◌"}</span>
                  <span>
                    <strong>${escapeHtml(point.name)}</strong>
                    <small>${escapeHtml(point.category||"Ear point")} · ${mapped?uiText("Mapped"):uiText("Reference")}</small>
                  </span>
                  <span class="map-point-card-arrow">→</span>
                </button>`;
            }).join("")}
          </div>

          <div class="map-directory-empty" id="map-directory-empty" hidden>
            <strong>No library points match that search.</strong>
            <p>Try a different point name or choose “All points”.</p>
          </div>
        </section>
      </div>
    </section>
  </section>`;
}


function combinationRole(index,total,condition=null){
  const explicit=condition?.pointRoles?.[index];
  const fallback=index===0?"primary":(index===total-1&&total>3?"optional":"support");
  const role=explicit||fallback;

  if(currentLocale==="ms"){
    if(role==="primary")return ["Utama","Mula di sini","Titik utama dalam gabungan Bloomé ini."];
    if(role==="optional")return ["Sokongan pilihan","Tambah jika perlu","Tambahan ringan. Anda boleh abaikannya jika mahu rutin yang lebih ringkas."];
    return ["Sokongan",`Langkah ${index+1}`,"Melengkapi titik utama sebagai sebahagian daripada rutin yang dicadangkan."];
  }

  if(role==="primary")return ["Primary","Start here","The anchor point in this Bloomé combination."];
  if(role==="optional")return ["Optional support","Add if useful","A lighter add-on. Skip it if you prefer a shorter routine."];
  return ["Support",`Step ${index+1}`,"Builds on the primary point as part of the suggested routine."];
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
        ${condition.useWhen?`<div class="condition-use-when"><strong>Best for</strong><span>${escapeHtml(condition.useWhen)}</span></div>`:""}
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
            <div id="condition-info-content">${conditionInfoMarkup(current,combinationRole(Math.max(0,points.findIndex(p=>p.id===current.id)),points.length,condition))}</div>
            <div class="point-tabs">
              ${points.map((point,index)=>`<button class="point-tab ${point.id===current.id?"active":""}" data-condition-point-tab="${escapeHtml(point.id)}"><span>${index+1}. ${escapeHtml(point.name)}</span><small>${combinationRole(index,points.length,condition)[0]}</small></button>`).join("")}
            </div>
            <div class="condition-actions condition-actions-guided">
              <button class="primary-button" data-start-apply="${escapeHtml(condition.id)}">Start application</button>
              <button class="secondary-button" id="open-selected-point" data-point-id="${escapeHtml(current.id)}">Open full point guide</button>
              <a class="text-button condition-guide-link" href="#/guide">Application guide</a>
            </div>
          </aside>
        </div>

        <div class="notice" style="margin-top:24px">This illustration is a simplified educational guide, not a clinical placement chart. Use only on clean, intact skin and seek professional care for severe, persistent, sudden or unexplained symptoms.</div>

        ${(condition.relatedGuideIds||[]).length?`
          <div class="condition-related-guides">
            <p class="eyebrow">Related guides</p>
            <div class="tag-list">
              ${(condition.relatedGuideIds||[]).map(cid=>conditionMap.get(cid)).filter(Boolean).map(related=>`
                <button class="tag-button" data-open-route="condition" data-open-id="${escapeHtml(related.id)}">${escapeHtml(related.name)}</button>
              `).join("")}
            </div>
          </div>`:""}
      </div>
    </section>
  </section>`;
}


function applicationStepRole(index,total,condition){
  return combinationRole(index,total,condition);
}

function applicationProgressMarkup(points,step){
  return points.map((point,index)=>{
    const state=index<step?"complete":index===step?"current":"upcoming";
    const marker=index<step?"✓":index+1;
    return `
      <div class="application-progress-step ${state}">
        <span>${marker}</span>
        <small>${escapeHtml(point.name)}</small>
      </div>`;
  }).join("");
}

function applicationView(id){
  const condition=conditionMap.get(id);
  if(!condition)return notFoundView();

  const points=(condition.pointIds||[]).map(pid=>pointMap.get(pid)).filter(Boolean);
  if(!points.length)return notFoundView();

  let step=applicationProgress.get(id)??0;
  step=Math.max(0,Math.min(step,points.length));

  if(step>=points.length){
    return `
    <section class="route application-route">
      <div class="application-complete-wrap container">
        <div class="application-complete-card">
          <span class="application-complete-icon">✓</span>
          <p class="eyebrow">Routine complete</p>
          <h1>${escapeHtml(condition.name)} guide complete.</h1>
          <p class="lead">You’ve reached the end of this ${points.length}-point application guide.</p>

          <div class="application-reminders">
            <article><span>◌</span><strong>Press gently</strong><p>Mild pressure is enough. Sharp pain is not the goal.</p></article>
            <article><span>◇</span><strong>Check your skin</strong><p>Inspect the area regularly while the ear seeds are in place.</p></article>
            <article><span>×</span><strong>Remove if irritated</strong><p>Remove the seeds if redness, swelling or significant discomfort appears.</p></article>
          </div>

          <div class="application-complete-actions">
            <button class="primary-button" data-finish-apply="${escapeHtml(id)}">Back to ${escapeHtml(condition.name)} guide</button>
            <a class="secondary-button" href="#/guide">Review application guide</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  const point=points[step];
  const role=applicationStepRole(step,points.length,condition);
  const position=mapPositions[point.id]||[50,50];
  const percent=Math.round(((step+1)/points.length)*100);

  return `
  <section class="route application-route">
    <div class="route-hero application-hero">
      <div class="container">
        <a class="application-back-link" href="#/condition/${escapeHtml(condition.id)}">← Back to ${escapeHtml(condition.name)}</a>
        <p class="eyebrow">Guided application</p>
        <h1>${escapeHtml(condition.name)}</h1>
        <p class="lead">Follow the suggested combination one point at a time. Take your time and use gentle pressure.</p>

        <div class="application-progress-head">
          <span>Step ${step+1} of ${points.length}</span>
          <strong>${percent}%</strong>
        </div>
        <div class="application-progress-bar" aria-label="Application progress">
          <span style="width:${percent}%"></span>
        </div>
        <div class="application-progress-list">
          ${applicationProgressMarkup(points,step)}
        </div>
      </div>
    </div>

    <section class="section soft-section application-workspace-section">
      <div class="container">
        <div class="application-prep-note">
          <span>✦</span>
          <div>
            <strong>Before placing this seed</strong>
            <p>Use clean hands or tweezers, make sure the outer ear is clean and dry, and apply only to intact skin outside the ear canal.</p>
          </div>
        </div>

        <div class="application-workspace">
          <div class="application-map-card">
            <div class="application-map-caption">
              <span>Step ${step+1}</span>
              <strong>${escapeHtml(point.name)}</strong>
            </div>

            ${anatomicalEarSvg("compact")}

            ${points.map((p,index)=>{
              const pos=mapPositions[p.id]||[50,50];
              const state=index<step?"complete":index===step?"current":"upcoming";
              return `<span class="application-point ${state}" style="left:${pos[0]}%;top:${pos[1]}%" aria-label="${escapeHtml(p.name)}">${index<step?"✓":index+1}</span>`;
            }).join("")}
          </div>

          <aside class="application-info-card">
            <div class="role-line">
              <span class="role-badge">${escapeHtml(role[0])}</span>
              <small>${escapeHtml(role[1])}</small>
            </div>

            <p class="eyebrow application-step-label">Step ${step+1} of ${points.length}</p>
            <h2>${escapeHtml(point.name)}</h2>
            <p class="role-explainer">${escapeHtml(role[2])}</p>

            <div class="application-info-section">
              <div class="info-label"><span>⌖</span>Where to place</div>
              <p>${escapeHtml(point.location||"")}</p>
            </div>

            <div class="application-info-section">
              <div class="info-label"><span>◌</span>Gentle stimulation</div>
              <p>${escapeHtml(point.howToStimulate||"")}</p>
            </div>

            <div class="application-info-section application-wellness-context">
              <div class="info-label"><span>✦</span>Why it’s included</div>
              <p>${escapeHtml(point.traditionalUse||"")}</p>
            </div>

            <div class="application-step-actions">
              <button class="secondary-button" data-apply-prev="${escapeHtml(id)}" ${step===0?"disabled":""}>Back</button>
              <button class="primary-button" data-apply-next="${escapeHtml(id)}">${step===points.length-1?"Finish routine":"Next point"}</button>
            </div>

            <button class="application-point-detail-link text-button" data-open-route="point" data-open-id="${escapeHtml(point.id)}">Open full ${escapeHtml(point.name)} guide</button>
          </aside>
        </div>

        <div class="notice application-safety-notice">
          This guided mode is for general wellness education and does not confirm clinical point placement. Stop and remove the ear seed if irritation, swelling, dizziness or significant discomfort occurs.
        </div>
      </div>
    </section>
  </section>`;
}


function pointView(id){
  const point=pointMap.get(id);
  if(!point)return notFoundView();
  const related=(point.relatedConditionIds||[]).map(cid=>conditionMap.get(cid)).filter(Boolean);
  const mapped=pointIsMapped(point);
  return `
  <section class="route">
    <div class="route-hero">
      <div class="container">
        <div class="point-title-status">
          <p class="eyebrow">${escapeHtml(point.category||"Acupoint")}</p>
          <span class="point-library-status ${mapped?"mapped":"reference"}">${mapped?"Mapped acupoint":"Reference acupoint"}</span>
        </div>
        <h1>${escapeHtml(point.name)}</h1>
        <p class="lead">${escapeHtml(point.traditionalUse)}</p>
      </div>
    </div>
    <section class="section soft-section">
      <div class="container detail-layout">
        <article class="detail-card">
          ${!mapped?`<div class="reference-point-notice"><strong>Reference library point</strong><p>This point has not yet been plotted on Bloomé’s simplified interactive ear map. The written location below is for general educational reference only.</p></div>`:""}
          <section><h3>General location</h3><p>${escapeHtml(point.location)}</p></section>
          <section><h3>Traditional wellness use</h3><p>${escapeHtml(point.traditionalUse)}</p></section>
          <section><h3>Gentle stimulation</h3><p>${escapeHtml(point.howToStimulate)}</p></section>
          <section><h3>Caution</h3><p>${escapeHtml(point.caution||"Use only on clean, intact skin and remove if irritation occurs.")}</p></section>
        </article>
        <aside class="side-card">
          ${mapped?`<button class="primary-button point-map-button" data-jump-map="${escapeHtml(point.id)}">View on interactive ear map</button>`:`<div class="reference-map-message">Visual placement pending review. This avoids showing an approximate marker as if it were exact.</div>`}
          <p class="eyebrow point-related-heading">Related visual guides</p>
          <div class="tag-list">
            ${related.length?related.map(c=>`<button class="tag-button" data-open-route="condition" data-open-id="${escapeHtml(c.id)}">${escapeHtml(c.name)}</button>`).join(""):"<p>No related guides listed yet.</p>"}
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

  $$("[data-start-apply]").forEach(button=>button.addEventListener("click",()=>{
    const id=button.dataset.startApply;
    applicationProgress.set(id,0);
    navigate("apply",id);
  }));

  $$("[data-jump-map]").forEach(button=>button.addEventListener("click",()=>{
    mapSelectedId=button.dataset.jumpMap;
    navigate("map");
  }));

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
    translateUi(grid);
    wireCommonActions();
  }));
}
function wireFullMap(){
  const stage=$("#map-stage");
  if(!stage)return;

  const searchInput=$("#map-point-search");
  const clearButton=$("#map-search-clear");
  const emptyState=$("#map-directory-empty");
  const resultCount=$("#map-result-count");

  let activeCategory="all";
  let activeLetter="all";
  let activeQuery="";

  const allIds=acupoints.map(point=>point.id);

  function relatedButtons(){
    $$("[data-map-condition-id]",$("#map-related")).forEach(button=>{
      button.addEventListener("click",()=>navigate("condition",button.dataset.mapConditionId));
    });
  }

  function select(id,{scrollOnMobile=false}={}){
    const point=pointMap.get(id);
    if(!point)return;

    mapSelectedId=id;
    const mapped=pointIsMapped(point);

    $$(".map-marker").forEach(marker=>{
      marker.classList.toggle("active",mapped && marker.dataset.mapId===id);
    });
    $$(".map-point-card").forEach(card=>{
      card.classList.toggle("active",card.dataset.mapListId===id);
    });

    stage.classList.toggle("map-has-selection",mapped);
    stage.classList.toggle("map-reference-selection",!mapped);

    $("#map-title").textContent=point.name;
    $("#map-category").textContent=point.category||"Ear point";

    const status=$("#map-plot-status");
    status.textContent=mapped?uiText("On map"):uiText("Reference only");
    status.classList.toggle("mapped",mapped);
    status.classList.toggle("reference",!mapped);

    $("#map-reference-note").hidden=mapped;
    $("#map-location").textContent=point.location||"";
    $("#map-copy").textContent=point.traditionalUse||"";
    $("#map-stimulate").textContent=point.howToStimulate||"";
    $("#map-related").innerHTML=mapRelatedMarkup(point);
    $("#map-open-point").dataset.pointId=id;
    relatedButtons();

    if(scrollOnMobile && window.matchMedia("(max-width: 680px)").matches){
      $(".map-explorer-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
    }
  }

  function visiblePointIds(){
    return allIds.filter(id=>{
      const point=pointMap.get(id);
      if(!point)return false;
      const queryMatch=!activeQuery || searchableText(point).includes(normalize(activeQuery));
      const categoryMatch=activeCategory==="all" || point.category===activeCategory;
      const letterMatch=activeLetter==="all" || point.name.charAt(0).toUpperCase()===activeLetter;
      return queryMatch && categoryMatch && letterMatch;
    });
  }

  function applyFilters(){
    const visible=new Set(visiblePointIds());

    $$(".map-marker").forEach(marker=>{
      marker.classList.toggle("map-filtered-out",!visible.has(marker.dataset.mapId));
      marker.disabled=!visible.has(marker.dataset.mapId);
    });

    $$(".map-point-card").forEach(card=>{
      card.hidden=!visible.has(card.dataset.mapListId);
    });

    const count=visible.size;
    resultCount.textContent=pointCountText(count);
    emptyState.hidden=count!==0;

    if(count>0 && !visible.has(mapSelectedId)){
      select([...visible][0]);
    }
  }

  $$("[data-map-id]").forEach(marker=>{
    marker.addEventListener("click",()=>select(marker.dataset.mapId,{scrollOnMobile:true}));
  });

  $$("[data-map-list-id]").forEach(card=>{
    card.addEventListener("click",()=>{
      const id=card.dataset.mapListId;
      select(id);
      const point=pointMap.get(id);
      const target=pointIsMapped(point)?$(".map-explorer-canvas"):$(".map-explorer-panel");
      target?.scrollIntoView({behavior:"smooth",block:"center"});
    });
  });

  $$("[data-map-category]").forEach(button=>{
    button.addEventListener("click",()=>{
      activeCategory=button.dataset.mapCategory;
      $$("[data-map-category]").forEach(item=>item.classList.toggle("active",item===button));
      applyFilters();
    });
  });

  $$("[data-map-letter]").forEach(button=>{
    button.addEventListener("click",()=>{
      activeLetter=button.dataset.mapLetter;
      $$("[data-map-letter]").forEach(item=>item.classList.toggle("active",item===button));
      applyFilters();
    });
  });

  searchInput?.addEventListener("input",()=>{
    activeQuery=searchInput.value.trim();
    clearButton.hidden=!activeQuery;
    applyFilters();
  });

  clearButton?.addEventListener("click",()=>{
    searchInput.value="";
    activeQuery="";
    clearButton.hidden=true;
    searchInput.focus();
    applyFilters();
  });

  $("#map-open-point")?.addEventListener("click",event=>{
    navigate("point",event.currentTarget.dataset.pointId);
  });

  $("#map-next-point")?.addEventListener("click",()=>{
    const ids=visiblePointIds();
    if(!ids.length)return;
    const currentIndex=ids.indexOf(mapSelectedId);
    select(ids[(currentIndex+1+ids.length)%ids.length]);
  });

  function applyZoom(){
    stage.style.transform=`scale(${mapZoom})`;
  }

  $("#zoom-in")?.addEventListener("click",()=>{
    mapZoom=Math.min(1.65,mapZoom+.15);
    applyZoom();
  });

  $("#zoom-out")?.addEventListener("click",()=>{
    mapZoom=Math.max(.8,mapZoom-.15);
    applyZoom();
  });

  $("#zoom-reset")?.addEventListener("click",()=>{
    mapZoom=1;
    applyZoom();
  });

  relatedButtons();
  select(mapSelectedId);
  applyFilters();
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
    $("#condition-info-content").innerHTML=conditionInfoMarkup(point,combinationRole(idx,points.length,condition));
    translateUi($("#condition-info-content"));
    $("#open-selected-point").dataset.pointId=pointId;
  }
  $$("[data-condition-point]").forEach(button=>button.addEventListener("click",()=>select(button.dataset.conditionPoint)));
  $$("[data-condition-point-tab]").forEach(button=>button.addEventListener("click",()=>select(button.dataset.conditionPointTab)));
  $("#open-selected-point")?.addEventListener("click",event=>navigate("point",event.currentTarget.dataset.pointId));
}


function wireApplication(id){
  const condition=conditionMap.get(id);
  if(!condition)return;

  const points=(condition.pointIds||[]).map(pid=>pointMap.get(pid)).filter(Boolean);

  $("[data-apply-prev]")?.addEventListener("click",()=>{
    const step=applicationProgress.get(id)??0;
    applicationProgress.set(id,Math.max(0,step-1));
    render();
  });

  $("[data-apply-next]")?.addEventListener("click",()=>{
    const step=applicationProgress.get(id)??0;
    applicationProgress.set(id,Math.min(points.length,step+1));
    render();
  });

  $("[data-finish-apply]")?.addEventListener("click",()=>{
    applicationProgress.delete(id);
    navigate("condition",id);
  });
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
  else if(route==="apply")html=applicationView(id);
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
  if(route==="apply")wireApplication(id);
  translateUi(document);
  requestAnimationFrame(()=>$$('.reveal-item').forEach(el=>el.classList.add('revealed')));
}

async function loadData(){
  try{
    const [conditionResponse,pointResponse,i18nResponse]=await Promise.all([
      fetch("./data/conditions.json"),
      fetch("./data/acupoints.json"),
      fetch("./data/i18n.json")
    ]);
    if(!conditionResponse.ok||!pointResponse.ok||!i18nResponse.ok)throw new Error("Data load failed");
    sourceConditions=await conditionResponse.json();
    sourceAcupoints=await pointResponse.json();
    localeData=await i18nResponse.json();
    rebuildLocalizedData();
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
$("#language-toggle")?.addEventListener("click",()=>{
  setLocale(currentLocale==="en"?"ms":"en");
});
loadData();


/* Package 9A note:
   Condition rendering keeps existing data bindings.
   Future upgrades can expand from this stable structure.
*/


/* Bloomé Package 9B — Smart Search Experience */


/* Bloomé Package 13 — Bahasa Melayu Layer */


/* Bloomé Package 14 — Complete 30-Point Ear Map */


/* Bloomé Package 14.1 — Language Toggle Hotfix */


/* Bloomé Package 14.2 — Translation Collision Fix */


/* Bloomé Package 15 — Guided Application Mode */


/* Bloomé Package 17 — Combination Audit */
