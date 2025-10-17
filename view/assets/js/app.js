/** E:\CODE\NHOM\phong_kham_truc_tuyen\view\assets\js\app.js **/

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
  
  /* ----------------- fake users ----------------- */
  const users = [
    { id: 1, name: "Nguyễn An",   email: "1@gmail.com",          password: "1", role: "patient" },
    { id: 2, name: "BS. Minh Trí", email: "admin@example.com",   password: "1", role: "doctor"  },
  ];
  
  /* ----------------- header helpers ----------------- */
  function headerUrlByRole(role) {
    if (role === "doctor")  return "./components/layout/header_doctor.html";
    if (role === "patient") return "./components/layout/header_patient.html";
    return "./components/layout/header_guest.html";
  }
  
  async function swapHeaderByRole(role) {
    // nạp đúng header theo role
    await loadPartial("#header", headerUrlByRole(role));
    // sau khi nạp bằng innerHTML, scripts bên trong KHÔNG chạy,
    // nên ta chủ động gắn lại các handler:
    setupTailwindNav();
    setupPatientHeader();
    setupDoctorHeader();
    setupGuestHeader();
  }
  
  /* ----------------- router ----------------- */
  async function renderPage() {
    const root = document.getElementById("view-root");
    const hash = window.location.hash || "#/";
    const user = JSON.parse(localStorage.getItem("user") || "null");
  
    switch (hash) {
      case "#/login":
        root.innerHTML = `
          <div class="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-6">
            <h2 class="text-xl font-semibold mb-4 text-center">🔐 Đăng nhập hệ thống</h2>
            <form id="loginForm" class="space-y-3">
              <input type="email" id="email" placeholder="Email" class="w-full border rounded-md p-2" required value="1@gmail.com">
              <input type="password" id="password" placeholder="Mật khẩu" class="w-full border rounded-md p-2" required value="1">
              <button type="submit" class="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition">
                Đăng nhập
              </button>
            </form>
            <div id="loginStatus" class="text-center text-sm text-gray-600 mt-4"></div>
          </div>
        `;
  
        // gắn submit sau khi render
        document.getElementById("loginForm").addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value.trim();
          const found = users.find(u => u.email === email && u.password === password);
          const status = document.getElementById("loginStatus");
  
          if (!found) {
            status.textContent = "❌ Sai thông tin đăng nhập!";
            status.classList.remove("text-green-600");
            status.classList.add("text-red-500");
            return;
          }
  
          localStorage.setItem("user", JSON.stringify(found));
          status.textContent = `✅ Xin chào ${found.name} (${found.role})`;
          status.classList.remove("text-red-500");
          status.classList.add("text-green-600");
  
          setTimeout(async () => {
            await swapHeaderByRole(found.role); // đổi header theo role
            window.location.hash = "#/";        // về home
            renderPage();                        // render ngay
          }, 600);
        });
        break;
  
        case "#/booking":
            if (!user) {
              root.innerHTML = `
                <div class="text-center py-10 text-gray-600">
                  🚫 Vui lòng <a href="#/login" class="text-blue-600 underline">đăng nhập</a> để đặt lịch.
                </div>`;
              return;
            }
          
            try {
              const res = await fetch("./pages/booking.html?v=" + Date.now(), { cache: "no-store" });
              if (!res.ok) throw new Error("Không thể tải trang đặt lịch");
              root.innerHTML = await res.text();
            } catch (err) {
              console.error(err);
              root.innerHTML = `<div class="text-center text-red-500 py-10">Lỗi tải trang đặt lịch</div>`;
            }
          
            break;
          
      case "#/doctor-dashboard":
        if (!user || user.role !== "doctor") {
          root.innerHTML = `<div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ bác sĩ mới được truy cập trang này.
          </div>`;
          return;
        }
        root.innerHTML = `
          <div class="bg-white rounded-xl shadow p-6">
            <h1 class="text-xl font-semibold mb-3">Trang quản lý bác sĩ</h1>
            <p>Xin chào ${user.name}, bạn có thể xem lịch hẹn và bệnh nhân tại đây.</p>
          </div>`;
        break;
  
      default:
        try {
          const res = await fetch("./pages/home.html?v=" + Date.now(), { cache: "no-store" });
          if (!res.ok) throw new Error("Không thể tải trang chủ");
          root.innerHTML = await res.text();
          // Nếu bạn dùng AOS thì giữ dòng dưới, nếu không dùng có thể bỏ:
          if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
        } catch (err) {
          console.error(err);
          root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang chủ</div>`;
        }
    }
  }
  
  /* ----------------- header setups ----------------- */
  // nav mobile (áp dụng cho mọi header)
  function setupTailwindNav() {
    const btn = document.querySelector('[data-toggle="mobile-nav"]');
    const nav = document.getElementById('navMain');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const isOpen = !nav.classList.contains('hidden');
      nav.classList.toggle('hidden', isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  }
  
  // header patient: chào + logout
  function setupPatientHeader() {
    const greet = document.getElementById("userGreeting");
    const btn = document.getElementById("logoutBtn");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && greet) greet.textContent = `Xin chào, ${user.name} 👋`;
    if (!btn) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      await swapHeaderByRole(null);
      window.location.hash = "#/login";
      renderPage();
      alert("Bạn đã đăng xuất thành công!");
    });
  }
  
  // header doctor: chào + logout
  function setupDoctorHeader() {
    const greet = document.getElementById("doctorGreeting");
    const btn = document.getElementById("logoutBtnDoctor");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && greet) greet.textContent = `Xin chào, ${user.name}`;
    if (!btn) return;
    btn.addEventListener("click", async () => {
      localStorage.removeItem("user");
      await swapHeaderByRole(null);
      window.location.hash = "#/login";
      renderPage();
    });
  }
  
  // header guest: có thể có nút #btnLogout trong một số template — xử lý dự phòng
  function setupGuestHeader() {
    const btn = document.getElementById("btnLogout");
    if (!btn) return;
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      await swapHeaderByRole(null);
      window.location.hash = "#/login";
      renderPage();
    });
  }
  
  /* ----------------- init ----------------- */
  async function initApp() {
    const current = JSON.parse(localStorage.getItem("user") || "null");
    await loadPartial("#footer", "./components/layout/footer.html");
    await swapHeaderByRole(current?.role || null); // nạp header phù hợp & gắn handler
    window.addEventListener("hashchange", renderPage);
    renderPage();
  }
  initApp();
  
  /* -------------- LƯU Ý QUAN TRỌNG --------------
     Hãy xóa toàn bộ đoạn HTML/JS header bác sĩ
     mà bạn đã dán nhầm vào cuối file app.js trước đó,
     bắt đầu từ dòng:
     <!-- HEADER (BÁC SĨ) -->
     vì để HTML trong file JS sẽ làm hỏng DOM & logout không chạy.
  -------------------------------------------------- */
  