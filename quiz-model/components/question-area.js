(function(){const i="qz-question-area";window.showQuestion=function(e,s=i){const r=document.getElementById(s);if(!r){console.error(`showQuestion: #${s} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}const c=e.category?`<span class="qz-category-chip">${t(e.category)}</span>`:"",o=e.imageUrl?`<img class="qz-question-image" src="${t(e.imageUrl)}"
              alt="${t(e.imageAlt??"\u554F\u984C\u753B\u50CF")}">`:"",n=e.sub?`<p class="qz-question-sub">${t(e.sub)}</p>`:"",u=e.template?l(e.template,e.vars??{}):`<p class="qz-question-text">${t(e.text??"")}</p>`;r.innerHTML=`
      <div class="qz-question">
        ${c}
        ${o}
        ${u}
        ${n}
      </div>
    `};function l(e,s){return`<p class="qz-question-text">${e.replace(/\{\{(\w+)\}\}/g,(c,o)=>{const n=s[o];return n==null?"":typeof n=="object"&&n.strong?`<strong class="qz-q-em">${t(String(n.value??""))}</strong>`:t(String(n))})}</p>`}function t(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
