/** logout.js — Đăng xuất người dùng với giao diện đẹp (toast & modal) **/

document.addEventListener("DOMContentLoaded", () => {
    const logoutButtons = document.querySelectorAll(
      "#logoutBtn, #logoutBtnDoctor, #logoutBtnAdmin, [data-action='logout']"
    );
  
    if (logoutButtons.length === 0) return;
  
    logoutButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        showConfirmDialog({
          title: "Đăng xuất",
          message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
          confirmText: "Đăng xuất",
          cancelText: "Huỷ",
          onConfirm: async () => {
            try {
              await logout(); // Gọi API logout (từ auth.js)
              clearUser();
  
              showToast("Đăng xuất thành công 👋", "success");
  
              setTimeout(() => {
                window.location.hash = "#/login";
                location.reload();
              }, 1000);
            } catch (err) {
              console.error("Lỗi khi đăng xuất:", err);
              showToast("Có lỗi khi đăng xuất, vui lòng thử lại!", "error");
            }
          },
        });
      });
    });
  });
  
  /* ---------------- Toast nhỏ gọn ---------------- */
  function showToast(message, type = "info") {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
    };
  
    const toast = document.createElement("div");
    toast.className = `
      fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-white shadow-lg text-sm font-medium
      animate-fade-in-up ${colors[type] || colors.info}
    `;
    toast.textContent = message;
  
    document.body.appendChild(toast);
  
    // Ẩn sau 2.5s
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  }
  
  /* ---------------- Hộp xác nhận ---------------- */
  function showConfirmDialog({ title, message, confirmText, cancelText, onConfirm }) {
    // Nếu đã có modal cũ, xoá trước
    document.getElementById("confirmModal")?.remove();
  
    const overlay = document.createElement("div");
    overlay.id = "confirmModal";
    overlay.className =
      "fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in";
  
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 mx-4 text-center animate-pop">
        <h3 class="text-lg font-semibold mb-2 text-gray-800">${title}</h3>
        <p class="text-gray-600 mb-5">${message}</p>
        <div class="flex justify-center gap-3">
          <button id="cancelLogout" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition">
            ${cancelText || "Huỷ"}
          </button>
          <button id="confirmLogout" class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">
            ${confirmText || "Xác nhận"}
          </button>
        </div>
      </div>
    `;
  
    document.body.appendChild(overlay);
  
    // Gắn sự kiện
    overlay.querySelector("#cancelLogout").onclick = () => overlay.remove();
    overlay.querySelector("#confirmLogout").onclick = async () => {
      overlay.remove();
      if (typeof onConfirm === "function") await onConfirm();
    };
  }
  
  /* ---------------- Hiệu ứng CSS ---------------- */
  const style = document.createElement("style");
  style.textContent = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pop {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
  .animate-pop { animation: pop 0.25s ease-out; }
  `;
  document.head.appendChild(style);
  