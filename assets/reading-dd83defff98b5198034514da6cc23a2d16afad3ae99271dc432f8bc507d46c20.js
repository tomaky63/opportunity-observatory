// Progressive enhancement only. No API, research write, or owner data.
export function safeCitationReturn(href,origin,allowedAnchors,locationOrigin,allowedPaths=[]){
 if(!origin||!/^citation-[a-f0-9]{64}$/.test(origin.citation||'')||typeof origin.path!=='string'||!Array.isArray(allowedAnchors)||typeof origin.anchor!=='string')return null;
 try{const target=new URL(href,locationOrigin),pathAllowed=target.pathname===origin.path||Array.isArray(allowedPaths)&&allowedPaths.includes(origin.path);if(target.origin!==locationOrigin||!pathAllowed||!/^\/opportunity-observatory\/(?:articles|business|opportunities|history|records|understand|outlook)\/[a-zA-Z0-9:/_-]+\.html$/.test(origin.path)||!allowedAnchors.includes(origin.anchor)||!/^[a-zA-Z0-9:_-]{1,240}$/.test(origin.anchor))return null;target.pathname=origin.path;target.hash=origin.anchor;return target.href;}catch{return null;}
}
export function historyOwnerReturnAnchor({href,origin,persisted,navigationType,allowedAnchors}){
 if(persisted!==false||navigationType!=='back_forward')return null;
 try{const current=new URL(href);if(origin?.path!==current.pathname||current.hash&&decodeURIComponent(current.hash.slice(1))!==origin?.anchor)return null;return safeCitationReturn(current.href,origin,allowedAnchors,current.origin)?origin.anchor:null;}catch{return null;}
}
export function citationOwnerAnchors(links,citation,locationOrigin){
 if(!/^citation-[a-f0-9]{64}$/.test(citation||''))return [];
 const anchors=[];
 for(const link of links){try{const url=new URL(link.href,locationOrigin);if(url.origin!==locationOrigin||!/^\/opportunity-observatory\/evidence\/[a-f0-9]{64}\.html$/.test(url.pathname)||url.hash!=='#'+citation)continue;anchors.push(link.closest('[id^="paragraph-"]')?.id,link.dataset.citationReturnAnchor,link.id);}catch{}}
 return anchors.filter(anchor=>typeof anchor==='string'&&/^[a-zA-Z0-9:_-]{1,240}$/.test(anchor));
}
export function scheduleOwnerReturn(target,{frame,valid,viewportHeight,done}){
 let remaining=2;
 const tick=()=>{if(!target.isConnected||!valid()){done();return;}const r=target.getBoundingClientRect();if(r.top<0||r.top>=viewportHeight()-20||r.bottom<=0)target.scrollIntoView({block:'start',behavior:'instant'});if(--remaining)frame(tick);else done();};
 frame(tick);
}
export function installNavigation(){
 if(typeof document==='undefined'||document.documentElement.dataset.navigationReady)return;
 document.documentElement.dataset.navigationReady='true';
 const storageKey='reading-citation-return';
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{return null;}};
 function reveal({scroll=true}={}){if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;
  if(target.dataset.reviewRelocation){try{const next=new URL(target.dataset.reviewRelocation,location.origin);if(next.origin===location.origin&&/^\/opportunity-observatory\/reviews\/[a-f0-9-]{36}\.html$/.test(next.pathname)&&next.hash==='#'+encodeURIComponent(id)){location.replace(next.href);return;}}catch{}}
  for(let e=target;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;
  // Native fragment navigation accounts for offscreen sections becoming laid
  // out. An eager extra scroll here can race that layout and displace its target.
  // Retain imperative revelation for evidence/paragraphs inside closed details.
  if(scroll&&!id.startsWith('reading-'))target.scrollIntoView({block:'start'});
 }
 function returnLink(){const origin=read();if(!origin)return;for(const section of document.querySelectorAll('.source-excerpt')){if(section.id!==origin.citation)continue;const link=section.querySelector('[data-citation-return]');if(!link)return;let allowed,paths;try{allowed=JSON.parse(section.dataset.returnAnchors||'[]');paths=JSON.parse(section.dataset.returnPaths||'[]');}catch{return;}const target=safeCitationReturn(link.href,origin,allowed,location.origin,paths);if(target)link.href=target;}}
 document.addEventListener('click',event=>{const a=event.target.closest?.('a.citation-outbound');if(!a)return;const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.includes('/evidence/')||!/^#citation-[a-f0-9]{64}$/.test(url.hash))return;const block=a.closest('[id^="paragraph-"]');const origin={citation:url.hash.slice(1),path:location.pathname,anchor:block?.id||a.dataset.citationReturnAnchor||a.id,linkId:a.id,y:scrollY};if(!origin.anchor)return;try{sessionStorage.setItem(storageKey,JSON.stringify(origin));}catch{}});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape'||document.querySelector('dialog[open]'))return;const menu=document.querySelector('.reader-navigation[open]');if(!menu)return;menu.open=false;menu.querySelector('summary')?.focus({preventScroll:true});event.preventDefault();});
 addEventListener('hashchange',()=>reveal());
 addEventListener('pageshow',event=>{reveal({scroll:!event.persisted});returnLink();const origin=read();if(!origin||origin.path!==location.pathname)return;const paragraph=document.getElementById(origin.anchor),focus=paragraph?.querySelector('.reader-evidence-entry > summary')||document.getElementById(origin.linkId);focus?.focus({preventScroll:true});
  // Only a discarded history owner with no hash or its same citation-origin
  // anchor needs a bounded correction. Other fragment targets stay untouched.
  // A persisted document keeps its browser-owned scroll/open state untouched.
  const navigationType=performance.getEntriesByType('navigation')[0]?.type;
  if(event.persisted!==false||navigationType!=='back_forward')return;
  if(location.hash){try{if(decodeURIComponent(location.hash.slice(1))!==origin.anchor)return;}catch{return;}}
  const anchor=historyOwnerReturnAnchor({href:location.href,origin,persisted:event.persisted,navigationType,allowedAnchors:citationOwnerAnchors(document.querySelectorAll('a.citation-outbound'),origin.citation,location.origin)});
  const target=anchor&&document.getElementById(anchor);if(!target)return;
  const href=location.href,events=['pointerdown','keydown','wheel','touchstart'];let interrupted=false;
  const stop=()=>{interrupted=true;},done=()=>{for(const name of events)removeEventListener(name,stop,true);};
  for(const name of events)addEventListener(name,stop,{capture:true,passive:true});
  scheduleOwnerReturn(target,{frame:requestAnimationFrame,valid:()=>!interrupted&&location.href===href,viewportHeight:()=>innerHeight,done});
 });
 returnLink();reveal();
}
installNavigation();
