(function(){let m=null,l=new Set,o=10,p=null;window.initStartScreen=function(e,n="start-screen"){m=e,l=new Set,o=e.countDefault??10;const t=document.getElementById(n);if(!t){console.error(`initStartScreen: #${n} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}t.innerHTML=z(e),t.classList.remove("hidden"),h(t,e),L(),e.tutorialMd&&$(e.tutorialMd)};function z(e){return`
      <div class="qz-start">
        ${b(e)}
        ${e.rangeMode!=="none"?_(e):""}
        ${y(e)}
        <div class="qz-start__footer">
          <button class="qz-btn qz-btn--primary" id="qz-start-btn" disabled>
            ${a(e.startLabel??"\u30AF\u30A4\u30BA\u3092\u958B\u59CB")}
          </button>
        </div>
      </div>
    `}function b(e){const n=e.image?`<img class="qz-start__image" src="${a(e.image)}" alt="${a(e.title)}">`:"",t=e.subtitle?`<p class="qz-start__subtitle">${a(e.subtitle)}</p>`:"";return`
      <div class="qz-start__hero">
        ${n}
        <h1 class="qz-start__title">${a(e.title)}</h1>
        ${t}
      </div>
    `}function _(e){const n=e.rangeLabel??"\u51FA\u984C\u7BC4\u56F2";if(e.rangeMode==="multi"){const t=(e.ranges??[]).map(s=>`
        <button class="qz-chip" data-range-id="${a(s.id)}" type="button">
          ${a(s.label)}
        </button>
      `).join("");return`
        <div class="qz-start__block">
          <p class="qz-section-title">${a(n)}\uFF08\u8907\u6570\u9078\u629E\u53EF\uFF09</p>
          <div class="qz-range-chips__controls">
            <button class="qz-btn qz-btn--ghost" id="qz-select-all" type="button"
                    style="font-size:0.8rem; padding:0.4rem 0.9rem;">\u5168\u9078\u629E</button>
            <button class="qz-btn qz-btn--ghost" id="qz-deselect-all" type="button"
                    style="font-size:0.8rem; padding:0.4rem 0.9rem;">\u89E3\u9664</button>
          </div>
          <div class="qz-range-chips">${t}</div>
        </div>
      `}if(e.rangeMode==="single"){const t=(e.ranges??[]).map(s=>`
        <button class="qz-range-item" data-range-id="${a(s.id)}" type="button">
          ${a(s.label)}
        </button>
      `).join("");return`
        <div class="qz-start__block">
          <p class="qz-section-title">${a(n)}</p>
          <div class="qz-range-list">${t}</div>
        </div>
      `}return""}function y(e){if(e.countMode==="select")return`
        <div class="qz-start__block">
          <p class="qz-section-title">\u51FA\u984C\u6570</p>
          <select class="qz-count-select" id="qz-count-select">${(e.countOptions??[10,20,30,"all"]).map(i=>`<option value="${i}" ${i===(e.countDefault??10)?"selected":""}>
          ${i==="all"?"\u5168\u554F":`${i}\u554F`}
        </option>`).join("")}</select>
        </div>
      `;const n=e.countMin??5,t=e.countMax??50,s=e.countDefault??10;return`
      <div class="qz-start__block">
        <p class="qz-section-title">\u51FA\u984C\u6570</p>
        <div class="qz-count-slider">
          <input type="range" id="qz-count-range"
                 min="${n}" max="${t}" value="${s}" step="1">
          <input type="number" id="qz-count-input"
                 min="${n}" max="${t}" value="${s}">
          <span style="font-size:0.85rem; color:var(--qz-text-sub);">\u554F</span>
        </div>
      </div>
    `}function h(e,n){if(n.rangeMode==="multi"&&(e.querySelectorAll(".qz-chip").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.rangeId;l.has(s)?(l.delete(s),t.classList.remove("is-selected")):(l.add(s),t.classList.add("is-selected")),d(e,n)})}),e.querySelector("#qz-select-all")?.addEventListener("click",()=>{(n.ranges??[]).forEach(t=>l.add(t.id)),e.querySelectorAll(".qz-chip").forEach(t=>t.classList.add("is-selected")),d(e,n)}),e.querySelector("#qz-deselect-all")?.addEventListener("click",()=>{l.clear(),e.querySelectorAll(".qz-chip").forEach(t=>t.classList.remove("is-selected")),d(e,n)})),n.rangeMode==="single"&&e.querySelectorAll(".qz-range-item").forEach(t=>{t.addEventListener("click",()=>{e.querySelectorAll(".qz-range-item").forEach(s=>s.classList.remove("is-selected")),t.classList.add("is-selected"),l.clear(),l.add(t.dataset.rangeId),d(e,n)})}),n.rangeMode==="none"&&d(e,n),n.countMode==="select")e.querySelector("#qz-count-select")?.addEventListener("change",t=>{o=t.target.value==="all"?"all":parseInt(t.target.value)});else{const t=e.querySelector("#qz-count-range"),s=e.querySelector("#qz-count-input");t?.addEventListener("input",()=>{o=parseInt(t.value),s&&(s.value=t.value)}),s?.addEventListener("change",()=>{const u=parseInt(s.min),i=parseInt(s.max);let r=parseInt(s.value);isNaN(r)&&(r=o),r=Math.max(u,Math.min(i,r)),s.value=r,o=r,t&&(t.value=r)})}e.querySelector("#qz-start-btn")?.addEventListener("click",()=>{n.onStart&&n.onStart([...l],o)})}function d(e,n){const t=e.querySelector("#qz-start-btn");if(!t)return;const s=n.rangeMode==="none"||l.size>0;t.disabled=!s}function L(){if(!p)return;const{btn:e,overlay:n,panel:t,onKeydown:s}=p;document.removeEventListener("keydown",s),e?.remove(),n?.remove(),t?.remove(),p=null}function $(e){const n=document.createElement("button");n.className="qz-tutorial-btn",n.title="\u4F7F\u3044\u65B9\u3092\u898B\u308B",n.innerHTML="?",n.setAttribute("aria-label","\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u3092\u958B\u304F");const t=document.createElement("div");t.className="qz-tutorial-overlay";const s=document.createElement("div");s.className="qz-tutorial-panel",s.innerHTML=`
      <div class="qz-tutorial-panel__header">
        <span class="qz-tutorial-panel__title">\u4F7F\u3044\u65B9</span>
        <button class="qz-tutorial-panel__close" aria-label="\u9589\u3058\u308B">\xD7</button>
      </div>
      <div class="qz-tutorial-content">
        <p style="color:var(--qz-text-sub); font-size:0.85rem;">\u8AAD\u307F\u8FBC\u307F\u4E2D...</p>
      </div>
    `;const u=document.querySelector(".qz-header__actions");u?u.appendChild(n):document.body.appendChild(n),document.body.appendChild(t),document.body.appendChild(s);const i=s.querySelector(".qz-tutorial-content");fetch(e).then(c=>c.text()).then(c=>{i&&(typeof marked<"u"?i.innerHTML=marked.parse(c):i.innerHTML=`<pre style="white-space:pre-wrap;font-size:0.85rem;">${a(c)}</pre>`)}).catch(()=>{i&&(i.innerHTML='<p style="color:var(--qz-text-sub)">\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002</p>')});function r(){s.classList.add("is-open"),t.classList.add("is-open")}function q(){s.classList.remove("is-open"),t.classList.remove("is-open")}n.addEventListener("click",r),t.addEventListener("click",q),s.querySelector(".qz-tutorial-panel__close")?.addEventListener("click",q);const v=c=>{c.key==="Escape"&&q()};document.addEventListener("keydown",v),p={btn:n,overlay:t,panel:s,onKeydown:v}}function a(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
