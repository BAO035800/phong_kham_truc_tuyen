// E:\CODE\NHOM\phong_kham_truc_tuyen\view\assets\js\pages\register.js

(function () {
    // Xuất hàm global để app.js gọi sau khi inject register.html
    window.setupRegisterPage = function setupRegisterPage() {
      if (!window.Auth) {
        console.error("[Register] Auth chưa sẵn sàng. Hãy chắc chắn config.js -> auth.js đã được load trước.");
        return;
      }
  
      const form    = document.getElementById("registerForm");
      const status  = document.getElementById("registerStatus");
      const btn     = document.getElementById("btnSubmit");
      const emailEl = document.getElementById("email");
      const nameEl  = document.getElementById("fullname");
      const pwdEl   = document.getElementById("password");
      const toggle  = document.getElementById("togglePwd");
      const pwdIcon = document.getElementById("pwdIcon");
  
      if (!form) {
        console.warn("[Register] Không tìm thấy form #registerForm trong DOM.");
        return;
      }
  
      // Toggle hiển thị mật khẩu
      toggle?.addEventListener("click", () => {
        const isPw = pwdEl.type === "password";
        pwdEl.type = isPw ? "text" : "password";
        if (pwdIcon) pwdIcon.className = isPw ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
      });
  
      // Trim input khi blur
      [emailEl, nameEl].forEach((el) => {
        el?.addEventListener("blur", () => { el.value = el.value.trim(); });
      });
  
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const fullname = (nameEl?.value || "").trim();
        const email    = (emailEl?.value || "").trim();
        const password = (pwdEl?.value || "");
  
        if (!fullname || !email || !password) {
          return showStatus("⚠️ Vui lòng điền đầy đủ thông tin.", "error");
        }
        if (password.length < 6) {
          return showStatus("⚠️ Mật khẩu tối thiểu 6 ký tự.", "error");
        }
  
        setLoading(true, "Đang xử lý...");
  
        // lấy username từ phần trước dấu @ của email
        const username = email.split("@")[0];
  
        try {
          // ✅ Mặc định đăng ký BỆNH NHÂN
          const res = await Auth.registerBenhNhan({
            ten_dang_nhap: username,
            email: email,
            mat_khau: password,
            vai_tro: "BENHNHAN",
            ho_ten: fullname,
            // Có thể bổ sung: ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi
          });
  
          // DEBUG (nếu bật CONFIG.DEBUG)
          if (window.CONFIG?.DEBUG) console.log("[Register] Response:", res);
  
          showStatus("✅ Đăng ký thành công! Chuyển đến trang đăng nhập...", "success");
          setTimeout(() => { window.location.hash = "#/login"; }, 1000);
        } catch (err) {
          // lỗi đến từ backend (json) hoặc network
          const msg = err?.message || "Có lỗi xảy ra";
          showStatus("❌ " + msg, "error");
        } finally {
          setLoading(false);
        }
      });
  
      function setLoading(loading, text) {
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading
          ? `<span class="inline-flex items-center justify-center gap-2">
               <i class="fa-solid fa-circle-notch fa-spin"></i> ${text || "Đang xử lý..."}
             </span>`
          : "Đăng ký";
        if (loading) {
          showStatus(text || "Đang xử lý...", "info");
        }
      }
  
      function showStatus(msg, type) {
        if (!status) return;
        status.textContent = msg;
        status.className =
          "text-center text-sm mt-4 " +
          (type === "success" ? "text-green-600" :
           type === "error"   ? "text-red-500"  : "text-gray-600");
      }
    };
  })();
  