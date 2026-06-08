(function(){const s="qz-feedback";window.showFeedback=function(e){const r=e.mountId??s,n=document.getElementById(r);if(!n){console.error(`showFeedback: #${r} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}const c=i(n),o=e.isCorrect?"correct":"incorrect",a=e.isCorrect?"\u2713":"\u2717",d=e.isCorrect?"\u6B63\u89E3\uFF01":"\u4E0D\u6B63\u89E3",l=!e.isCorrect&&e.correctLabel?`<p class="qz-feedback__correct-answer">
           \u6B63\u89E3\uFF1A<strong>${t(e.correctLabel)}</strong>
         </p>`:"",f=!e.isCorrect&&e.userLabel?`<p class="qz-feedback__user-answer">
           \u3042\u306A\u305F\u306E\u56DE\u7B54\uFF1A<span>${t(e.userLabel)}</span>
         </p>`:"";n.className=`qz-feedback qz-feedback--${o}`,n.innerHTML=`
      <div class="qz-feedback__main">
        <span class="qz-feedback__icon">${a}</span>
        <span class="qz-feedback__headline">${d}</span>
      </div>
      ${l}
      ${f}
    `,n.classList.remove("hidden"),c.className="qz-feedback__extra",c.innerHTML="",e.extraRenderer?e.extraRenderer(c):e.extraHtml&&(c.innerHTML=e.extraHtml),c.innerHTML.trim()?c.classList.remove("hidden"):c.classList.add("hidden"),n.scrollIntoView({behavior:"smooth",block:"nearest"})},window.hideFeedback=function(e=s){const r=document.getElementById(e);r&&r.classList.add("hidden");const n=document.getElementById(`${e}-extra`);n&&(n.classList.add("hidden"),n.innerHTML="")};function i(e){const r=`${e.id}-extra`;let n=document.getElementById(r);return n||(n=document.createElement("div"),n.id=r,n.className="qz-feedback__extra hidden",e.insertAdjacentElement("afterend",n),n)}function t(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
