// assets/js/auth.js
(function () {
  // ----- Ngăn khởi tạo trùng lặp -----
  if (window.__AUTH_INIT__) {
    console.warn("[Auth] Đã được khởi tạo trước đó, bỏ qua lần nạp lại.");
    return;
  }
  window.__AUTH_INIT__ = true;

  // ----- Kiểm tra config -----
  if (typeof window === "undefined" || !window.CONFIG) {
    console.error("[Auth] ⚠️ window.CONFIG chưa được định nghĩa. Hãy nạp config.js trước auth.js");
    return;
  }

  const CFG = window.CONFIG;

  // ====== Debug helpers ======
  const DEBUG = !!CFG.DEBUG;
  const DEBUG_VERBOSE = !!CFG.DEBUG_VERBOSE;

  const log = (...args) => DEBUG && console.log("[Auth]", ...args);
  const warn = (...args) => DEBUG && console.warn("[Auth]", ...args);
  const err = (...args) => console.error("[Auth]", ...args); // lỗi luôn in ra

  function nowTs() {
    return (performance && performance.now ? performance.now() : Date.now());
  }

  // Rút gọn object để log (tránh log token, data lớn)
  function brief(obj, maxLen = 300) {
    try {
      const s = JSON.stringify(obj);
      if (s.length <= maxLen) return obj;
      return JSON.parse(s.slice(0, maxLen) + `… (${s.length} chars)`);
    } catch {
      return obj;
    }
  }

  function maybeStack() {
    if (!DEBUG_VERBOSE) return undefined;
    try {
      // Bỏ dòng đầu "Error"
      const st = (new Error().stack || "").split("\n").slice(2).join("\n");
      return st;
    } catch { return undefined; }
  }

  // ====== URL builder ======
  function buildUrl(action, extraQuery) {
    const u = new URL(CFG.API_BASE); // vd: http://localhost:8000/public/index.php
    u.searchParams.set("path", (CFG.PATHS && CFG.PATHS.AUTH) || "auth");
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

  // ====== De-dup inflight requests (tránh gọi trùng) ======
  // Key = method|url|body-hash (thô sơ đủ dùng cho SPA)
  const inflight = new Map();
  function inflightKey(method, url, body) {
    let b = "";
    if (body && typeof body === "string") b = body.slice(0, 200);
    return `${method}|${url}|${b}`;
  }

  // ====== Core request ======
  async function request(action, {
    method = "GET",
    data = null,
    query = null,
    headers = {},
    withCredentials = true, // gửi cookie session
  } = {}) {
    const url = buildUrl(action, query);

    const opts = {
      method,
      credentials: withCredentials ? "include" : "omit",
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

    const key = inflightKey(method, url, typeof opts.body === "string" ? opts.body : "");
    if (inflight.has(key)) {
      log("⏳ Dedupe request (đang chờ):", method, url);
      return inflight.get(key);
    }

    const started = nowTs();
    DEBUG && console.groupCollapsed?.(`[Auth] ${method} ${url}`);
    DEBUG && console.log("opts:", { ...opts, body: brief(data) });
    const stack = maybeStack();
    stack && console.log("stack:\n" + stack);

    const p = (async () => {
      try {
        const res = await fetch(url, opts);
        const ctype = res.headers.get("content-type") || "";
        const isJSON = ctype.includes("application/json");
        const payload = isJSON ? await res.json() : await res.text();

        const ms = Math.round(nowTs() - started);
        DEBUG && console.log(`↩︎ response (${ms}ms):`, {
          status: res.status,
          ok: res.ok,
          json: isJSON ? brief(payload) : "[text]",
        });

        if (!res.ok) {
          const msg = typeof payload === "string"
            ? payload
            : (payload?.message || payload?.error || `HTTP ${res.status}`);
          throw new Error(msg);
        }
        if (payload && typeof payload === "object" && payload.status === "error") {
          throw new Error(payload.message || "Yêu cầu không thành công");
        }
        return payload;
      } catch (e) {
        err("❌ request error:", e.message);
        throw e;
      } finally {
        DEBUG && console.groupEnd?.();
        inflight.delete(key);
      }
    })();

    inflight.set(key, p);
    return p;
  }

  // ====== Local storage user ======
  const STORAGE_KEY = (CFG.STORAGE_KEYS && CFG.STORAGE_KEYS.USER) || "user";
  const listeners = new Set();
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  };
  function setUser(u) {
    if (u == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    // Thông báo thay đổi
    listeners.forEach(cb => { try { cb(getUser()); } catch {} });
  }

  // ====== Public API ======
  const Auth = {
    get user() { return getUser(); },
    isLoggedIn() { return !!getUser(); },
    role() { return (getUser() || {}).vai_tro || null; },
    is(role) { const u = getUser(); return !!u && (!role || (u.vai_tro === role)); },

    onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },

    async login({ email, password, identifier } = {}) {
      const payload = identifier ? { identifier, password } : { email, password };
      log("🔐 login payload:", brief(payload));
      const data = await request("login", { method: "POST", data: payload, withCredentials: true });
      const user = data?.user || data?.data || null;
      if (!user) throw new Error("Không nhận được thông tin người dùng");
      setUser(user);
      return user;
    },

    async logout() {
      try {
        await request("logout", { method: "POST", withCredentials: true });
      } catch (e) {
        warn("logout warn:", e.message);
      }
      setUser(null);
    },

    // Chống gọi /me trùng: nếu đang có request /me, dedupe ở tầng request()
    async me() {
      log("👤 me()");
      const data = await request("me", { method: "GET", withCredentials: true });
      const user = data?.user || (data?.vai_tro ? data : null) || null;
      if (user) setUser(user);
      return user;
    },

    async registerBenhNhan(form) {
      // Không cần session → không gửi cookie để tránh SameSite ở môi trường dev
      log("📝 registerBenhNhan()", brief(form));
      return await request("registerBenhNhan", { method: "POST", data: form, withCredentials: false });
    },

    async registerBacSi(form) {
      // Yêu cầu ADMIN đã đăng nhập → cần cookie
      log("🩺 registerBacSi()", brief(form));
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

  // Global expose
  window.Auth = Auth;
  try { globalThis.Auth = Auth; } catch {}

  // ----- Log khi init xong -----
  log("✅ auth.js initialized", {
    API_BASE: CFG.API_BASE,
    PATH: (CFG.PATHS && CFG.PATHS.AUTH) || "auth",
    DEBUG, DEBUG_VERBOSE,
  });

})();
