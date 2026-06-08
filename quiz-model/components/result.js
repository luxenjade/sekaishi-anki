(function(){const d="result-screen";window.showResult=function(e){const i=e.mountId??d,r=document.getElementById(i);if(!r){console.error(`showResult: #${i} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}const l=Math.round(e.correct/e.total*100),n=u(l),s=e.mistakes??[];if(r.innerHTML=`
      <div class="qz-result">

        <!-- \u30B9\u30B3\u30A2\u30B5\u30DE\u30EA -->
        <div class="qz-result__summary">
          <div class="qz-result__grade">${n.emoji}</div>
          <div class="qz-result__score">${e.correct}<span class="qz-result__total"> / ${e.total}</span></div>
          <div class="qz-result__pct">${l}%</div>
          <p class="qz-result__message">${t(n.message)}</p>
        </div>

        <!-- \u7D71\u8A08\u30AB\u30FC\u30C9 -->
        <div class="qz-result__stats">
          <div class="qz-result__stat">
            <div class="qz-result__stat-num qz-result__stat-num--correct">${e.correct}</div>
            <div class="qz-result__stat-label">\u6B63\u89E3</div>
          </div>
          <div class="qz-result__stat">
            <div class="qz-result__stat-num qz-result__stat-num--incorrect">${e.total-e.correct}</div>
            <div class="qz-result__stat-label">\u4E0D\u6B63\u89E3</div>
          </div>
          <div class="qz-result__stat">
            <div class="qz-result__stat-num">${e.total}</div>
            <div class="qz-result__stat-label">\u51FA\u984C\u6570</div>
          </div>
        </div>

        <!-- \u30DC\u30BF\u30F3 -->
        <div class="qz-result__actions">
          <button class="qz-btn qz-btn--ghost" id="qz-retry-btn" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            ${t(e.retryLabel??"\u3082\u3046\u4E00\u5EA6\u6311\u6226")}
          </button>
          ${s.length>0?`
            <button class="qz-btn qz-btn--primary" id="qz-retry-mistakes-btn" type="button">
              ${t(e.retryMistakesLabel??"\u9593\u9055\u3048\u305F\u554F\u984C\u3060\u3051")}
              <span class="qz-result__badge">${s.length}</span>
            </button>
          `:""}
        </div>

        <!-- \u5FA9\u7FD2\u30EA\u30B9\u30C8 -->
        ${s.length>0?`
          <div class="qz-result__review">
            <p class="qz-section-title">\u5FA9\u7FD2\u30EA\u30B9\u30C8\uFF08${s.length}\u554F\uFF09</p>
            <div class="qz-review-list" id="qz-review-list"></div>
          </div>
        `:`
          <div class="qz-result__perfect">
            \u{1F389} \u5168\u554F\u6B63\u89E3\uFF01\u7D20\u6674\u3089\u3057\u3044\u3067\u3059\uFF01
          </div>
        `}

      </div>
    `,r.classList.remove("hidden"),s.length>0){const v=r.querySelector("#qz-review-list");s.forEach(c=>{const a=document.createElement("div");a.className="qz-review-item",e.renderMistake?a.innerHTML=e.renderMistake(c):a.innerHTML=o(c),v.appendChild(a)})}r.querySelector("#qz-retry-btn")?.addEventListener("click",()=>{e.onRetry&&e.onRetry()}),r.querySelector("#qz-retry-mistakes-btn")?.addEventListener("click",()=>{e.onRetryMistakes&&e.onRetryMistakes(s)})};function o(e){return`
      <div class="qz-review-item__header">
        ${e.category?`<span class="qz-category-chip" style="font-size:0.7rem;">${t(e.category)}</span>`:""}
        <p class="qz-review-item__question">${t(e.questionText??"")}</p>
      </div>
      <div class="qz-review-item__answers">
        <span class="qz-review-item__user">
          \u3042\u306A\u305F\uFF1A${t(String(e.userAnswer??""))}
        </span>
        <span class="qz-review-item__correct">
          \u6B63\u89E3\uFF1A<strong>${t(String(e.correctAnswer??""))}</strong>
        </span>
      </div>
    `}function u(e){return e===100?{emoji:"\u{1F3C6}",message:"\u30D1\u30FC\u30D5\u30A7\u30AF\u30C8\uFF01"}:e>=80?{emoji:"\u{1F389}",message:"\u3088\u304F\u3067\u304D\u307E\u3057\u305F\uFF01"}:e>=60?{emoji:"\u{1F4DA}",message:"\u3082\u3046\u5C11\u3057\uFF01\u5FA9\u7FD2\u3057\u3066\u307F\u3088\u3046\u3002"}:{emoji:"\u{1F4AA}",message:"\u6B21\u306F\u9811\u5F35\u308D\u3046\u3002\u5FA9\u7FD2\u30EA\u30B9\u30C8\u3092\u6D3B\u7528\u3057\u3066\uFF01"}}function t(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
