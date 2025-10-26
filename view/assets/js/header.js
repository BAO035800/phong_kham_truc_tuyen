/** ================================
 * 📁 header.js — Menu trượt bên phải (SPA-compatible)
 * ================================ */
(function () {
    const initHeader = () => {
      const menuBtn = document.querySelector("[data-toggle='mobile-nav']");
      const mobileMenu = document.getElementById("mobileMenu");
      const overlay = document.getElementById("menuOverlay");
      const closeBtn = document.getElementById("closeMenuBtn");
  
      if (!menuBtn || !mobileMenu || !overlay || !closeBtn) return false;
  
      // 🟢 Mở menu
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.remove("hidden");
        overlay.classList.remove("hidden");
        setTimeout(() => {
          mobileMenu.classList.add("show");
          overlay.classList.add("show");
        }, 10);
      });
  
      // 🔴 Đóng menu
      const closeMenu = () => {
        mobileMenu.classList.remove("show");
        overlay.classList.remove("show");
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
          overlay.classList.add("hidden");
        }, 300);
      };
  
      closeBtn.addEventListener("click", closeMenu);
      overlay.addEventListener("click", closeMenu);
      mobileMenu.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", closeMenu)
      );
  
      // 🔹 Logout buttons (Desktop & Mobile)
      const logoutButtons = [
        document.getElementById("logoutBtn"),
        document.getElementById("logoutBtnDoctor"),
        document.getElementById("logoutBtnAdmin"),
        document.getElementById("logoutBtnDoctorMobile"),
        document.getElementById("logoutBtnMobile"),
      ].filter(Boolean);
  
      logoutButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          try {
            await apiRequest(`${API_ENDPOINTS.auth}&action=logout`, "POST");
            localStorage.removeItem("user");
            window.sessionUser = null;
            showToast("👋 Đã đăng xuất thành công", "success");
            window.location.hash = "#/login";
          } catch (err) {
            console.error("❌ Lỗi đăng xuất:", err);
            showToast("Lỗi khi đăng xuất", "error");
          }
        });
      });
  
      return true;
    };
  
    // 🕐 Nếu header chưa sẵn sàng, thử lại mỗi 100ms
    const interval = setInterval(() => {
      if (initHeader()) clearInterval(interval);
    }, 100);
  })();
  