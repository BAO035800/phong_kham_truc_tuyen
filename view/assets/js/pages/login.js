/** ✅ login.js — Đăng nhập bằng Session PHP (sử dụng apiRequest) **/

function setupLoginPage() {
    // Đợi app.js render xong (vì SPA)
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
          // 🔹 Gọi API login qua apiRequest
          const res = await apiRequest(
            `${API_BASE_URL}/index.php?path=auth&action=login`,
            "POST",
            { email, mat_khau: password },
            true // ✅ credentials: include (nếu apiRequest hỗ trợ)
          );
  
          if (res.user) {
            // ✅ Hiển thị thông báo
            showToast("Đăng nhập thành công ✅", "success");
            status.textContent = `✅ Xin chào, ${res.user.name || res.user.ten_dang_nhap}`;
            status.classList.add("text-green-600");
  
            // ✅ PHP đã lưu session, nên chỉ cần cập nhật giao diện
            window.sessionUser = res.user;
  
            // ✅ Xác định vai trò
            let role = res.user.vai_tro?.toLowerCase() || "guest";
            if (role === "bacsi") role = "doctor";
            else if (role === "benhnhan") role = "patient";
            else if (role === "admin") role = "admin";
  
            // ✅ Cập nhật header tương ứng
            await swapHeaderByRole(role);
  
            // ✅ Chuyển hướng theo vai trò
            setTimeout(() => {
              if (role === "admin") window.location.hash = "#/admin";
              else if (role === "doctor") window.location.hash = "#/doctor-dashboard";
              else window.location.hash = "#/";
              renderPage();
            }, 700);
          } else {
            throw new Error("Không có thông tin người dùng trả về.");
          }
        } catch (err) {
          console.error("❌ Lỗi đăng nhập:", err);
          showToast("Sai email hoặc mật khẩu ❌", "error");
          status.textContent = "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại.";
          status.className = "text-center text-sm text-red-500 mt-4";
        }
      });
    }, 200);
  }
  
  // 🔄 Đăng ký khi trang load hoặc hash thay đổi (SPA)
  window.addEventListener("DOMContentLoaded", setupLoginPage);
  window.addEventListener("hashchange", setupLoginPage);
  