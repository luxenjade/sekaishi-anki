(function(){let e=null,d=null,t=null;function n(){e||(e=document.createElement("div"),e.className="qz-modal hidden",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`
      <div class="qz-modal__panel">
        <div class="qz-modal__header">
          <span class="qz-modal__title"></span>
          <button
            class="qz-btn qz-btn--ghost qz-btn--sm qz-modal__close"
            type="button"
            aria-label="\u9589\u3058\u308B"
          >
            \u2715
          </button>
        </div>
        <div class="qz-modal__body"></div>
      </div>
    `,document.body.appendChild(e),d=e.querySelector(".qz-modal__title"),t=e.querySelector(".qz-modal__body"),e.addEventListener("click",l=>{l.target===e&&closeQuizModal()}),e.querySelector(".qz-modal__close").addEventListener("click",closeQuizModal),document.addEventListener("keydown",l=>{l.key==="Escape"&&e&&!e.classList.contains("hidden")&&closeQuizModal()}))}window.openQuizModal=function({title:l="",html:i="",className:o=""}){n(),e.className="qz-modal",o&&e.classList.add(o),d.textContent=l,t.innerHTML=i,e.classList.remove("hidden"),document.body.style.overflow="hidden"},window.closeQuizModal=function(){e&&(e.classList.add("hidden"),t.innerHTML="",document.body.style.overflow="")}})();
