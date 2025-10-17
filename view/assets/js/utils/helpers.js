const helpers = {
  escapeHTML: (str)=> String(str??"").replace(/[&<>"'`=\/]/g, s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"
  })[s]),
  money: (n)=> new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(Number(n||0)),
  toast: (msg, type="info")=>{
    const div = document.createElement("div");
    div.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    div.setAttribute("role","status"); div.setAttribute("aria-live","polite");
    div.innerHTML = `<div class="d-flex"><div class="toast-body">${helpers.escapeHTML(msg)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
    document.body.appendChild(div);
    const t = new bootstrap.Toast(div, {delay:2500}); t.show();
    div.addEventListener("hidden.bs.toast", ()=> div.remove());
  },
  // naively detect overlaps (HH:mm strings)
  overlaps: (start1, end1, start2, end2)=>{
    const toMin = s=>{const [h,m]=s.split(":").map(Number); return h*60+m;};
    const a1=toMin(start1), b1=toMin(end1), a2=toMin(start2), b2=toMin(end2);
    return Math.max(a1,a2) < Math.min(b1,b2);
  }
};
