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
  { id: 1,  name: "Nguyễn An",   email: "1@gmail.com", password: "1", role: "patient" },
  { id: 2,  name: "BS. Minh Trí", email: "2@gmail.com", password: "1", role: "doctor"  },
  { id: 99, name: "Quản trị",     email: "admin@gmail.com", password: "1", role: "admin" },
];

/* ----------------- header helpers ----------------- */
function headerUrlByRole(role) {
  if (role === "admin")   return "./components/layout/header_admin.html";
  if (role === "doctor")  return "./components/layout/header_doctor.html";
  if (role === "patient") return "./components/layout/header_patient.html";
  return "./components/layout/header_guest.html";
}

async function swapHeaderByRole(role) {
  await loadPartial("#header", headerUrlByRole(role));
  // Scripts trong partial không tự chạy — gắn lại handler:
  setupTailwindNav();
  setupPatientHeader();
  setupDoctorHeader();
  setupAdminHeader();
  setupGuestHeader();
}

/* ----------------- localStorage mock data (Admin) ----------------- */
const LS_KEYS = {
  DOCTORS:  "adm:doctors",
  SERVICES: "adm:services",
  PATIENTS: "adm:patients",
};

function seedIfNeeded() {
  if (!localStorage.getItem(LS_KEYS.DOCTORS)) {
    const doctors = [
      { id: "D001", name: "BS. Minh Trí", email: "2@gmail.com", specialty: "Nội tổng quát", status: "active" },
      { id: "D002", name: "BS. Thu Hằng", email: "hang@example.com", specialty: "Nhi khoa", status: "inactive" },
    ];
    localStorage.setItem(LS_KEYS.DOCTORS, JSON.stringify(doctors));
  }
  if (!localStorage.getItem(LS_KEYS.SERVICES)) {
    const services = [
      { id: "S001", name: "Khám tổng quát", price: 200000, active: true },
      { id: "S002", name: "Siêu âm ổ bụng", price: 350000, active: true },
      { id: "S003", name: "Xét nghiệm máu", price: 150000, active: false },
    ];
    localStorage.setItem(LS_KEYS.SERVICES, JSON.stringify(services));
  }
  if (!localStorage.getItem(LS_KEYS.PATIENTS)) {
    const patients = [
      { id: "P001", name: "Nguyễn An", email: "1@gmail.com", phone: "0900000001" },
      { id: "P002", name: "Trần Hữu", email: "huu@example.com", phone: "0900000002" },
    ];
    localStorage.setItem(LS_KEYS.PATIENTS, JSON.stringify(patients));
  }
}
seedIfNeeded();

const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } },
  set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
};

/* ----------------- router ----------------- */
async function renderPage() {
  const root = document.getElementById("view-root");
  const hash = window.location.hash || "#/";
  const user = JSON.parse(localStorage.getItem("user") || "null");

  switch (hash) {
    case "#/login":
      try {
        const res = await fetch("./pages/login.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang đăng nhập");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang đăng nhập</div>`;
      }
      // submit login
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
          await swapHeaderByRole(found.role);
          window.location.hash = "#/";
          renderPage();
        }, 600);
      });
      break;

    case "#/register":
      root.innerHTML = await (await fetch("./pages/register.html?v=" + Date.now(), { cache: "no-store" })).text();
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
      
          // ⬇️ Quan trọng: gắn logic sau khi view đã render
          setupBookingPage();
      
        } catch (err) {
          console.error(err);
          root.innerHTML = `<div class="text-center text-red-500 py-10">Lỗi tải trang đặt lịch</div>`;
        }
        break;
      

        case "#/schedule":
          if (!user) {
            root.innerHTML = `
              <div class="text-center py-10 text-gray-600">
                🚫 Vui lòng <a href="#/login" class="text-blue-600 underline">đăng nhập</a> để xem lịch hẹn.
              </div>`;
            return;
          }
          try {
            const res = await fetch("./pages/schedule.html?v=" + Date.now(), { cache: "no-store" });
            if (!res.ok) throw new Error("Không thể tải trang lịch hẹn");
            root.innerHTML = await res.text();
            // if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
            // setupSchedulePage(); // 👈 thêm dòng này
          } catch (err) {
            console.error(err);
            root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang lịch hẹn</div>`;
          }
          break;
        

    case "#/doctors":
      try {
        const res = await fetch("./pages/doctors.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang bác sĩ");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang bác sĩ</div>`;
      }
      break;

    case "#/contact":
      try {
        const res = await fetch("./pages/contact.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang liên hệ");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang liên hệ</div>`;
      }
      break;

    case "#/services":
      try {
        const res = await fetch("./pages/services.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang dịch vụ");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang dịch vụ</div>`;
      }
      break;
  case (hash.startsWith("#/confirm") ? hash : ""):
  try {
    const res = await fetch("./pages/confirm.html?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải trang xác nhận lịch hẹn");
    root.innerHTML = await res.text();

    // ✅ Lấy token đúng từ sau dấu # (vd: #/confirm?token=abc123)
    const token = new URLSearchParams(hash.split("?")[1] || "").get("token");

    if (token) {
      // 🔹 Gọi API xác nhận bên PHP
      const res2 = await fetch(
        `http://localhost:8000/index.php?path=lichhen&action=xacNhanQuaEmail&token=${encodeURIComponent(token)}`
      );
      const data = await res2.json();

      const msg = document.getElementById("confirmMessage");
      if (data.status === "success") {
        msg.innerHTML = `
          <div class="text-green-600 text-center py-5 text-lg font-semibold">
            ✅ ${data.message}
          </div>`;
      } else {
        msg.innerHTML = `
          <div class="text-red-600 text-center py-5 text-lg font-semibold">
            ❌ ${data.message}
          </div>`;
      }
    } else {
      document.getElementById("confirmMessage").innerHTML = `
        <div class="text-gray-600 text-center py-5">
          Không tìm thấy token trong liên kết.
        </div>`;
    }
  } catch (err) {
    console.error(err);
    root.innerHTML = `
      <div class="text-center text-danger py-5">
        Lỗi tải trang xác nhận lịch hẹn
      </div>`;
  }
  break;





    case "#/doctor-dashboard":
      if (!user || user.role !== "doctor") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ bác sĩ mới được truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/doctor_dashboard.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang lịch hôm nay");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang lịch hôm nay</div>`;
      }
      break;

    case "#/statistics":
      if (!user) {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            🚫 Vui lòng <a href="#/login" class="text-blue-600 underline">đăng nhập</a> để xem thống kê.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/statistics.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang thống kê");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang thống kê</div>`;
      }
      break;

    case "#/patients":
      if (!user || user.role !== "doctor") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ bác sĩ mới được truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/patients.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang bệnh nhân");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang bệnh nhân</div>`;
      }
      break;

    case "#/settings":
      if (!user) {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            🚫 Vui lòng <a href="#/login" class="text-blue-600 underline">đăng nhập</a> để truy cập cài đặt.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/settings.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang cài đặt");
        root.innerHTML = await res.text();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang cài đặt</div>`;
      }
      break;

   case "#/doctor-availability":
  if (!user || user.role !== "doctor") {
    root.innerHTML = `
      <div class="text-center py-10 text-gray-600">
        ⚠️ Chỉ bác sĩ mới được truy cập trang này.
      </div>`;
    return;
  }
  try {
    const res = await fetch("./pages/doctor_availability.html?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Không thể tải trang lịch rảnh bác sĩ");
    root.innerHTML = await res.text();

    // 👇 Thêm dòng này để kích hoạt JS trong trang lịch rảnh
    if (typeof setupDoctorAvailabilityPage === "function") setupDoctorAvailabilityPage();

    if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
  } catch (err) {
    console.error(err);
    root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang lịch rảnh bác sĩ</div>`;
  }
  break;


    /* ----------------- ADMIN ROUTES ----------------- */
    case "#/admin":
      if (!user || user.role !== "admin") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ Admin mới truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/admin_dashboard.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải Admin Dashboard");
        root.innerHTML = await res.text();
        setupAdminDashboardPage();
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải Admin Dashboard</div>`;
      }
      break;

    case "#/admin/doctors":
      if (!user || user.role !== "admin") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ Admin mới truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/admin_doctors.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang quản lý bác sĩ");
        root.innerHTML = await res.text();
        setupAdminDoctorsPage();
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang quản lý bác sĩ</div>`;
      }
      break;

    case "#/admin/services":
      if (!user || user.role !== "admin") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ Admin mới truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/admin_services.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang quản lý dịch vụ");
        root.innerHTML = await res.text();
        setupAdminServicesPage();
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang quản lý dịch vụ</div>`;
      }
      break;

    case "#/admin/patients":
      if (!user || user.role !== "admin") {
        root.innerHTML = `
          <div class="text-center py-10 text-gray-600">
            ⚠️ Chỉ Admin mới truy cập trang này.
          </div>`;
        return;
      }
      try {
        const res = await fetch("./pages/admin_patients.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang quản lý bệnh nhân");
        root.innerHTML = await res.text();
        setupAdminPatientsPage();
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="text-center text-danger py-5">Lỗi tải trang quản lý bệnh nhân</div>`;
      }
      break;

    default:
      try {
        const res = await fetch("./pages/home.html?v=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải trang chủ");
        root.innerHTML = await res.text();
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

// header doctor
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

// header admin
function setupAdminHeader() {
  const greet = document.getElementById("adminGreeting");
  const btn = document.getElementById("logoutBtnAdmin");
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

// header guest (dự phòng)
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

/* ----------------- ADMIN PAGES SETUP ----------------- */
// Dashboard: show counters
function setupAdminDashboardPage() {
  const doctors = store.get(LS_KEYS.DOCTORS);
  const services = store.get(LS_KEYS.SERVICES);
  const patients = store.get(LS_KEYS.PATIENTS);

  const elD = document.getElementById("statDoctors");
  const elS = document.getElementById("statServices");
  const elP = document.getElementById("statPatients");

  if (elD) elD.textContent = doctors.length;
  if (elS) elS.textContent = services.length;
  if (elP) elP.textContent = patients.length;
}

// Doctors CRUD
function setupAdminDoctorsPage() {
  const form = document.getElementById("formDoctor");
  const tableBody = document.getElementById("tblDoctorsBody");
  const btnReset = document.getElementById("btnDoctorReset");

  function render() {
    const data = store.get(LS_KEYS.DOCTORS);
    tableBody.innerHTML = "";
    data.forEach((d, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-3 py-2 border">${d.id}</td>
        <td class="px-3 py-2 border">${d.name}</td>
        <td class="px-3 py-2 border">${d.email}</td>
        <td class="px-3 py-2 border">${d.specialty}</td>
        <td class="px-3 py-2 border">${d.status}</td>
        <td class="px-3 py-2 border">
          <button class="btnEdit px-2 py-1 text-xs border rounded mr-1" data-idx="${i}">Sửa</button>
          <button class="btnDel px-2 py-1 text-xs border rounded text-red-600" data-idx="${i}">Xoá</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }
  render();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.id.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const specialty = form.specialty.value.trim();
    const status = form.status.value;

    if (!id || !name || !email) return alert("Vui lòng nhập đủ ID/Name/Email");

    const data = store.get(LS_KEYS.DOCTORS);
    const editing = form.dataset.editing === "true";
    if (editing) {
      const idx = Number(form.dataset.index);
      data[idx] = { id, name, email, specialty, status };
      form.dataset.editing = "false";
      form.dataset.index = "";
    } else {
      if (data.find(d => d.id === id)) return alert("ID đã tồn tại");
      data.push({ id, name, email, specialty, status });
    }
    store.set(LS_KEYS.DOCTORS, data);
    form.reset();
    render();
  });

  btnReset?.addEventListener("click", () => {
    form.reset();
    form.dataset.editing = "false";
    form.dataset.index = "";
  });

  tableBody.addEventListener("click", (e) => {
    const btnE = e.target.closest(".btnEdit");
    const btnD = e.target.closest(".btnDel");
    const data = store.get(LS_KEYS.DOCTORS);

    if (btnE) {
      const idx = Number(btnE.dataset.idx);
      const item = data[idx];
      form.id.value = item.id;
      form.name.value = item.name;
      form.email.value = item.email;
      form.specialty.value = item.specialty;
      form.status.value = item.status;
      form.dataset.editing = "true";
      form.dataset.index = String(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (btnD) {
      const idx = Number(btnD.dataset.idx);
      if (!confirm("Xoá bác sĩ này?")) return;
      data.splice(idx, 1);
      store.set(LS_KEYS.DOCTORS, data);
      render();
    }
  });
}

// Services CRUD
function setupAdminServicesPage() {
  const form = document.getElementById("formService");
  const tableBody = document.getElementById("tblServicesBody");
  const btnReset = document.getElementById("btnServiceReset");

  function render() {
    const data = store.get(LS_KEYS.SERVICES);
    tableBody.innerHTML = "";
    data.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-3 py-2 border">${s.id}</td>
        <td class="px-3 py-2 border">${s.name}</td>
        <td class="px-3 py-2 border">${Number(s.price).toLocaleString()}</td>
        <td class="px-3 py-2 border">${s.active ? "active" : "inactive"}</td>
        <td class="px-3 py-2 border">
          <button class="btnEdit px-2 py-1 text-xs border rounded mr-1" data-idx="${i}">Sửa</button>
          <button class="btnDel px-2 py-1 text-xs border rounded text-red-600" data-idx="${i}">Xoá</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }
  render();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.id.value.trim();
    const name = form.name.value.trim();
    const price = Number(form.price.value || 0);
    const active = form.active.checked;

    if (!id || !name) return alert("Vui lòng nhập đủ ID/Name");

    const data = store.get(LS_KEYS.SERVICES);
    const editing = form.dataset.editing === "true";
    if (editing) {
      const idx = Number(form.dataset.index);
      data[idx] = { id, name, price, active };
      form.dataset.editing = "false";
      form.dataset.index = "";
    } else {
      if (data.find(s => s.id === id)) return alert("ID đã tồn tại");
      data.push({ id, name, price, active });
    }
    store.set(LS_KEYS.SERVICES, data);
    form.reset();
    render();
  });

  btnReset?.addEventListener("click", () => {
    form.reset();
    form.dataset.editing = "false";
    form.dataset.index = "";
  });

  tableBody.addEventListener("click", (e) => {
    const btnE = e.target.closest(".btnEdit");
    const btnD = e.target.closest(".btnDel");
    const data = store.get(LS_KEYS.SERVICES);

    if (btnE) {
      const idx = Number(btnE.dataset.idx);
      const item = data[idx];
      form.id.value = item.id;
      form.name.value = item.name;
      form.price.value = item.price;
      form.active.checked = !!item.active;
      form.dataset.editing = "true";
      form.dataset.index = String(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (btnD) {
      const idx = Number(btnD.dataset.idx);
      if (!confirm("Xoá dịch vụ này?")) return;
      data.splice(idx, 1);
      store.set(LS_KEYS.SERVICES, data);
      render();
    }
  });
}

// Patients CRUD
function setupAdminPatientsPage() {
  const form = document.getElementById("formPatient");
  const tableBody = document.getElementById("tblPatientsBody");
  const btnReset = document.getElementById("btnPatientReset");

  function render() {
    const data = store.get(LS_KEYS.PATIENTS);
    tableBody.innerHTML = "";
    data.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-3 py-2 border">${p.id}</td>
        <td class="px-3 py-2 border">${p.name}</td>
        <td class="px-3 py-2 border">${p.email}</td>
        <td class="px-3 py-2 border">${p.phone || ""}</td>
        <td class="px-3 py-2 border">
          <button class="btnEdit px-2 py-1 text-xs border rounded mr-1" data-idx="${i}">Sửa</button>
          <button class="btnDel px-2 py-1 text-xs border rounded text-red-600" data-idx="${i}">Xoá</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }
  render();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.id.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    if (!id || !name || !email) return alert("Vui lòng nhập đủ ID/Name/Email");

    const data = store.get(LS_KEYS.PATIENTS);
    const editing = form.dataset.editing === "true";
    if (editing) {
      const idx = Number(form.dataset.index);
      data[idx] = { id, name, email, phone };
      form.dataset.editing = "false";
      form.dataset.index = "";
    } else {
      if (data.find(p => p.id === id)) return alert("ID đã tồn tại");
      data.push({ id, name, email, phone });
    }
    store.set(LS_KEYS.PATIENTS, data);
    form.reset();
    render();
  });

  btnReset?.addEventListener("click", () => {
    form.reset();
    form.dataset.editing = "false";
    form.dataset.index = "";
  });

  tableBody.addEventListener("click", (e) => {
    const btnE = e.target.closest(".btnEdit");
    const btnD = e.target.closest(".btnDel");
    const data = store.get(LS_KEYS.PATIENTS);

    if (btnE) {
      const idx = Number(btnE.dataset.idx);
      const item = data[idx];
      form.id.value = item.id;
      form.name.value = item.name;
      form.email.value = item.email;
      form.phone.value = item.phone || "";
      form.dataset.editing = "true";
      form.dataset.index = String(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (btnD) {
      const idx = Number(btnD.dataset.idx);
      if (!confirm("Xoá bệnh nhân này?")) return;
      data.splice(idx, 1);
      store.set(LS_KEYS.PATIENTS, data);
      render();
    }
  });
}

/* ----------------- init ----------------- */
async function initApp() {
  const current = JSON.parse(localStorage.getItem("user") || "null");
  await loadPartial("#footer", "./components/layout/footer.html");
  await swapHeaderByRole(current?.role || null);
  window.addEventListener("hashchange", renderPage);
  renderPage();
}
initApp();
// ----------------- BOOKING PAGE SETUP -----------------
function setupBookingPage() {
  const form         = document.getElementById("bookingForm");
  const doctorSelect = document.getElementById("doctorSelect");
  const dateInput    = document.getElementById("date");
  const timeSelect   = document.getElementById("timeSelect");
  const statusMsg    = document.getElementById("statusMsg");

  if (!form || !doctorSelect || !dateInput || !timeSelect) return; // booking.html chưa render

  // Ngày tối thiểu = hôm nay
  const todayISO = new Date().toISOString().slice(0,10);
  dateInput.min = todayISO;

  // Chuẩn hoá yyyy-mm-dd
  const normalizeDate = (str) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;  // ISO sẵn
    const d = new Date(str);
    return isNaN(d) ? "" : d.toISOString().slice(0,10);
  };

  // DEMO DATA (thay bằng API thật nếu có) — key phải là YYYY-MM-DD
  const availableSlots = {
    doctor1: {
      "2025-10-22": [
        { start: "08:00", end: "09:00" },
        { start: "14:00", end: "15:00" }
      ],
      "2025-10-23": [
        { start: "09:00", end: "10:30" },
        { start: "13:00", end: "14:00" }
      ],
      "2025-10-24": [
        { start: "09:00", end: "10:00" },
        { start: "14:00", end: "15:00" }
      ]
    },
    doctor2: {
      "2025-10-22": [
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" }
      ],
      "2025-10-23": [
        { start: "08:00", end: "09:00" },
        { start: "10:00", end: "11:00" }
      ],
      "2025-10-25": [
        { start: "09:00", end: "10:00" },
        { start: "13:00", end: "14:00" }
      ]
    },
    doctor3: {
      "2025-10-23": [
        { start: "08:30", end: "09:30" },
        { start: "14:00", end: "15:00" }
      ]
    },
    doctor4: {
      "2025-10-23": [
        { start: "08:00", end: "09:00" },
        { start: "10:00", end: "11:00" },
        { start: "13:00", end: "14:00" }
      ]
    },
    doctor5: {
      "2025-10-24": [
        { start: "09:00", end: "10:00" },
        { start: "15:00", end: "16:00" }
      ]
    },
    doctor6: {
      "2025-10-23": [
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
        { start: "14:00", end: "15:00" }
      ]
    }
  };
  

  // helpers
  function setPlaceholder(text, disabled = true) {
    timeSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    opt.disabled = disabled;
    opt.selected  = true;
    timeSelect.appendChild(opt);
  }

  function findNextAvailableDate(doctorId) {
    const dates = Object.keys(availableSlots[doctorId] || {}).sort();
    for (const d of dates) {
      if (d >= todayISO && (availableSlots[doctorId][d] || []).length > 0) return d;
    }
    return dates.find(d => (availableSlots[doctorId][d] || []).length > 0) || "";
  }

  function updateTimeOptions() {
    const doctor = doctorSelect.value;
    const date   = normalizeDate(dateInput.value);

    timeSelect.disabled = false;  // luôn bật dropdown

    if (!doctor && !date) { setPlaceholder("— Chọn bác sĩ & ngày trước —"); return; }
    if (!doctor)          { setPlaceholder("— Chọn bác sĩ trước —");       return; }
    if (!date) {
      const suggested = findNextAvailableDate(doctor);
      if (suggested) dateInput.value = suggested;
      else { setPlaceholder("Bác sĩ này chưa có lịch trống"); return; }
    }

    const key   = normalizeDate(dateInput.value);
    const slots = (availableSlots[doctor] && availableSlots[doctor][key]) || [];

    if (slots.length === 0) { setPlaceholder("Không còn lịch trống cho ngày đã chọn"); return; }

    timeSelect.innerHTML = "";
    const ph = document.createElement("option");
    ph.textContent = "-- Chọn giờ --";
    ph.disabled = true; ph.selected = true; ph.value = "";
    timeSelect.appendChild(ph);

    slots.forEach(slot => {
      const label = slot.end ? `${slot.start} – ${slot.end}` : slot.start;
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      timeSelect.appendChild(opt);
    });
    
  }

  // Events
  doctorSelect.addEventListener("change", () => {
    const doc = doctorSelect.value;
    if (doc) {
      const current = normalizeDate(dateInput.value);
      const slotsToday = (availableSlots[doc] && availableSlots[doc][current]) || [];
      if (!current || slotsToday.length === 0) {
        const suggested = findNextAvailableDate(doc);
        if (suggested) dateInput.value = suggested;
      }
    }
    updateTimeOptions();
  });
  dateInput.addEventListener("change", updateTimeOptions);
  dateInput.addEventListener("input",  updateTimeOptions);

  // Render lần đầu
  setPlaceholder("— Chọn bác sĩ & ngày trước —");

  // Submit demo (mock)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const name   = document.getElementById("fullname").value.trim();
    const doctor = doctorSelect.value;
    const date   = normalizeDate(dateInput.value);
    const time   = timeSelect.value;
    const note   = document.getElementById("note").value.trim();
  
    if (!name || !doctor || !date || !time) {
      statusMsg.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin.";
      statusMsg.classList.add("text-red-500");
      return;
    }
  
    // === 1️⃣ Tách giờ bắt đầu – kết thúc nếu có
    const [start, end] = time.includes("–") ? time.split("–").map(t => t.trim()) : [time, ""];
  
    // === 2️⃣ Chuẩn bị dữ liệu lịch hẹn mới
    const newAppt = {
      id: `APT-${Date.now()}`,
      name,
      provider: document.querySelector(`#doctorSelect option[value="${doctor}"]`)?.textContent || doctor,
      date,
      start,
      end,
      type: "Khám bệnh",
      room: "",
      status: "scheduled",
      notes: note
    };
  
    // === 3️⃣ Lưu vào LocalStorage (key: appointments)
    const STORAGE_KEY = "appointments";
    const oldList = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    oldList.push(newAppt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldList));
  
    // === 4️⃣ Thông báo và chuyển sang trang Lịch hẹn
    statusMsg.textContent = `✅ Đặt lịch thành công cho ${name} vào ${date} lúc ${time}.`;
    statusMsg.classList.remove("text-red-500");
    statusMsg.classList.add("text-green-600");
  
    setTimeout(() => {
      window.location.hash = "#/schedule";
    }, 1000);
  });
  

}

/* -------------- LƯU Ý QUAN TRỌNG --------------
   Nếu trước đây bạn dán nhầm HTML vào cuối app.js,
   hãy xóa sạch mọi thẻ HTML khỏi file JS để tránh lỗi DOM.
-------------------------------------------------- */
// ----------------- SCHEDULE PAGE SETUP -----------------
// ----------------- SCHEDULE PAGE SETUP -----------------
function setupSchedulePage() {
  const STORAGE_KEY = "appointments";

  // Lấy danh sách, nếu trống thì seed dữ liệu mẫu (mỗi trạng thái 1 bản ghi)
  // Lấy danh sách, nếu trống thì seed dữ liệu mẫu (mỗi trạng thái 1 bản ghi)
let APPTS = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
if (APPTS.length === 0) {
  APPTS = [
    // 1) đang đợi (CHO PHÉP XOÁ)
    {
      id: "APT-001",
      name: "Nguyễn Văn A",
      provider: "BS. Lê Minh",
      date: "2025-10-20",
      start: "09:00",
      end: "09:30",
      status: "waiting",
      notes: "Lần đầu đến khám",
    },
    // 2) đã đặt
    {
      id: "APT-002",
      name: "Trần Thị B",
      provider: "BS. Thu Hà",
      date: "2025-10-21",
      start: "10:00",
      end: "10:30",
      status: "booked",
      notes: "Xác nhận qua điện thoại",
    },
    // 3) đã khám xong
    {
      id: "APT-003",
      name: "Lê Quốc C",
      provider: "BS. Hồng Sơn",
      date: "2025-10-22",
      start: "14:00",
      end: "14:45",
      status: "done",
      notes: "Đã khám và kê thuốc",
    },
    // 4) đã hủy
    {
      id: "APT-004",
      name: "Phạm Duyên D",
      provider: "BS. Minh Trí",
      date: "2025-10-23",
      start: "08:30",
      end: "09:00",
      status: "cancelled",
      notes: "Bệnh nhân báo bận",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(APPTS));
}


  // helpers
  const $  = (s, e=document)=>e.querySelector(s);
  const $$ = (s, e=document)=>[...e.querySelectorAll(s)];
  const toDate = iso => new Date(iso + "T00:00:00");
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startOfWeek = (d=new Date(), w=1) => { const x = new Date(d); const day = x.getDay(); const diff = (day < w ? 7 : 0) + day - w; x.setDate(x.getDate() - diff); return x; };

  // Map hiển thị trạng thái
  const STATUS_META = {
    waiting:   { label: "Đang đợi",    dot: "bg-amber-500",  text: "text-amber-700"  },
    booked:    { label: "Đã đặt",       dot: "bg-blue-500",   text: "text-blue-700"   },
    done:      { label: "Đã khám xong", dot: "bg-emerald-600",text: "text-emerald-700"},
    cancelled: { label: "Đã hủy",       dot: "bg-rose-500",   text: "text-rose-700"   },
  };

  // state
  let state = {
    view: 'week',
    weekStart: startOfWeek(new Date(), 1),
    query: '',
    status: 'all'
  };

  // ===== FILTER =====
  function filtered() {
    const q = state.query.toLowerCase();
    return APPTS.filter(a => {
      const hitQ = !q || [a.name, a.provider, a.notes].some(v => String(v||"").toLowerCase().includes(q));
      const hitS = state.status === "all" || a.status === state.status;
      return hitQ && hitS;
    });
  }

  function weekData() {
    const end = addDays(state.weekStart, 6);
    return filtered().filter(a => {
      const d = toDate(a.date);
      return d >= state.weekStart && d <= end;
    });
  }

  // ===== RENDER WEEK =====
  function renderWeek() {
    const container = $("#week-view");
    container.innerHTML = "";

    const days = Array.from({ length: 7 }, (_, i) => addDays(state.weekStart, i));
    const by = {};
    for (const a of weekData()) (by[a.date] ??= []).push(a);
    for (const k in by) by[k].sort((x, y) => x.start.localeCompare(y.start));

    days.forEach(d => {
      const key = d.toISOString().slice(0,10);
      const list = by[key] || [];
      const card = document.createElement("section");
      card.className = "rounded-2xl border border-border bg-white p-4 shadow-card";
      card.innerHTML = `
        <header class="mb-3 flex justify-between">
          <div>
            <div class="text-xs uppercase">${d.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
            <div class="text-sm font-semibold">${key}</div>
          </div>
          <div class="text-xs text-gray-500">${list.length} lịch</div>
        </header>
        <div class="flex flex-col gap-3">
          ${list.length ? "" : `<div class="text-sm text-gray-400 text-center">Không có lịch</div>`}
        </div>`;
      const wrap = card.querySelector(".flex.flex-col.gap-3");
      list.forEach(a => wrap.appendChild(apptCard(a)));
      container.appendChild(card);
    });

    $("#week-start").textContent = state.weekStart.toISOString().slice(0,10);
  }

  function apptCard(a) {
    const m = STATUS_META[a.status] || {};
    const el = document.createElement("div");
    el.className = "rounded-xl border p-3 shadow-sm hover:shadow-md";
    el.innerHTML = `
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-sm">${a.name}</div>
          <div class="text-xs text-gray-500">${a.start}–${a.end}</div>
        </div>
        <span class="text-xs ${m.text || ""}">${m.label || a.status}</span>
      </div>
      <div class="text-xs text-gray-600 mt-1">👨‍⚕️ ${a.provider}</div>`;
    return el;
  }

  // ===== RENDER LIST =====
  function renderList() {
    const tb = $("#list-body");
    tb.innerHTML = "";
    const data = filtered();

    if (data.length === 0) {
      tb.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-4">Không có lịch hẹn nào</td></tr>`;
      return;
    }

    data.forEach(a => {
      const m = STATUS_META[a.status] || {};
      const canDelete = a.status === "waiting"; // chỉ "đang đợi" được xoá

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-3 font-medium">${a.name}</td>
        <td class="px-4 py-3">${a.date}<br><span class="text-xs text-gray-500">${a.start}–${a.end}</span></td>
        <td class="px-4 py-3">${a.provider}</td>
        <td class="px-4 py-3 text-xs ${m.text || ""}">${m.label || a.status}</td>
        <td class="px-4 py-3 text-xs text-gray-500">${a.notes || ""}</td>
        <td class="px-4 py-3 text-right">
          <button class="btn-edit text-blue-600 text-xs mr-2" data-id="${a.id}">Sửa</button>
          ${canDelete ? `<button class="btn-del text-red-600 text-xs" data-id="${a.id}">Xoá</button>` : ""}
        </td>`;
      tb.appendChild(tr);
    });
  }

  function updateView() {
    if (state.view === 'week') {
      $("#week-view").classList.remove("hidden");
      $("#list-view").classList.add("hidden");
      renderWeek();
    } else {
      $("#list-view").classList.remove("hidden");
      $("#week-view").classList.add("hidden");
      renderList();
    }
  }

  // ===== EVENTS =====
  $$(".view-btn").forEach(btn => btn.addEventListener("click", () => { state.view = btn.dataset.view; updateView(); }));
  $("#sch-search").addEventListener("input", e => { state.query = e.target.value; updateView(); });
  $("#sch-status").addEventListener("change", e => { state.status = e.target.value; updateView(); });
  $("#prev-week").addEventListener("click", () => { state.weekStart = addDays(state.weekStart, -7); updateView(); });
  $("#today-week").addEventListener("click", () => { state.weekStart = startOfWeek(new Date(), 1); updateView(); });
  $("#next-week").addEventListener("click", () => { state.weekStart = addDays(state.weekStart, 7); updateView(); });

  // ===== MODAL CRUD =====
  function openModal(id = null) {
    $("#appt-modal").classList.remove("hidden");
    $("#appt-modal").classList.add("flex");

    if (id) {
      const a = APPTS.find(x => x.id === id);
      $("#modal-title").textContent = "Sửa lịch hẹn";
      $("#appt-id").value = a.id;
      $("#appt-name").value = a.name;
      $("#appt-provider").value = a.provider;
      $("#appt-date").value = a.date;
      $("#appt-start").value = a.start;
      $("#appt-end").value = a.end;
      $("#appt-status").value = a.status;
      $("#appt-notes").value = a.notes || "";
    } else {
      $("#modal-title").textContent = "Thêm lịch hẹn";
      $("#appt-form").reset();
      $("#appt-id").value = "";
    }
  }
  function closeModal() {
    $("#appt-modal").classList.add("hidden");
    $("#appt-modal").classList.remove("flex");
  }
  $("#btn-cancel").addEventListener("click", closeModal);

  $("#appt-form").addEventListener("submit", e => {
    e.preventDefault();
    const id = $("#appt-id").value || `APT-${Date.now()}`;
    const item = {
      id,
      name: $("#appt-name").value.trim(),
      provider: $("#appt-provider").value.trim(),
      date: $("#appt-date").value,
      start: $("#appt-start").value,
      end: $("#appt-end").value,
      status: $("#appt-status").value,
      notes: $("#appt-notes").value,
    };
    const idx = APPTS.findIndex(x => x.id === id);
    if (idx >= 0) APPTS[idx] = item; else APPTS.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APPTS));
    closeModal(); updateView();
  });

  document.addEventListener("click", e => {
    const edit = e.target.closest(".btn-edit");
    const del  = e.target.closest(".btn-del");
    if (edit) return openModal(edit.dataset.id);
    if (del) {
      const id = del.dataset.id;
      if (confirm("Xoá lịch hẹn này?")) {
        const idx = APPTS.findIndex(x => x.id === id);
        if (idx >= 0) APPTS.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(APPTS));
        updateView();
      }
    }
  });

  $(".btn-add")?.addEventListener("click", e => { e.preventDefault(); openModal(); });

  // Lần đầu
  updateView();
}
