(function(){
"use strict";
function renderScrapbook(){const wrap=document.getElementById("scrapbook");if(!wrap)return;const items=(window.MEHRAB_CONTENT&&window.MEHRAB_CONTENT.memories)||[];wrap.innerHTML="";items.forEach((item,idx)=>{const card=document.createElement("article");card.className="polaroid reveal cute-memory-card";card.style.setProperty("--rot",((idx%2?1:-1)*(1.5+idx*.35))+"deg");card.style.transitionDelay=(idx*.05)+"s";card.innerHTML=`<div class="polaroid-tape"></div><div class="cute-memory-emoji" aria-hidden="true">${item.emoji||"💗"}</div><p class="polaroid-cap">${item.cap||""}</p><span class="cute-sparkle">✦</span>`;wrap.appendChild(card);});}
window.MehrabGallery={render:renderScrapbook};document.addEventListener("DOMContentLoaded",renderScrapbook);})();
