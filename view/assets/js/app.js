/** ✅ app.js — SPA Routing + Responsive Header + Phân Quyền **/
/** Yêu cầu: dùng cùng với config.js và settings.js mới nhất **/

/* ----------------- Helpers ----------------- */
async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Không thể tải: ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error("❌ loadPartial error:", err);
    el.innerHTML = `<div class="text-center text-red-600 py-3">Lỗi tải ${url}</div>`;
  }
}

/* ----------------- Header helpers ----------------- */
function headerUrlByRole(role) {
  switch (role) {
    case "admin": return "./components/header_admin.html";
    case "doctor": return "./components/header_doctor.html";
    case "patient": return "./components/header_patient.html";
    default: return "./components/header_guest.html";
  }
}

async function swapHeaderByRole(role) {
  await loadPartial("#header", headerUrlByRole(role));

  // 🟢 Reload header script
  setTimeout(() => {
    const existingScript = document.querySelector("script[data-header]");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = "./assets/js/header.js";
    script.defer = false;
    script.dataset.header = "true";
    document.body.appendChild(script);
  }, 200);

  setupTailwindNav();

  // 🟡 Lời chào & logout
  switch (role) {
    case "admin": setupAdminHeader(); break;
    case "doctor": setupDoctorHeader(); break;
    case "patient": setupPatientHeader(); break;
    default: setupGuestHeader(); break;
  }
}

/* ----------------- Router chính ----------------- */
async function renderPage() {
  const root = document.getElementById("view-root");
  const hash = window.location.hash || "#/";
  const route = hash.split("?")[0];

  const user = window.sessionUser || null;
  const role = user?.vai_tro?.toLowerCase() || "guest";

  /* 🔒 Quy tắc quyền truy cập */
  const accessRules = {
    admin: [
      "#/",
      "#/admin/doctors",
      "#/admin/services",
      "#/admin/patients",
      "#/admin/specialties", // ✅ thêm route chuyên khoa
      "#/admin/user",
    ],
    doctor: [
      "#/",
      "#/doctor-dashboard",
      "#/doctor-availability",
      "#/patients",
      "#/settings",
    ],
    patient: [
      "#/",
      "#/booking",
      "#/schedule",
      "#/contact",
      "#/settings",
      "#/doctors",
    ],
    guest: [
      "#/",
      "#/login",
      "#/register",
      "#/doctors",
      "#/contact",
      "#/services",
    ],
  };

  const allowed = accessRules[role] || [];
  if (!allowed.includes(route)) {
    console.warn(`🚫 Vai trò '${role}' không có quyền truy cập ${route}`);
    showToast("🚫 Bạn không có quyền truy cập trang này!", "warning");

    if (role === "admin") window.location.hash = "#/admin";
    else if (role === "doctor") window.location.hash = "#/doctor-dashboard";
    else if (role === "patient") window.location.hash = "#/schedule";
    else window.location.hash = "#/";
    return;
  }

  /* ✅ Hàm load page */
  async function loadPage(url) {
    try {
      const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Không thể tải trang");
      root.innerHTML = await res.text();
      if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
    } catch (err) {
      console.error(err);
      root.innerHTML = `<div class="text-center text-red-600 py-5">⚠️ Lỗi tải trang</div>`;
    }
  }

  /* ✅ Điều hướng route */
  switch (route) {
    // ----- Auth -----
    case "#/login":
      await loadPage("./pages/login.html");
      if (typeof setupLoginPage === "function") setupLoginPage();
      break;

    case "#/register": await loadPage("./pages/register.html"); break;

    // ----- Public -----
    case "#/booking": await loadPage("./pages/booking.html"); break;
    case "#/schedule": await loadPage("./pages/schedule.html"); break;
    case "#/doctors": await loadPage("./pages/doctors.html"); break;
    case "#/contact": await loadPage("./pages/contact.html"); break;
    case "#/services": await loadPage("./pages/services.html"); break;

    // ----- Doctor -----
    case "#/doctor-dashboard":
      await loadPage("./pages/doctor_dashboard.html");
      break;

    case "#/doctor-availability":
      await loadPage("./pages/doctor_availability.html");
      if (typeof setupDoctorAvailability === "function") setupDoctorAvailability();
      break;

    case "#/patients":
      await loadPage("./pages/patients.html");
      break;

    // ----- Settings -----
    case "#/settings":
      await loadPage("./pages/settings.html");
      if (typeof setupSettingsPage === "function") setupSettingsPage();
      break;

    // ----- Admin -----
    case "#/admin/doctors":
      await loadPage("./pages/admin_doctors.html");
      if (typeof setupAdminDoctorsPage === "function") setupAdminDoctorsPage();
      break;

    case "#/admin/services":
      await loadPage("./pages/admin_services.html");
      if (typeof setupAdminServicesPage === "function") setupAdminServicesPage();
      break;

    case "#/admin/patients":
      await loadPage("./pages/admin_patients.html");
      if (typeof setupAdminPatientsPage === "function") setupAdminPatientsPage();
      break;

    case "#/admin/specialties":
      await loadPage("./pages/admin_specialty.html");
      if (typeof setupAdminSpecialtyPage === "function") setupAdminSpecialtyPage();
      break;
      case "#/admin/user":
        await loadPage("./pages/admin_users.html");
        if (typeof setupAdminUsersPage === "function") setupAdminUsersPage();
        break;
      
    // ----- Statistics -----
    case "#/statistics":
      await loadPage("./pages/statistics.html");
      break;

    // ----- Confirm email -----
    case "#/confirm":
      await loadPage("./pages/confirm.html");
      const token = new URLSearchParams(hash.split("?")[1] || "").get("token");
      const msg = document.getElementById("confirmMessage");

      if (!token) {
        msg.innerHTML = `<div class="text-gray-600 text-center py-5">Không tìm thấy token trong liên kết xác nhận.</div>`;
        break;
      }

      try {
        const res = await apiRequest(
          `${API_ENDPOINTS.booking}&action=xacNhanQuaEmail&token=${encodeURIComponent(token)}`,
          "GET"
        );
        msg.innerHTML =
          res.status === "success"
            ? `<div class="text-green-600 text-center py-5 text-lg font-semibold">
                ✅ ${res.message}
              </div>
              <div class="text-center mt-4">
                <a href="#/" class="text-blue-600 underline hover:text-blue-800">Quay lại trang chủ</a>
              </div>`
            : `<div class="text-red-600 text-center py-5 text-lg font-semibold">
                ❌ ${res.message || "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."}
              </div>`;
      } catch (err) {
        msg.innerHTML = `<div class="text-center text-red-600 py-5">⚠️ Lỗi xác nhận lịch hẹn.</div>`;
      }
      break;

    // ----- Default -----
    default:
      await loadPage("./pages/home.html");
  }
}

/* ----------------- Header setup ----------------- */
function setupTailwindNav() {
  const nav = document.getElementById("navMain");
  if (!nav) return;
}

async function logoutAndRedirect() {
  try {
    await apiRequest(`${API_ENDPOINTS.auth}&action=logout`, "POST");
    window.sessionUser = null;
    await swapHeaderByRole("guest");
    window.location.hash = "#/login";
    await renderPage();
    showToast("👋 Bạn đã đăng xuất thành công", "success");
  } catch (err) {
    console.error("❌ Lỗi khi đăng xuất:", err);
    showToast("Lỗi khi đăng xuất", "error");
  }
}

/* 🧩 Header logic theo vai trò */
function setupPatientHeader() {
  const greet = document.getElementById("userGreeting");
  const btn = document.getElementById("logoutBtn");
  const user = window.sessionUser;
  if (user && greet) greet.textContent = `Xin chào, ${user.name || user.ten_dang_nhap} 👋`;
  btn?.addEventListener("click", logoutAndRedirect);
}

function setupDoctorHeader() {
  const greet = document.getElementById("doctorGreeting");
  const btn = document.getElementById("logoutBtnDoctor");
  const user = window.sessionUser;
  if (user && greet) greet.textContent = `Xin chào, ${user.name || user.ten_dang_nhap}`;
  btn?.addEventListener("click", logoutAndRedirect);
}

function setupAdminHeader() {
  const greet = document.getElementById("adminGreeting");
  const btn = document.getElementById("logoutBtnAdmin");
  const user = window.sessionUser;
  if (user && greet) greet.textContent = `Xin chào, ${user.name || user.ten_dang_nhap}`;
  btn?.addEventListener("click", logoutAndRedirect);
}

function setupGuestHeader() {
  const login = document.getElementById("loginLink");
  if (login) login.href = "#/login";
}

/* ----------------- Init ----------------- */
async function initApp() {
  await loadPartial("#footer", "./components/footer.html");

  try {
    const session = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
    let role = "guest";
    if (session.logged_in && session.user?.vai_tro) {
      role = (session.user.vai_tro || "guest").toLowerCase();
      window.sessionUser = session.user;
    } else {
      window.sessionUser = null;
    }
    await swapHeaderByRole(role);
  } catch (err) {
    console.error("❌ Lỗi kiểm tra session:", err);
    window.sessionUser = null;
    await swapHeaderByRole("guest");
  }

  window.addEventListener("hashchange", renderPage);
  renderPage();
}

initApp();

/* ----------------- Toast Helper ----------------- */
function showToast(message, type = "info") {
  const colors = {
    success: "bg-green-600",
    error: "bg-rose-600",
    warning: "bg-amber-500",
    info: "bg-sky-600",
  };
  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} text-white px-4 py-2 rounded-xl fixed top-5 right-5 shadow-lg z-[9999] transition-all duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-3");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
