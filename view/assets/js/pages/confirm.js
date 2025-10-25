// /view/assets/js/pages/confirm.js
(function(){
    const CFG = window.CONFIG;
    const $ = (s,r=document)=>r.querySelector(s);
  
    function getTokenFromHash(){
      const q = (window.location.hash.split("?")[1] || "");
      return new URLSearchParams(q).get("token");
    }
  
    async function api(pathKey, action, { method="GET", query={}, data=null } = {}){
      const u = new URL(CFG.API_BASE);
      u.searchParams.set("path", CFG.PATHS[pathKey] || pathKey);
      if (action) u.searchParams.set("action", action);
      Object.entries(query).forEach(([k,v])=>u.searchParams.set(k,v));
      const opts = { method, credentials:"include", headers:{ Accept:"application/json" } };
      if (data){ opts.headers["Content-Type"]="application/json"; opts.body = JSON.stringify(data); }
  
      const res = await fetch(u.toString(), opts);
      const isJson = (res.headers.get("content-type")||"").includes("application/json");
      const payload = isJson ? await res.json() : await res.text();
      try { $("#rawBox").textContent = isJson ? JSON.stringify(payload,null,2) : String(payload); } catch(_){}
  
      if (!res.ok) throw new Error((isJson? payload?.message : String(payload)) || `HTTP ${res.status}`);
      if (isJson && payload?.status === "error") throw new Error(payload.message || "Yêu cầu thất bại");
      return payload;
    }
  
    // được router gọi sau khi confirm.html được inject
    window.setupConfirmPage = async function(){
      const msg  = $("#confirmMsg");
      const tbox = $("#tokenBox");
      const back = $("#backLink");
  
      const token = getTokenFromHash();
      if (tbox) tbox.textContent = token || "(không có)";
      if (!token){ msg.textContent = "❌ Thiếu token."; msg.className="text-red-600 mb-4"; return; }
  
      try{
        msg.textContent = "⏳ Đang xác nhận lịch hẹn...";
        const r = await api("APPOINTMENT", "xacNhanQuaEmail", { method:"GET", query:{ token } });
        msg.textContent = r?.message || "✅ Đã xác nhận. Chờ bác sĩ duyệt.";
        msg.className = "text-green-600 mb-4";
        back && back.classList.remove("hidden");
      }catch(e){
        msg.textContent = "❌ " + e.message;
        msg.className = "text-red-600 mb-4";
      }
    };
  })();
  