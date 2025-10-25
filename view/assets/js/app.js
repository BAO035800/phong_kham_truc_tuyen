/** Minimal hash router (SPA)
 * - Chỉ xử lý routing + nạp header/footer
 * - Guard dựa theo user.vai_tro: BENHNHAN | BACSI | ADMIN
 */

const $ = (s, r = document) => r.querySelector(s);

/* ----------------- partial loader ----------------- */
async function loadPartial(selector, url) {
  const el = $(selector);
  if (!el) return;
  try {
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Không thể tải: ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="text-center text-red-600 p-3">Lỗi tải ${url}</div>`;
  }
}

/* ----------------- header theo vai trò (đúng path) ----------------- */
function headerUrlByRole(roleKey) {
  if (roleKey === "admin")   return "./components/header_admin.html";
  if (roleKey === "doctor")  return "./components/header_doctor.html";
  if (roleKey === "patient") return "./components/header_patient.html";
  return "./components/header_guest.html";
}
function toHeaderRole(user) {
  const v = user?.vai_tro;
  if (v === "ADMIN")    return "admin";
  if (v === "BACSI")    return "doctor";
  if (v === "BENHNHAN") return "patient";
  return null;
}
async function swapHeaderByRoleKey(roleKey) {
  await loadPartial("#header", headerUrlByRole(roleKey));
}

/* ----------------- routes (hash → file) ----------------- */
const ROUTES = {
  "#/": "./pages/home.html",
  "#/home": "./pages/home.html",
  "#/login": "./pages/login.html",
  "#/register": "./pages/register.html",
  "#/booking": "./pages/booking.html",
  "#/schedule": "./pages/schedule.html",
  "#/doctors": "./pages/doctors.html",
  "#/services": "./pages/services.html",
  "#/contact": "./pages/contact.html",
  "#/confirm": "./pages/confirm.html",
  // Bác sĩ
  "#/doctor-dashboard": "./pages/doctor_dashboard.html",
  "#/doctor-availability": "./pages/doctor_availability.html",
  "#/patients": "./pages/patients.html",
  // Chung
  "#/statistics": "./pages/statistics.html",
  "#/settings": "./pages/settings.html",
  // Admin
  "#/admin": "./pages/admin_dashboard.html",
  "#/admin/doctors": "./pages/admin_doctors.html",
  "#/admin/services": "./pages/admin_services.html",
  "#/admin/patients": "./pages/admin_patients.html",
};

/* ----------------- guards ----------------- */
const LOGIN_REQUIRED = new Set(["#/booking", "#/schedule", "#/statistics", "#/settings"]);
const ROLE_REQUIRED = {
  doctor: new Set(["#/doctor-dashboard", "#/doctor-availability", "#/patients"]),
  admin:  new Set(["#/admin", "#/admin/doctors", "#/admin/services", "#/admin/patients"]),
};

function normalizeHash(hash) {
  if (!hash) return "#/";
  const base = hash.split("?")[0]; // bỏ query ?token=...
  return base || "#/";
}
function resolveFile(hash) {
  const base = normalizeHash(hash);
  return ROUTES[base] || ROUTES["#/"];
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}
function isDoctor(user) { return user?.vai_tro === "BACSI"; }
function isAdmin(user)  { return user?.vai_tro === "ADMIN"; }

function checkAccess(hash, user) {
  const base = normalizeHash(hash);
  if (LOGIN_REQUIRED.has(base) && !user) return { allowed: false, reason: "login" };
  if (ROLE_REQUIRED.doctor.has(base) && !isDoctor(user)) return { allowed: false, reason: "doctor" };
  if (ROLE_REQUIRED.admin.has(base)  && !isAdmin(user))  return { allowed: false, reason: "admin" };
  return { allowed: true };
}

/* ----------------- optional page hooks ----------------- */
// Sau khi load trang, gọi hàm init nếu có
function runPageHook(hashBase) {
  if (hashBase === "#/register" && typeof window.setupRegisterPage === "function") {
    window.setupRegisterPage();
  }
  if (hashBase === "#/login" && typeof window.setupLoginPage === "function") {
    window.setupLoginPage();
  }
  if (hashBase === "#/confirm" && typeof window.setupConfirmPage === "function") {
    window.setupConfirmPage();
  }
  // Thêm các hook khác nếu bạn tạo file JS riêng cho từng page...
}

/* ----------------- renderer ----------------- */
async function renderPage() {
  const root = $("#view-root");
  if (!root) return;

  const user = getCurrentUser();
  const hash = window.location.hash || "#/";
  const base = normalizeHash(hash);
  const access = checkAccess(hash, user);

  if (!access.allowed) {
    if (access.reason === "login") {
      root.innerHTML = `
        <div class="text-center py-10 text-gray-600">
          🚫 Vui lòng <a href="#/login" class="text-blue-600 underline">đăng nhập</a> để tiếp tục.
        </div>`;
      return;
    }
    if (access.reason === "doctor") {
      root.innerHTML = `
        <div class="text-center py-10 text-gray-600">
          ⚠️ Chỉ bác sĩ mới được truy cập trang này.
        </div>`;
      return;
    }
    if (access.reason === "admin") {
      root.innerHTML = `
        <div class="text-center py-10 text-gray-600">
          ⚠️ Chỉ Admin mới truy cập trang này.
        </div>`;
      return;
    }
  }

  const file = resolveFile(hash);
  try {
    const res = await fetch(`${file}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Không thể tải ${file}`);
    root.innerHTML = await res.text();

    // gọi hook page nếu có
    runPageHook(base);

    // refresh AOS nếu có
    if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 300);
  } catch (err) {
    console.error(err);
    root.innerHTML = `
      <section class="container mx-auto max-w-xl text-center py-12">
        <h2 class="text-xl font-semibold text-red-600 mb-2">Lỗi tải trang</h2>
        <p class="text-gray-600 mb-4">${file}</p>
        <a href="#/" class="text-blue-600 underline">Quay lại trang chủ</a>
      </section>`;
  }
}

/* ----------------- bootstrap ----------------- */
async function initApp() {
  await loadPartial("#footer", "./components/footer.html");

  const user = getCurrentUser();
  await swapHeaderByRoleKey(toHeaderRole(user));

  if (window.Auth?.onChange) {
    Auth.onChange((u) => swapHeaderByRoleKey(toHeaderRole(u)));
  }

  window.addEventListener("hashchange", renderPage);
  await renderPage();
}
initApp();
