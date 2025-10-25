// assets/js/logout.js
(function () {
  // ===== Config =====
  const CFG = window.CONFIG || {};
  const API_BASE = CFG.API_BASE || "/index.php";
  const PATHS = CFG.PATHS || { AUTH: "auth" };
  const KEYS = CFG.STORAGE_KEYS || { USER: "user" };
  const DEBUG = !!CFG.DEBUG;
  const log = (...a) => DEBUG && console.log("[logout]", ...a);

  const $ = (s, r = document) => r.querySelector(s);

  // ===== Utils =====
  function getHeaderEl() {
    return document.getElementById("header_patient") || document.getElementById("header");
  }

  function getGuestUrl() {
    const h = getHeaderEl();
    return (h && h.getAttribute("data-guest-url")) || "./components/header_guest.html";
  }

  // ===== API helper =====
  async function api(pathKey, action, { method = "GET", data = null } = {}) {
    const path = PATHS[pathKey] || pathKey;
    const u = new URL(API_BASE);
    u.searchParams.set("path", path);
    if (action) u.searchParams.set("action", action);

    const opts = {
      method,
      credentials: "include",
      headers: { Accept: "application/json" },
    };
    if (data) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(data);
    }

    try {
      const res = await fetch(u.toString(), opts);
      const ctype = res.headers.get("content-type") || "";
      const payload = ctype.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return payload;
    } catch (e) {
      log("API lỗi:", e.message);
      return { status: "error", message: e.message };
    }
  }

  // ===== Greeting =====
  let isUpdatingGreeting = false;
  async function setGreeting() {
    if (isUpdatingGreeting) return;
    isUpdatingGreeting = true;

    const el = $("#userGreeting");
    if (!el) {
      isUpdatingGreeting = false;
      return;
    }

    try {
      const cached = localStorage.getItem(KEYS.USER || "user");
      if (cached) {
        const u = JSON.parse(cached);
        const name = u.ho_ten || u.name || u.email || "bạn";
        el.textContent = `Xin chào, ${name} 👋`;
        isUpdatingGreeting = false;
        return;
      }

      const me = await api("AUTH", "me", { method: "GET" });
      if (me?.status === "ok" && me.user) {
        const name = me.user.ho_ten || me.user.name || me.user.email || "bạn";
        el.textContent = `Xin chào, ${name} 👋`;
        localStorage.setItem(KEYS.USER || "user", JSON.stringify(me.user));
      } else {
        el.textContent = "Xin chào 👋";
      }
    } catch (e) {
      log("setGreeting lỗi:", e.message);
      el.textContent = "Xin chào 👋";
    } finally {
      setTimeout(() => (isUpdatingGreeting = false), 300);
    }
  }

  // ===== Active link =====
  function updateActiveLink() {
    const cur = window.location.hash || "#/";
    document.querySelectorAll(".nav-link").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const isActive = cur === href || (href !== "#/" && cur.startsWith(href));
      a.classList.toggle("active", isActive);
      a.classList.toggle("text-primary", isActive);
      a.classList.toggle("font-semibold", isActive);
    });
  }

  // ===== Mobile nav =====
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

  // ===== Logout =====
  async function doLogout() {
    log("Đang logout...");
    try {
      await api("AUTH", "logout", { method: "POST" });
    } catch (e) {
      log("API logout lỗi:", e.message);
    }

    try {
      localStorage.removeItem(KEYS.USER || "user");
    } catch (_) {}

    if (typeof window.swapHeaderByRoleKey === "function") {
      await window.swapHeaderByRoleKey(null);
    } else {
      const headerContainer = document.getElementById("header");
      const guestUrl = getGuestUrl();
      try {
        const res = await fetch(
          guestUrl + (guestUrl.includes("?") ? "&" : "?") + "v=" + Date.now(),
          { cache: "no-store" }
        );
        const html = await res.text();
        if (headerContainer) headerContainer.innerHTML = html;
      } catch (e) {
        console.error("[Logout] Không load được header_guest:", e);
      }
    }

    window.location.hash = "#/login";
    if (typeof window.renderPage === "function") window.renderPage();
  }

  // ===== Event bindings =====
  function bindLogoutDelegation() {
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("#logoutBtn");
      if (!btn) return;
      ev.preventDefault();
      doLogout();
    });
  }

  // ===== DOM watcher =====
  function watchHeaderChanges() {
    const mo = new MutationObserver(() => {
      if (!isUpdatingGreeting && document.getElementById("userGreeting")) setGreeting();
      updateActiveLink();
      bindMobileNav();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ===== Bootstrap =====
  function init() {
    log("Khởi tạo logout.js");
    setGreeting();
    updateActiveLink();
    bindMobileNav();
    bindLogoutDelegation();
    watchHeaderChanges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("hashchange", updateActiveLink);
})();
