/** ✅ app.js — SPA Routing & Layout (dùng PHP Session hoàn chỉnh) **/

/* ----------------- helpers ----------------- */
async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Không thể tải: ${url}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="alert alert-danger text-center m-0">Lỗi tải ${url}</div>`;
  }
}

/* ----------------- header helpers ----------------- */
function headerUrlByRole(role) {
  if (role === "admin") return "./components/header_admin.html";
  if (role === "doctor") return "./components/header_doctor.html";
  if (role === "patient") return "./components/header_patient.html";
  return "./components/header_guest.html";
}

async function swapHeaderByRole(role) {
  await loadPartial("#header", headerUrlByRole(role));
  setupTailwindNav();

  // setup actions theo từng header
  setupPatientHeader();
  setupDoctorHeader();
  setupAdminHeader();
  setupGuestHeader();
}

/* ----------------- router ----------------- */
async function renderPage() {
  const root = document.getElementById("view-root");
  const hash = window.location.hash || "#/";

  async function loadPage(url) {
    try {
      const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Không thể tải trang");
      root.innerHTML = await res.text();
      if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
    } catch (err) {
      console.error(err);
      root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang</div>`;
    }
  }

  switch (hash.split("?")[0]) {
    case "#/login":
      await loadPage("./pages/login.html");
      setupLoginPage();
      break;

    case "#/register": await loadPage("./pages/register.html"); break;
    case "#/booking": await loadPage("./pages/booking.html"); break;
    case "#/schedule": await loadPage("./pages/schedule.html"); break;
    case "#/doctors": await loadPage("./pages/doctors.html"); break;
    case "#/contact": await loadPage("./pages/contact.html"); break;
    case "#/services": await loadPage("./pages/services.html"); break;

    case "#/doctor-dashboard":
      await loadPage("./pages/doctor_dashboard.html");
      break;

    /* ✅ Gọi script sau khi trang Doctor Availability đã load */
    case "#/doctor-availability":
      await loadPage("./pages/doctor_availability.html");
      if (typeof setupDoctorAvailability === "function") {
        setupDoctorAvailability(); // gọi khi DOM đã sẵn sàng
      } else {
        console.warn("⚠️ Hàm setupDoctorAvailability chưa được load!");
      }
      break;

    case "#/statistics": await loadPage("./pages/statistics.html"); break;
    case "#/patients": await loadPage("./pages/patients.html"); break;
    case "#/settings": await loadPage("./pages/settings.html"); break;

    case "#/admin": await loadPage("./pages/admin_dashboard.html"); break;
    case "#/admin/doctors": await loadPage("./pages/admin_doctors.html"); break;
    case "#/admin/services": await loadPage("./pages/admin_services.html"); break;
    case "#/admin/patients": await loadPage("./pages/admin_patients.html"); break;

    /* ✅ Trang xác nhận lịch hẹn */
    case "#/confirm":
      try {
        const res = await fetch("./pages/confirm.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang xác nhận lịch hẹn");
        root.innerHTML = await res.text();

        const token = new URLSearchParams(hash.split("?")[1] || "").get("token");
        const msg = document.getElementById("confirmMessage");

        if (token) {
          const res2 = await fetch(
            `http://localhost:8000/index.php?path=lichhen&action=xacNhanQuaEmail&token=${encodeURIComponent(token)}`,
            { cache: "no-store" }
          );
          const data = await res2.json();

          msg.innerHTML =
            data.status === "success"
              ? `<div class="text-green-600 text-center py-5 text-lg font-semibold">
                  ✅ ${data.message}
                </div>
                <div class="text-center mt-4">
                  <a href="#/" class="text-blue-600 underline hover:text-blue-800">Quay lại trang chủ</a>
                </div>`
              : `<div class="text-red-600 text-center py-5 text-lg font-semibold">
                  ❌ ${data.message || "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."}
                </div>`;
        } else {
          msg.innerHTML = `<div class="text-gray-600 text-center py-5">Không tìm thấy token trong liên kết xác nhận.</div>`;
        }
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-red-600 py-5">⚠️ Lỗi khi tải trang xác nhận lịch hẹn.</div>`;
      }
      break;

    default:
      await loadPage("./pages/home.html");
  }
}

/* ----------------- header setups ----------------- */
function setupTailwindNav() {
  const btn = document.querySelector('[data-toggle="mobile-nav"]');
  const nav = document.getElementById("navMain");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const isOpen = !nav.classList.contains("hidden");
    nav.classList.toggle("hidden", isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
}

/* ✅ Logout đồng bộ: xoá PHP session + JS session + đổi header + render login */
async function logoutAndRedirect() {
  try {
    await fetch("http://localhost:8000/index.php?path=auth&action=logout", {
      credentials: "include",
    });
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
  const btn = document.getElementById("btnLogout");
  btn?.addEventListener("click", logoutAndRedirect);
}

/* ----------------- init ----------------- */
async function initApp() {
  await loadPartial("#footer", "./components/footer.html");

  try {
    const res = await fetch("http://localhost:8000/index.php?path=session", {
      credentials: "include",
    });
    const data = await res.json();

    let role = "guest";
    if (data.logged_in && data.user?.vai_tro) {
      role = (data.user.vai_tro || "guest").toLowerCase();
      window.sessionUser = data.user;
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
