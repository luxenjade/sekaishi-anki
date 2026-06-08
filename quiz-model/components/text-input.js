(function(){const a="qz-text-input";let o=!1;window.showTextInput=function(t){const e=t.mountId??a,r=document.getElementById(e);if(!r){console.error(`showTextInput: #${e} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}o=!1;const n=t.inputType??"number",s=t.label??"\u5E74\u3092\u5165\u529B",q=t.placeholder??(n==="number"?"\u4F8B: 1789":""),p=t.hint??"",d=t.maxLength??"";r.innerHTML=`
      <div class="qz-input-wrap">
        <label class="qz-input-label" for="qz-answer-input">${i(s)}</label>
        <div class="qz-input-row">
          <input
            class="qz-answer-input"
            id="qz-answer-input"
            type="text"
            inputmode="${n==="number"?"numeric":"text"}"
            placeholder="${i(q)}"
            ${d?`maxlength="${d}"`:""}
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          >
          <button class="qz-btn qz-btn--primary qz-btn--sm" id="qz-submit-btn" type="button">
            \u56DE\u7B54\u3059\u308B
          </button>
        </div>
        ${p?`<p class="qz-input-hint">${i(p)}</p>`:""}
        <p class="qz-input-error" id="qz-input-error"></p>
      </div>
    `;const u=r.querySelector("#qz-answer-input"),l=r.querySelector("#qz-submit-btn");u.focus(),l.addEventListener("click",()=>c(t,u,l)),u.addEventListener("keydown",w=>{w.key==="Enter"&&c(t,u,l)})},window.lockTextInput=function(t=a){const e=document.querySelector(`#${t} #qz-answer-input`),r=document.querySelector(`#${t} #qz-submit-btn`);e&&(e.disabled=!0,e.classList.add("is-locked")),r&&(r.disabled=!0)};function c(t,e,r){if(o)return;const n=e.value.trim(),s=t.validate?t.validate(n):{ok:!!n,value:n};if(!s.ok){m(s.message??"\u5165\u529B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044"),e.focus();return}o=!0,b(),window.lockTextInput?.(t.mountId),window.enableNextButton?.(),t.onAnswer&&t.onAnswer({rawValue:n,value:s.value,isCorrect:s.isCorrect??!1})}function m(t){const e=document.getElementById("qz-input-error");e&&(e.textContent=t,e.classList.add("is-visible"))}function b(){const t=document.getElementById("qz-input-error");t&&(t.textContent="",t.classList.remove("is-visible"))}function i(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
