// assets/js/auth.js
(function () {
    if (typeof window === "undefined" || !window.CONFIG) {
      console.error("[Auth] ⚠️ window.CONFIG chưa được định nghĩa. Hãy nạp config.js trước auth.js");
      return;
    }
    const CFG = window.CONFIG;
    const log = (...args) => CFG.DEBUG && console.log("[Auth]", ...args);
  
    function buildUrl(action, extraQuery) {
      const u = new URL(CFG.API_BASE); // VD: http://localhost:3000/public/index.php
      u.searchParams.set("path", CFG.PATHS.AUTH || "auth");
      if (action) u.searchParams.set("action", action);
      if (extraQuery && typeof extraQuery === "object") {
        Object.entries(extraQuery).forEach(([k, v]) => {
          if (v !== undefined && v !== null) u.searchParams.set(k, v);
        });
      }
      return u.toString();
    }
  
    function getCSRFToken() {
      const m = document.querySelector('meta[name="csrf-token"]');
      return m ? m.getAttribute("content") : null;
    }
  
    async function request(action, {
      method = "GET",
      data = null,
      query = null,
      headers = {},
      withCredentials = true, // 👈 thêm flag
    } = {}) {
      const url = buildUrl(action, query);
      const opts = {
        method,
        credentials: withCredentials ? "include" : "omit", // 👈 tùy biến
        headers: { Accept: "application/json", ...headers },
      };
  
      const csrf = getCSRFToken();
      if (csrf) opts.headers["X-CSRF-TOKEN"] = csrf;
  
      if (data instanceof FormData) {
        opts.body = data;
      } else if (data != null) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(data);
      }
  
      log(method, url, { withCredentials, body: data });
  
      const res = await fetch(url, opts);
      const ctype = res.headers.get("content-type") || "";
      const payload = ctype.includes("application/json") ? await res.json() : await res.text();
  
      if (!res.ok) {
        const msg = typeof payload === "string" ? payload : (payload?.message || payload?.error || `HTTP ${res.status}`);
        throw new Error(msg);
      }
      if (payload && typeof payload === "object" && payload.status === "error") {
        throw new Error(payload.message || "Yêu cầu không thành công");
      }
      return payload;
    }
  
    const STORAGE_KEY = (CFG.STORAGE_KEYS && CFG.STORAGE_KEYS.USER) || "user";
    const listeners = new Set();
    const getUser = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; } };
    function setUser(u) {
      if (u == null) localStorage.removeItem(STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      listeners.forEach(cb => { try { cb(getUser()); } catch {} });
    }
  
    const Auth = {
      get user() { return getUser(); },
      isLoggedIn() { return !!getUser(); },
      role() { return (getUser() || {}).vai_tro || null; },
      is(role) { const u = getUser(); return !!u && (!role || (u.vai_tro === role)); },
      onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
  
      async login({ email, password, identifier } = {}) {
        const payload = identifier ? { identifier, password } : { email, password };
        const data = await request("login", { method: "POST", data: payload, withCredentials: true });
        const user = data?.user || data?.data || null;
        if (!user) throw new Error("Không nhận được thông tin người dùng");
        setUser(user);
        return user;
      },
  
      async logout() {
        try { await request("logout", { method: "POST", withCredentials: true }); } catch (e) { log("logout warn:", e.message); }
        setUser(null);
      },
  
      async me() {
        const data = await request("me", { method: "GET", withCredentials: true });
        const user = data?.user || (data?.vai_tro ? data : null) || null;
        if (user) setUser(user);
        return user;
      },
  
      async registerBenhNhan(form) {
        // 👇 Không cần session → không gửi cookie để tránh SameSite ở môi trường dev
        return await request("registerBenhNhan", { method: "POST", data: form, withCredentials: false });
      },
  
      async registerBacSi(form) {
        // Thao tác này yêu cầu ADMIN đã đăng nhập → cần cookie session
        return await request("registerBacSi", { method: "POST", data: form, withCredentials: true });
      },
  
      ensureLoggedIn(redirect = "#/login") {
        if (!this.isLoggedIn()) { window.location.hash = redirect; return false; }
        return true;
      },
      ensureRole(role, redirect = "#/login") {
        const u = getUser();
        if (!u || u.vai_tro !== role) { window.location.hash = redirect; return false; }
        return true;
      },
    };
  
    window.Auth = Auth;
    try { globalThis.Auth = Auth; } catch {}
  })();
  