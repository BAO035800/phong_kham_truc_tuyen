// ================================
// 🩺 SPA-compatible Doctor Page (with wait)
// ================================
async function setupDoctorPage() {
    if (!window.location.hash.includes("#/doctors")) return;
  
    // Chờ phần tử HTML xuất hiện (vì SPA load async)
    const doctorList = await waitForElement("#doctor-list", 3000);
    const loading = document.getElementById("doctor-loading");
    const empty = document.getElementById("doctor-empty");
    const defaultImg = "https://i.pinimg.com/1200x/12/df/bf/12dfbf327a68a91bad8f7e2b2fe47dc4.jpg";
  
    if (!doctorList || !loading || !empty) {
      console.error("❌ Không tìm thấy phần tử cần thiết trong doctors.html");
      return;
    }
  
    function toggleLoading(show) {
      loading.classList.toggle("hidden", !show);
    }
  
    function showEmpty(msg) {
      empty.textContent = msg;
      empty.classList.remove("hidden");
      doctorList.innerHTML = "";
    }
  
    async function fetchDoctors() {
      toggleLoading(true);
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=bacsi`, "GET");
        console.log("📦 Dữ liệu bác sĩ:", res);
  
        if (!Array.isArray(res) || res.length === 0) {
          showEmpty("Hiện chưa có bác sĩ nào được đăng ký.");
          return;
        }
        renderDoctors(res);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách bác sĩ:", err);
        showEmpty("Không thể tải danh sách bác sĩ.");
      } finally {
        toggleLoading(false);
      }
    }
  
    function renderDoctors(doctors) {
      empty.classList.add("hidden");
      doctorList.innerHTML = doctors
        .map(
          (d, idx) => `
          <div class="p-6 bg-white rounded-xl shadow-card hover:-translate-y-1 transition" 
               data-aos-delay="${100 + idx * 50}">
            <img src="${defaultImg}" 
                 alt="Bác sĩ ${d.ho_ten}" 
                 class="w-28 h-28 mx-auto rounded-full object-cover mb-4 shadow-md">
            <h3 class="font-semibold text-lg text-center">${d.ho_ten || "Chưa rõ tên"}</h3>
            <p class="text-sm text-textmain/70 text-center mb-1">
              ${d.trinh_do || "Trình độ chưa cập nhật"}
            </p>
            <p class="text-xs text-textmain/60 text-center mb-1">
              Kinh nghiệm: ${d.kinh_nghiem ? `${d.kinh_nghiem} năm` : "Chưa rõ"}
            </p>
            <p class="text-xs text-textmain/60 text-center mb-3 italic">
              ${d.mo_ta || ""}
            </p>
            <div class="text-center">
              <a href="#/booking" 
                 class="inline-block bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fa-solid fa-calendar-check mr-2"></i>Đặt lịch
              </a>
            </div>
          </div>`
        )
        .join("");
    }
  
    fetchDoctors();
  }
  
  /* Chờ phần tử xuất hiện trong DOM (vì SPA load async) */
  function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
  
      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
  
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
  
  // Chạy khi load SPA route
  window.addEventListener("DOMContentLoaded", setupDoctorPage);
  window.addEventListener("hashchange", setupDoctorPage);
  