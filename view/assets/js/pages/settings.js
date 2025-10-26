/** =========================
 * settings.js — Trang Cài đặt (Bác sĩ)
 * ========================= **/

async function setupSettingsPage() {
    console.log("⚙️ settings.js loaded — initializing doctor settings page");
  
    // 🧩 DOM Elements
    const nameInput = document.getElementById("stName");
    const emailInput = document.getElementById("stEmail");
    const degreeInput = document.getElementById("stDegree");
    const expInput = document.getElementById("stExp");
    const bioInput = document.getElementById("stBio");
    const profileForm = document.getElementById("profileForm");
  
    const pwOld = document.getElementById("pwOld");
    const pwNew = document.getElementById("pwNew");
    const pwNew2 = document.getElementById("pwNew2");
    const pwForm = document.getElementById("passwordForm");
    const pwMsg = document.getElementById("pwMsg");
  
    let doctor = null;
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
      console.log("👤 Đã đăng nhập:", user);
    } catch (err) {
      console.error("❌ Lỗi lấy session:", err);
      showToast("Không thể xác thực người dùng.", "error");
      return;
    }
  
    /* 2️⃣ Lấy thông tin bác sĩ */
    async function fetchDoctorInfo() {
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=bacsi&id=${user.ma_bac_si}`, "GET");
        if (!res) throw new Error("Không tìm thấy thông tin bác sĩ.");
        doctor = res;
        renderProfile(doctor);
      } catch (err) {
        console.error("❌ Lỗi tải thông tin bác sĩ:", err);
        showToast("Không thể tải thông tin hồ sơ bác sĩ.", "error");
      }
    }
  
    function renderProfile(d) {
        try {
          nameInput.value = d?.ho_ten || "";
          emailInput.value = user?.email || "";
          degreeInput.value = d?.trinh_do || "";
          expInput.value = d?.kinh_nghiem || "";
          bioInput.value = d?.mo_ta || "";
        } catch (err) {
          console.error("⚠️ Lỗi renderProfile:", err);
        }
      }
      
      
  
    /* 3️⃣ Cập nhật hồ sơ bác sĩ */
    profileForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        ho_ten: nameInput.value.trim(),
        trinh_do: degreeInput.value.trim(),
        kinh_nghiem: parseInt(expInput.value) || 0,
        mo_ta: bioInput.value.trim(),
      };
  
      try {
        await apiRequest(`${API_BASE_URL}?path=bacsi&id=${user.ma_bac_si}`, "PUT", payload);
        showToast("✅ Cập nhật hồ sơ bác sĩ thành công!", "success");
      } catch (err) {
        console.error("❌ Lỗi cập nhật:", err);
        showToast("Không thể cập nhật hồ sơ bác sĩ.", "error");
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
    await fetchDoctorInfo();
  }
  
  /* ======================
     API helper chung
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
  
  /* ======================
     Toast thông báo
  ====================== */
  function showToast(message, type = "info") {
    const colors = {
      success: "bg-green-600",
      error: "bg-rose-600",
      warning: "bg-amber-500",
      info: "bg-sky-600",
    };
  
    const toast = document.createElement("div");
    toast.className = `${
      colors[type] || colors.info
    } text-white px-4 py-2 rounded-xl fixed top-5 right-5 shadow-lg z-[9999] animate-fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-3");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
  
  /* ======================
     Khởi chạy an toàn
  ====================== */
  function initSettingsPageWatcher() {
    async function checkAndInit() {
      // ✅ Chỉ load khi đang ở trang #/settings
      if (window.location.hash === "#/settings") {
  
        // ⏳ Đợi DOM render (SPA)
        await new Promise(resolve => setTimeout(resolve, 200));
  
        const profileForm = document.getElementById("profileForm");
        if (!profileForm) {
          console.warn("⚠️ Form chưa sẵn sàng, thử lại sau...");
          setTimeout(checkAndInit, 300); // thử lại sau 0.3s
          return;
        }
  
        await setupSettingsPage();
      }
    }
  
    window.addEventListener("DOMContentLoaded", checkAndInit);
    window.addEventListener("hashchange", checkAndInit);
  }
  
  // 🚀 Bắt đầu theo dõi route
  initSettingsPageWatcher();
  