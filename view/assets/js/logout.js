(function () {
  // ====== Config ======
  const CFG = window.CONFIG || {};
  const API_BASE = CFG.API_BASE || "/index.php";
  const PATHS    = CFG.PATHS    || { AUTH: "auth" };
  const KEYS     = (CFG.STORAGE_KEYS) || { USER: "user" };
  const DEBUG    = !!CFG.DEBUG;
  const log = (...a) => DEBUG && console.log("[logout]", ...a);

  // ====== Utils ======
  const $ = (s, r=document) => r.querySelector(s);

  function getHeaderEl() {
    // Hỗ trợ cả container #header (router sẽ inject) và #header_patient (file tĩnh)
    return document.getElementById("header_patient") || document.getElementById("header");
  }

  function getGuestUrl() {
    const h = getHeaderEl();
    // Ưu tiên data-guest-url trên header; fallback tương đối với /view/
    return (h && h.getAttribute("data-guest-url")) || "./components/header_guest.html";
  }

  async function api(pathKey, action, { method="GET", data=null } = {}) {
    const path = PATHS[pathKey] || pathKey;
    const u = new URL(API_BASE, window.location.origin);
    u.searchParams.set("path", path);
    if (action) u.searchParams.set("action", action);

    const opts = {
      method,
      credentials: "include", // gửi cookie session
      headers: { "Accept": "application/json" },
    };
    if (data) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(data);
    }

    const res = await fetch(u.toString(), opts);
    const ctype = res.headers.get("content-type") || "";
    const payload = ctype.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = typeof payload === "string" ? payload : (payload?.message || `HTTP ${res.status}`);
      throw new Error(msg);
    }
    return payload;
  }

  // ====== Greeting ======
  async function setGreeting() {
    const el = $("#userGreeting");
    if (!el) return;

    // Thử BE trước (chuẩn session)
    try {
      const me = await api("AUTH", "me", { method: "GET" });
      if (me?.status === "ok" && me.user) {
        const name = me.user.ho_ten || me.user.name || me.user.email || "bạn";
        el.textContent = `Xin chào, ${name} 👋`;
        try { localStorage.setItem(KEYS.USER || "user", JSON.stringify(me.user)); } catch (_) {}
        return;
      }
    } catch (e) {
      log("me() fallback localStorage", e?.message);
    }

    // Fallback localStorage
    try {
      const raw = localStorage.getItem(KEYS.USER || "user");
      const u = raw ? JSON.parse(raw) : null;
      if (u) {
        const name = u.ho_ten || u.name || u.email || "bạn";
        el.textContent = `Xin chào, ${name} 👋`;
        return;
      }
    } catch (_) {}
    el.textContent = "Xin chào 👋";
  }

  // ====== Active link ======
  function currentHash() {
    const h = window.location.hash || "";
    if (h.startsWith("?#")) return "#" + h.slice(2);
    return h || "#/";
  }
  function setActiveLink() {
    const cur = currentHash();
    document.querySelectorAll(".nav-link").forEach(a => {
      const href = a.getAttribute("href") || "";
      const isActive = cur === href || (href !== "#/" && cur.startsWith(href));
      a.classList.toggle("active", isActive);
    });
  }

  // ====== Mobile nav ======
  function bindMobileNav() {
    const btn = document.querySelector('[data-toggle="mobile-nav"]');
    const nav = document.getElementById("navMain");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const isOpen = !nav.classList.contains("hidden");
      nav.classList.toggle("hidden", isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // ====== Logout ======
  async function doLogout() {
    log("doLogout()");
    // 1) API logout (xoá session server)
    try {
      await api("AUTH", "logout", { method: "POST" });
    } catch (e) {
      log("API logout lỗi (bỏ qua):", e?.message);
    }

    // 2) Xoá cache FE
    try { localStorage.removeItem(KEYS.USER || "user"); } catch (_) {}

    // 3) Nếu app router có sẵn swapHeaderByRoleKey → dùng (đổi header về guest)
    if (typeof window.swapHeaderByRoleKey === "function") {
      await window.swapHeaderByRoleKey(null); // null → guest
    } else {
      // Fallback: nạp HTML guest và thay vào #header / #header_patient
      const headerContainer = document.getElementById("header"); // router container
      const guestUrl = getGuestUrl();
      try {
        const res = await fetch(guestUrl + (guestUrl.includes("?") ? "&" : "?") + "v=" + Date.now(), { cache: "no-store" });
        const html = await res.text();
        if (headerContainer) {
          headerContainer.innerHTML = html;
        } else {
          const hp = document.getElementById("header_patient");
          if (hp) hp.outerHTML = html;
        }
      } catch (e) {
        console.error("[Logout] Không load được header_guest:", e);
      }
    }

    // 4) Điều hướng login + render
    window.location.hash = "#/login";
    if (typeof window.renderPage === "function") window.renderPage();
  }

  // Dùng event delegation để luôn bắt được click dù header được thay động
  function bindLogoutDelegation() {
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("#logoutBtn");
      if (!btn) return;
      ev.preventDefault();
      doLogout();
    });
  }

  // Theo dõi DOM: khi header mới render → set greeting & active
  function watchHeaderChanges() {
    const mo = new MutationObserver(() => {
      if (document.getElementById("userGreeting")) setGreeting();
      setActiveLink();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ====== Bootstrap ======
  function init() {
    setGreeting();
    setActiveLink();
    bindMobileNav();
    bindLogoutDelegation();
    watchHeaderChanges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("hashchange", setActiveLink);
})();
