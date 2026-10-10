// Progressive enhancement only. No API, research write, or owner data.
export function safeCitationReturn(href,origin,allowedAnchors,locationOrigin,allowedPaths=[]){
 if(!origin||!/^citation-[a-f0-9]{64}$/.test(origin.citation||'')||typeof origin.path!=='string'||!Array.isArray(allowedAnchors)||typeof origin.anchor!=='string')return null;
 try{const target=new URL(href,locationOrigin),pathAllowed=target.pathname===origin.path||Array.isArray(allowedPaths)&&allowedPaths.includes(origin.path);if(target.origin!==locationOrigin||!pathAllowed||!/^\/opportunity-observatory\/(?:articles|business|opportunities|history|records|understand|outlook)\/[a-zA-Z0-9:/_-]+\.html$/.test(origin.path)||!allowedAnchors.includes(origin.anchor)||!/^[a-zA-Z0-9:_-]{1,240}$/.test(origin.anchor))return null;target.pathname=origin.path;target.hash=origin.anchor;return target.href;}catch{return null;}
}
export function installNavigation(){
 if(typeof document==='undefined'||document.documentElement.dataset.navigationReady)return;
 document.documentElement.dataset.navigationReady='true';
 const storageKey='reading-citation-return';
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{return null;}};
 function reveal(){if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;for(let e=target;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;
  // Native fragment navigation accounts for offscreen sections becoming laid
  // out. An eager extra scroll here can race that layout and displace its target.
  // Retain imperative revelation for evidence/paragraphs inside closed details.
  if(!id.startsWith('reading-'))target.scrollIntoView({block:'start'});
 }
 function returnLink(){const origin=read();if(!origin)return;for(const section of document.querySelectorAll('.source-excerpt')){if(section.id!==origin.citation)continue;const link=section.querySelector('[data-citation-return]');if(!link)return;let allowed,paths;try{allowed=JSON.parse(section.dataset.returnAnchors||'[]');paths=JSON.parse(section.dataset.returnPaths||'[]');}catch{return;}const target=safeCitationReturn(link.href,origin,allowed,location.origin,paths);if(target)link.href=target;}}
 document.addEventListener('click',event=>{const a=event.target.closest?.('a.citation-outbound');if(!a)return;const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.includes('/evidence/')||!/^#citation-[a-f0-9]{64}$/.test(url.hash))return;const block=a.closest('[id^="paragraph-"]');const origin={citation:url.hash.slice(1),path:location.pathname,anchor:block?.id||a.dataset.citationReturnAnchor||a.id,linkId:a.id,y:scrollY};if(!origin.anchor)return;try{sessionStorage.setItem(storageKey,JSON.stringify(origin));}catch{}});
 addEventListener('hashchange',reveal);
 addEventListener('pageshow',event=>{reveal();returnLink();const origin=read();if(!origin||origin.path!==location.pathname)return;const link=document.getElementById(origin.linkId);if(link&&event.persisted){link.focus({preventScroll:true});scrollTo(0,origin.y);}});
 returnLink();reveal();
}
installNavigation();
