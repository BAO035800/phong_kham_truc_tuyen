function setupRegisterPage() {
    // đợi 1 chút cho app.js render xong
    setTimeout(() => {
      const form = document.getElementById("registerForm");
      if (!form) return; // nếu chưa render thì thoát
  
      const status = document.getElementById("registerStatus");
  
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const fullname = document.getElementById("registerFullname").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const role = "BENHNHAN"; // luôn là bệnh nhân
  
        status.textContent = "⏳ Đang tạo tài khoản...";
        status.className = "text-center text-sm text-gray-500 mt-4";
  
        try {
          const res = await apiRequest(
            `${API_BASE_URL}/index.php?path=auth&action=registerBenhNhan`,
            "POST",
            {
              ten_dang_nhap: fullname,
              email,
              mat_khau: password,
              vai_tro: role,
              ho_ten: fullname,
            }
          );
  
          showToast("Đăng ký thành công 🎉", "success");
          status.textContent = "✅ Đăng ký thành công! Hãy đăng nhập.";
          status.classList.add("text-green-600");
  
          setTimeout(() => {
            window.location.hash = "#/login";
          }, 1000);
        } catch (err) {
          console.error(err);
          showToast("Đăng ký thất bại ❌", "error");
          status.textContent = "❌ Không thể đăng ký. Vui lòng thử lại.";
          status.classList.add("text-red-500");
        }
      });
    }, 200); // đợi app.js load xong nội dung HTML
  }
  
  window.addEventListener("DOMContentLoaded", setupRegisterPage);
  window.addEventListener("hashchange", setupRegisterPage);
  