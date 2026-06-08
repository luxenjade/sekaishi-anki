(function(){const u="qz-table-input";let n=[];window.showTableInput=function(e){const t=e.mountId??u,l=document.getElementById(t);if(!l){console.error(`showTableInput: #${t} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093`);return}n=[];const d=e.headerKey??"name",h=e.tableRows.map(s=>{const o=s.key===d,c=e.blankKeys.includes(s.key);return{rowDef:s,isHeader:o,isBlank:c}}).map(({rowDef:s,isHeader:o,isBlank:c})=>{const p=o?' class="qz-tbl-row--header"':"",q=`<th class="qz-tbl-th" scope="row">${a(s.label)}</th>`;let r;return o?r=`<td class="qz-tbl-td qz-tbl-td--name">${a(e.formatCell(s.key,e.row))}</td>`:c?r=`<td class="qz-tbl-td qz-tbl-td--blank">
            <input
              class="qz-tbl-input"
              type="text"
              placeholder="\u2026"
              data-key="${a(s.key)}"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            >
          </td>`:r=`<td class="qz-tbl-td qz-tbl-td--fixed">${a(e.formatCell(s.key,e.row))}</td>`,`<tr${p}>${q}${r}</tr>`}).join("");l.innerHTML=`
      <div class="qz-tbl-wrap">
        <table class="qz-tbl">
          <tbody>${h}</tbody>
        </table>
      </div>
    `,l.querySelectorAll(".qz-tbl-input").forEach(s=>{n.push(s),s.addEventListener("input",()=>y(s,e)),s.addEventListener("keydown",o=>f(o,s,e))}),n.length>0?setTimeout(()=>n[0].focus(),60):i(e)},window.lockTableInput=function(e=u){const t=document.getElementById(e);t&&t.querySelectorAll(".qz-tbl-input").forEach(l=>{l.disabled=!0})};function y(e,t){if(e.disabled)return;const l=e.value;if(!l){e.className="qz-tbl-input";return}t.isCorrect(e.dataset.key,l,t.row)?(e.classList.add("is-correct"),e.disabled=!0,b(e),m(t)):e.classList.remove("is-correct")}function f(e,t,l){e.key!=="Enter"&&e.key!=="Tab"||(e.preventDefault(),b(t))}function b(e){const t=n.indexOf(e),l=n.slice(t+1).find(d=>!d.disabled);l&&l.focus()}function m(e){n.every(l=>l.disabled)&&i(e)}function i(e){e.onComplete?e.onComplete():window.enableNextButton?.()}function a(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}})();
