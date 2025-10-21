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
        if (window.AOS?.refresh) setTimeout(() => AOS.refresh(), 400);
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

/* -------------- LƯU Ý QUAN TRỌNG --------------
   Nếu trước đây bạn dán nhầm HTML vào cuối app.js,
   hãy xóa sạch mọi thẻ HTML khỏi file JS để tránh lỗi DOM.
-------------------------------------------------- */
