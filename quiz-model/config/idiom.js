window.QUIZ_CONFIG={title:"Vintage \u30A4\u30C7\u30A3\u30AA\u30E0\u30AF\u30A4\u30BA",subtitle:"Fill-in-the-blank idiom questions",tutorialMd:"../quiz/tutorial/idiom.md",backLink:"/miscellaneous/",backLabel:"Miscellaneous",answerType:"choice",supabaseTable:"english_idioms",startLabel:"Start Quiz",rangeMode:"single",rangeLabel:"Quiz Mode",ranges:[{id:"random",label:"Random Practice | \u5168\u554F\u304B\u3089\u30E9\u30F3\u30C0\u30E0"},{id:"difficult",label:"Focus on Weak Areas | \u6B63\u7B54\u738750%\u672A\u6E80"},{id:"unattempted",label:"Not Yet Attempted | \u53D6\u308A\u7D44\u307F\u65705\u672A\u6E80"},{id:"mixed",label:"Mixed Review | 60% difficult / 30% medium / 10% easy"}],countMode:"select",countDefault:10,countOptions:[5,10,20,30,50,"all"],_cache:null,_MIN_ATTEMPTS:5,async fetchData(e,t){const s=e[0];if(!window.QUIZ_CONFIG._cache){const{data:o,error:l}=await window._db.from(window.SUPABASE_TABLES.ENGLISH_IDIOMS).select("*");if(l)throw new Error(l.message);window.QUIZ_CONFIG._cache=o||[]}const a=window.QUIZ_CONFIG._cache,i=window.QUIZ_CONFIG._MIN_ATTEMPTS;let r;switch(s){case"difficult":r=a.filter(o=>o.total_attempts>=i&&(o.correct_rate===null||o.correct_rate<50));break;case"unattempted":r=a.filter(o=>o.total_attempts===null||o.total_attempts<i);break;case"mixed":{const o=a.filter(d=>d.total_attempts>=i&&(d.correct_rate??100)<50),l=a.filter(d=>d.total_attempts>=i&&d.correct_rate>=50&&d.correct_rate<75),c=a.filter(d=>d.total_attempts>=i&&d.correct_rate>=75),u=parseInt(t)||10,_=[...window._quizShuffle(o).slice(0,Math.ceil(u*.6)),...window._quizShuffle(l).slice(0,Math.ceil(u*.3)),...window._quizShuffle(c).slice(0,Math.ceil(u*.1))];r=_.length>0?_:a;break}default:r=a}r.length===0&&(r=a);const n=window._quizShuffle(r);return t==="all"?n:n.slice(0,parseInt(t))},formatQuestion(e){return{text:e.fill_in_the_blanks,sub:e.example_jp??null}},formatCorrectLabel(e){return e.idiom_extracted},buildDistractors(e,t){return window._quizShuffle(t.filter(s=>s.idiom_extracted!==e.idiom_extracted)).slice(0,3)},async onAnswer({row:e,isCorrect:t}){_updateStats(e.id,t)},extraRenderer(e,t,s){e.innerHTML=_buildFeedbackCard(t,s),_bindReportForm(e,t)},renderMistake(e){const t=e._raw;return`
      <div class="qz-review-item__header">
        <p class="qz-review-item__question">${_esc(e.questionText)}</p>
      </div>
      <div style="font-size:0.85rem;margin:6px 0;color:var(--qz-text-sub);">${t?_esc(t.example_jp??""):""}</div>
      <div class="qz-review-item__answers">
        <span class="qz-review-item__user">Your answer: ${_esc(e.userAnswer)}</span>
        <span class="qz-review-item__correct">Correct: <strong>${_esc(e.correctAnswer)}</strong></span>
      </div>
      ${t?`<div style="font-size:0.8rem;color:var(--qz-text-sub);margin-top:6px;">${_esc(t.idiom)} | ${_esc(t.definition_jp)}</div>`:""}
    `},getCorrectValue:null,validate:null,renderChoice:null};async function _updateStats(e,t){try{const{data:s,error:a}=await window._db.from(window.SUPABASE_TABLES.ENGLISH_IDIOMS).select("total_attempts, correct_attempts").eq("id",e).single();if(a||!s)return;const i=(s.total_attempts??0)+1,r=(s.correct_attempts??0)+(t?1:0);await window._db.from(window.SUPABASE_TABLES.ENGLISH_IDIOMS).update({total_attempts:i,correct_attempts:r,correct_rate:r/i*100}).eq("id",e)}catch{}}function _buildFeedbackCard(e,t){const s=t?"is-correct":"is-incorrect",a=t?"\u2713 Correct!":"\u2717 Incorrect",i=e.tips?`
      <div class="idiom-field">
        <div class="idiom-field__label">\u{1F4A1} Tips</div>
        <div class="idiom-field__value">${_esc(e.tips)}</div>
      </div>
    `:"";return`
    <div class="idiom-feedback-card">
      <div class="idiom-feedback-card__header ${s}">${a}</div>
      <div class="idiom-feedback-card__body">
        <div class="idiom-field">
          <div class="idiom-field__label">ID</div>
          <div class="idiom-field__value">#${_esc(String(e.id))}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">Idiom</div>
          <div class="idiom-field__value is-idiom">${_esc(e.idiom)}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">\u610F\u5473 (Meaning)</div>
          <div class="idiom-field__value">${_esc(e.definition_jp)}</div>
        </div>
        <div class="idiom-field">
          <div class="idiom-field__label">Example Sentence</div>
          <div class="idiom-field__value is-example">${_esc(e.example)}</div>
        </div>
        ${i}
        <div class="report-section" id="report-${e.id}">
          <div class="report-section__title">\u26A0\uFE0F \u30C7\u30FC\u30BF\u306B\u8AA4\u308A\u304C\u3042\u308A\u307E\u3059\u304B\uFF1F</div>
          <button class="report-btn" type="button" data-action="toggle-report" data-id="${e.id}">
            \u30C7\u30FC\u30BF\u306E\u8AA4\u308A\u3092\u5831\u544A
          </button>
          <div class="report-form hidden" id="report-form-${e.id}">
            <select id="report-reason-${e.id}">
              <option value="">-- \u7406\u7531\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044 --</option>
              <option value="\u7A7A\u6B04\u3068\u30A4\u30C7\u30A3\u30AA\u30E0\u304C\u5408\u3063\u3066\u3044\u306A\u3044">\u7A7A\u6B04\u3068\u30A4\u30C7\u30A3\u30AA\u30E0\u304C\u5408\u3063\u3066\u3044\u306A\u3044</option>
              <option value="\u8AA4\u3063\u305F\u4F8B\u6587">\u8AA4\u3063\u305F\u4F8B\u6587</option>
              <option value="\u8AA4\u3063\u305F\u65E5\u672C\u8A9E\u8A33">\u8AA4\u3063\u305F\u65E5\u672C\u8A9E\u8A33</option>
              <option value="\u8AA4\u3063\u305F\u30A4\u30C7\u30A3\u30AA\u30E0">\u8AA4\u3063\u305F\u30A4\u30C7\u30A3\u30AA\u30E0</option>
              <option value="\u8AA4\u3063\u305F\u610F\u5473">\u8AA4\u3063\u305F\u610F\u5473</option>
              <option value="\u30B9\u30DA\u30EB\u30DF\u30B9">\u30B9\u30DA\u30EB\u30DF\u30B9</option>
              <option value="\u305D\u306E\u4ED6">\u305D\u306E\u4ED6</option>
            </select>
            <div class="report-form-actions">
              <button class="report-submit-btn" type="button" data-action="submit-report" data-id="${e.id}">\u9001\u4FE1</button>
              <button class="report-cancel-btn" type="button" data-action="toggle-report" data-id="${e.id}">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
            </div>
            <div class="report-message" id="report-msg-${e.id}"></div>
          </div>
        </div>
      </div>
    </div>
  `}function _bindReportForm(e,t){const s=e.querySelector(`#report-form-${t.id}`),a=e.querySelector(`#report-reason-${t.id}`),i=e.querySelector(`#report-msg-${t.id}`),r=e.querySelector(`[data-action="submit-report"][data-id="${t.id}"]`),n=e.querySelectorAll(`[data-action="toggle-report"][data-id="${t.id}"]`);n.forEach(o=>{o.addEventListener("click",()=>{s?.classList.toggle("hidden")})}),r?.addEventListener("click",async()=>{const o=a?.value;if(!o){i&&(i.textContent="\u7406\u7531\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",i.className="report-message is-error");return}r.disabled=!0,i&&(i.textContent="\u9001\u4FE1\u4E2D...",i.className="report-message");try{const{error:l}=await window._db.from(window.SUPABASE_TABLES.ENGLISH_IDIOMS).update({corruption_istrue:!0,corruption_reason:o}).eq("id",t.id);if(l)throw l;i&&(i.textContent="\u5831\u544A\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3057\u305F\uFF01",i.className="report-message is-success"),a&&(a.disabled=!0),n.forEach(c=>c.disabled=!0)}catch{i&&(i.textContent="\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",i.className="report-message is-error"),r.disabled=!1}})}function _esc(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
