/** =========================
 * settings_patient.js — Trang Cài đặt (Bệnh nhân)
 * ========================= **/

async function setupPatientSettingsPage() {
    console.log("⚙️ settings_patient.js loaded — initializing patient settings page");
  
    // 🧩 DOM Elements
    const nameInput = document.getElementById("ptName");
    const birthInput = document.getElementById("ptBirth");
    const genderSelect = document.getElementById("ptGender");
    const typeInput = document.getElementById("ptType"); // 🔒 readonly
    const phoneInput = document.getElementById("ptPhone");
    const emailInput = document.getElementById("ptEmail");
    const addressInput = document.getElementById("ptAddress");
    const patientForm = document.getElementById("patientForm");
  
    const pwOld = document.getElementById("pwOld");
    const pwNew = document.getElementById("pwNew");
    const pwNew2 = document.getElementById("pwNew2");
    const pwForm = document.getElementById("passwordForm");
    const pwMsg = document.getElementById("pwMsg");
  
    let patient = null;
    let user = null;
  
    /* 1️⃣ Lấy thông tin đăng nhập */
    try {
      const session = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
      if (!session.logged_in || !session.user) {
        showToast("⚠️ Vui lòng đăng nhập để truy cập cài đặt.", "warning");
        setTimeout(() => (window.location.hash = "#/login"), 800);
        return;
      }
      user = session.user;
      console.log("👤 Session user:", user);
    } catch (err) {
      console.error("❌ Lỗi lấy session:", err);
      showToast("Không thể xác thực người dùng.", "error");
      return;
    }
  
    /* 2️⃣ Lấy thông tin bệnh nhân */
    async function fetchPatientInfo() {
      try {
        if (!user.ma_benh_nhan) {
          // ✅ Nếu session chưa có ma_benh_nhan, fetch từ backend
          const all = await apiRequest(`${API_BASE_URL}?path=benhnhan`, "GET");
          const found = all.find((b) => b.ma_nguoi_dung == user.id);
          if (!found) throw new Error("Không tìm thấy bệnh nhân cho tài khoản này.");
          user.ma_benh_nhan = found.ma_benh_nhan;
        }
  
        const res = await apiRequest(
          `${API_BASE_URL}?path=benhnhan&id=${user.ma_benh_nhan}`,
          "GET"
        );
        if (!res) throw new Error("Không tìm thấy thông tin bệnh nhân.");
        patient = res;
        renderProfile(patient);
      } catch (err) {
        console.error("❌ Lỗi tải thông tin bệnh nhân:", err);
        showToast("Không thể tải thông tin hồ sơ bệnh nhân.", "error");
      }
    }
  
    function renderProfile(p) {
      try {
        nameInput.value = p?.ho_ten || "";
        birthInput.value = p?.ngay_sinh || "";
        genderSelect.value = p?.gioi_tinh || "Khác";
        typeInput.value = p?.loai_benh_nhan === "MOI" ? "Mới" : "Tái khám";
        phoneInput.value = p?.so_dien_thoai || "";
        emailInput.value = user?.email || "";
        addressInput.value = p?.dia_chi || "";
      } catch (err) {
        console.error("⚠️ Lỗi renderProfile:", err);
      }
    }
  
    /* 3️⃣ Cập nhật hồ sơ bệnh nhân */
    patientForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const payload = {
        ho_ten: nameInput.value.trim(),
        ngay_sinh: birthInput.value || null,
        gioi_tinh: genderSelect.value || "Khác",
        so_dien_thoai: phoneInput.value.trim() || null,
        email: emailInput.value.trim() || null,
        dia_chi: addressInput.value.trim() || null,
      };
  
      console.log("🧠 Cập nhật bệnh nhân ID:", user.ma_benh_nhan, "Payload:", payload);
  
      if (!user?.ma_benh_nhan) {
        showToast("❌ Không tìm thấy mã bệnh nhân trong session!", "error");
        return;
      }
  
      try {
        await apiRequest(
          `${API_BASE_URL}?path=benhnhan&id=${user.ma_benh_nhan}`,
          "PUT",
          payload
        );
        showToast("✅ Cập nhật thông tin bệnh nhân thành công!", "success");
      } catch (err) {
        console.error("❌ Lỗi cập nhật:", err);
        showToast("Không thể cập nhật hồ sơ bệnh nhân.", "error");
      }
    });
  
    /* 4️⃣ Đổi mật khẩu */
    pwForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const oldPw = pwOld.value.trim();
      const newPw = pwNew.value.trim();
      const newPw2 = pwNew2.value.trim();
      pwMsg.textContent = "";
  
      if (!oldPw || !newPw || !newPw2) {
        pwMsg.textContent = "⚠️ Vui lòng nhập đầy đủ các trường.";
        pwMsg.className = "text-red-600 text-sm";
        return;
      }
      if (newPw !== newPw2) {
        pwMsg.textContent = "❌ Mật khẩu mới không khớp.";
        pwMsg.className = "text-red-600 text-sm";
        return;
      }
  
      try {
        const payload = { mat_khau: newPw };
        await apiRequest(`${API_BASE_URL}?path=nguoidung&id=${user.id}`, "PUT", payload);
        pwMsg.textContent = "✅ Đổi mật khẩu thành công!";
        pwMsg.className = "text-green-600 text-sm";
        pwOld.value = pwNew.value = pwNew2.value = "";
      } catch (err) {
        console.error("❌ Lỗi đổi mật khẩu:", err);
        pwMsg.textContent = "Không thể đổi mật khẩu.";
        pwMsg.className = "text-red-600 text-sm";
      }
    });
  
    /* 🚀 Khởi chạy */
    await fetchPatientInfo();
  }
  
  /* ======================
     API helper + toast + init
  ====================== */
  async function apiRequest(url, method = "GET", body = null) {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  
  function showToast(message, type = "info") {
    const colors = {
      success: "bg-green-600",
      error: "bg-rose-600",
      warning: "bg-amber-500",
      info: "bg-sky-600",
    };
    const toast = document.createElement("div");
    toast.className = `${colors[type] || colors.info} text-white px-4 py-2 rounded-xl fixed top-5 right-5 shadow-lg z-[9999] animate-fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-3");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
  
  /* ======================
     Safe init (SPA mode)
  ====================== */
  function initPatientSettingsWatcher() {
    async function checkAndInit() {
      if (window.location.hash === "#/settings_patient") {
        await new Promise((r) => setTimeout(r, 200));
        const form = document.getElementById("patientForm");
        if (!form) return setTimeout(checkAndInit, 300);
        await setupPatientSettingsPage();
      }
    }
    window.addEventListener("DOMContentLoaded", checkAndInit);
    window.addEventListener("hashchange", checkAndInit);
  }
  
  initPatientSettingsWatcher();
  