/** ✅ login.js — Đăng nhập bằng Session PHP (sử dụng apiRequest) **/

function setupLoginPage() {
  setTimeout(() => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const status = document.getElementById("loginStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value.trim();

      if (!email || !password) {
        status.textContent = "⚠️ Vui lòng nhập đầy đủ thông tin.";
        status.className = "text-center text-sm text-red-500 mt-4";
        return;
      }

      status.textContent = "⏳ Đang đăng nhập...";
      status.className = "text-center text-sm text-gray-500 mt-4";

      try {
        // Reset local cache trước khi login
        window.sessionUser = null;

        const res = await apiRequest(
          `${API_BASE_URL}/index.php?path=auth&action=login`,
          "POST",
          { email, mat_khau: password },
          true
        );

        if (!res.user) throw new Error("Không có thông tin người dùng trả về.");

        // Lưu local & xác định role
        window.sessionUser = res.user;

        let role = (res.user.vai_tro || "guest").toLowerCase(); // admin/doctor/patient
        showToast("Đăng nhập thành công ✅", "success");
        status.textContent = `✅ Xin chào, ${res.user.name || res.user.ten_dang_nhap}`;
        status.classList.add("text-green-600");

        // Cập nhật header theo role
        await swapHeaderByRole(role);

        // Điều hướng dứt khoát
        if (role === "admin") {
          window.location.hash = "#/admin";
        } else if (role === "doctor") {
          window.location.hash = "#/doctor-dashboard";
        } else {
          window.location.hash = "#/"; // patient hoặc guest
        }
        renderPage();
      } catch (err) {
        console.error("❌ Lỗi đăng nhập:", err);
        showToast("Sai email hoặc mật khẩu ❌", "error");
        status.textContent = "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại.";
        status.className = "text-center text-sm text-red-500 mt-4";
      }
    });
  }, 200);
}

window.addEventListener("DOMContentLoaded", setupLoginPage);
window.addEventListener("hashchange", setupLoginPage);
