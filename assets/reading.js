// Progressive enhancement only. No API, research write, or owner data.
export function installNavigation(){
 if(typeof document==='undefined'||document.documentElement.dataset.navigationReady)return;
 document.documentElement.dataset.navigationReady='true';
 const storageKey='reading-citation-return';
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{return null;}};
 function reveal(){if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;for(let e=target;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;target.scrollIntoView({block:'start'});}
 function returnLink(){const origin=read();if(!origin)return;for(const section of document.querySelectorAll('.source-excerpt')){if(section.id!==origin.citation)continue;const link=section.querySelector('[data-citation-return]');if(!link)return;const target=new URL(link.href);let allowed;try{allowed=JSON.parse(section.dataset.returnAnchors||'[]');}catch{return;}if(target.origin!==location.origin||target.pathname!==origin.path||!allowed.includes(origin.anchor))return;target.hash=origin.anchor;link.href=target.href;}}
 document.addEventListener('click',event=>{const a=event.target.closest?.('a.citation-outbound');if(!a)return;const url=new URL(a.href);if(url.origin!==location.origin||!url.pathname.includes('/evidence/')||!/^#citation-[a-f0-9]{64}$/.test(url.hash))return;const block=a.closest('[id^="paragraph-"]');const origin={citation:url.hash.slice(1),path:location.pathname,anchor:block?.id||a.id,linkId:a.id,y:scrollY};if(!origin.anchor)return;try{sessionStorage.setItem(storageKey,JSON.stringify(origin));}catch{}});
 addEventListener('hashchange',reveal);
 addEventListener('pageshow',event=>{reveal();returnLink();const origin=read();if(!origin||origin.path!==location.pathname)return;const link=document.getElementById(origin.linkId);if(link&&event.persisted){link.focus({preventScroll:true});scrollTo(0,origin.y);}});
 returnLink();reveal();
}
installNavigation();
