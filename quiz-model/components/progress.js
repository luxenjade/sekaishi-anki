(function(){let e=null,o=0;window.initProgress=function(t){e=t,o=0,l()},window.enableNextButton=function(){const t=document.getElementById("qz-next-btn");t&&(t.disabled=!1)},window.disableNextButton=function(){const t=document.getElementById("qz-next-btn");t&&(t.disabled=!0)},window.updateProgress=function(t){e&&(o=t,a(),u())};function l(){d(),c()}function d(){const t=e.barId??"qz-progress-bar",n=document.getElementById(t);n&&(n.innerHTML=`
      <div class="qz-progress-wrap">
        <div class="qz-progress">
          <div class="qz-progress__fill" id="qz-progress-fill" style="width:0%"></div>
        </div>
        <div class="qz-progress-counter" id="qz-progress-counter">
          <span id="qz-progress-current">1</span> / ${e.total}
        </div>
      </div>
    `)}function c(){const t=e.navId??"qz-nav-buttons",n=document.getElementById(t);if(!n)return;const s=e.nextLabel??"\u6B21\u306E\u554F\u984C",r=e.resetLabel??"\u6700\u521D\u306B\u623B\u308B";n.innerHTML=`
      <div class="qz-nav">
        <button class="qz-btn qz-btn--ghost qz-btn--sm" id="qz-reset-btn" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
          </svg>
          <span class="qz-reset-label">${s!=="\u6B21\u306E\u554F\u984C"?"Reset":r}</span>
        </button>
        <button class="qz-btn qz-btn--primary qz-btn--sm" id="qz-next-btn" type="button" disabled>
          <span class="qz-next-label">${s}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    `,document.getElementById("qz-next-btn").addEventListener("click",b),document.getElementById("qz-reset-btn").addEventListener("click",f)}function a(){const t=document.getElementById("qz-progress-fill"),n=document.getElementById("qz-progress-current");if(!t||!e)return;const s=Math.round((o+1)/e.total*100);t.style.width=s+"%",n&&(n.textContent=o+1)}function u(){const t=document.getElementById("qz-next-btn");if(!t||!e)return;const n=o>=e.total-1,s=e.nextLabel??"\u6B21\u306E\u554F\u984C",r=e.lastLabel??"\u7D50\u679C\u3092\u898B\u308B",i=t.querySelector(".qz-next-label");i&&(i.textContent=n?r:s)}function b(){e&&(window.disableNextButton(),e.onNext&&e.onNext(o))}function f(){if(!e)return;const t=e.resetConfirm??`\u6700\u521D\u306B\u623B\u308A\u307E\u3059\u304B\uFF1F
\u9032\u6357\u306F\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u307E\u3059\u3002`;t&&!confirm(t)||e.onReset&&e.onReset()}})();
