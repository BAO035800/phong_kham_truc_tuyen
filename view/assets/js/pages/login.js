// /assets/js/pages/login.js
// ✅ Phiên bản an toàn và tối ưu - tránh redirect nhầm về #/

(function () {
  // DOM helper
  function qs(sel, root = document) { return root.querySelector(sel); }

  // Xác định trang cần chuyển sau login
  function roleRedirect(user) {
    const v = user?.vai_tro;
    if (v === "ADMIN") return "#/admin";
    if (v === "BACSI") return "#/doctor-dashboard";
    return "#/"; // BENHNHAN hoặc khác
  }

  // ----- Xử lý login -----
  async function doLogin(e) {
    e?.preventDefault?.();
    const form = qs("#loginForm");
    const emailEl = qs("#email", form);
    const passEl = qs("#password", form);
    const btn = qs('button[type="submit"]', form);
    const status = qs("#loginStatus");

    const email = (emailEl?.value || "").trim();
    const password = (passEl?.value || "").trim();

    if (!email || !password) {
      status.textContent = "⚠️ Vui lòng nhập email và mật khẩu";
      status.className = "text-center text-sm text-red-500 mt-4";
      return;
    }

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "⏳ Đang đăng nhập...";
    status.textContent = "";

    try {
      const user = await Auth.login({ email, password });
      status.textContent = "✅ Đăng nhập thành công!";
      status.className = "text-center text-sm text-green-600 mt-4";
      // Chuyển trang theo vai trò
      window.location.hash = roleRedirect(user);
    } catch (err) {
      status.textContent = "❌ " + (err?.message || "Đăng nhập thất bại");
      status.className = "text-center text-sm text-red-500 mt-4";
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  }

  // ----- Hiện / Ẩn mật khẩu -----
  function togglePasswordVisibility() {
    const passEl = document.getElementById("password");
    const eye = document.getElementById("togglePass");
    if (!passEl || !eye) return;
    const type = passEl.getAttribute("type") === "password" ? "text" : "password";
    passEl.setAttribute("type", type);
    eye.textContent = type === "password" ? "Hiện" : "Ẩn";
  }

  // ----- Gắn event -----
  function bindLoginForm() {
    const form = document.getElementById("loginForm");
    const eye = document.getElementById("togglePass");
    if (!form) return;
    form.addEventListener("submit", doLogin);
    eye?.addEventListener("click", togglePasswordVisibility);
  }

  // ----- Trang login -----
  async function setupLoginPage() {
    bindLoginForm();

    try {
      // ✅ Gọi server thật để kiểm tra session
      const me = await Auth.me();
      if (me) {
        console.log("[Login] User đã có phiên hợp lệ, chuyển hướng...");
        window.location.hash = roleRedirect(me);
        return;
      }
    } catch (e) {
      console.log("[Login] Chưa đăng nhập:", e.message);
    }

    console.log("[Login] Ở lại trang đăng nhập");
  }

  // Khởi tạo khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) setupLoginPage();
  });

  window.setupLoginPage = setupLoginPage;
})();
