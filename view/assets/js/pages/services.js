async function setupServicesPage() {
    setTimeout(async () => {
      const grid = document.getElementById("svc-grid");
      const cats = document.getElementById("svc-cats");
      const searchInput = document.getElementById("svc-search");
      const loading = document.getElementById("svc-loading");
      const empty = document.getElementById("svc-empty");
  
      if (!grid) return;
      console.log("🚀 services.js loaded — init services page");
  
      let allChuyenKhoa = [];
      let allDichVu = [];
      let currentCat = null;
      const cache = {}; // 🔹 cache dịch vụ từng chuyên khoa
  
      /* 1️⃣ Tải danh sách chuyên khoa */
      async function fetchChuyenKhoa() {
        toggleLoading(true);
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "GET");
          if (!Array.isArray(res)) throw new Error("Dữ liệu chuyên khoa không hợp lệ");
          allChuyenKhoa = res;
          renderCategoryButtons();
          showEmpty("Vui lòng chọn chuyên khoa để xem dịch vụ.");
        } catch (err) {
          console.error("❌ Lỗi tải chuyên khoa:", err);
          showEmpty("Không thể tải danh sách chuyên khoa.");
        } finally {
          toggleLoading(false);
        }
      }
  
      /* 2️⃣ Lấy danh sách dịch vụ */
      async function fetchDichVu(maChuyenKhoa = "all") {
        toggleLoading(true);
        try {
          // Cache
          if (cache[maChuyenKhoa]) {
            allDichVu = cache[maChuyenKhoa];
            renderServices();
            toggleLoading(false);
            return;
          }
  
          let url = `${API_BASE_URL}?path=dichvu`;
          if (maChuyenKhoa !== "all") {
            url += `&action=listByChuyenKhoa&ma_chuyen_khoa=${maChuyenKhoa}`;
          }
  
          const res = await apiRequest(url, "GET");
          console.log("💊 Dữ liệu dịch vụ:", res);
  
          if (!Array.isArray(res) || res.length === 0)
            return showEmpty("Chưa có dịch vụ cho chuyên khoa này.");
  
          allDichVu = res;
          cache[maChuyenKhoa] = res;
          renderServices();
        } catch (err) {
          console.error("❌ Lỗi tải dịch vụ:", err);
          showEmpty("Không thể tải danh sách dịch vụ.");
        } finally {
          toggleLoading(false);
        }
      }
  
      /* 3️⃣ Tạo các nút chuyên khoa */
      function renderCategoryButtons() {
        cats.innerHTML = `
          <button data-cat="all" class="svc-chip rounded-full px-4 py-1.5 text-sm bg-primary text-white shadow">
            Tất cả
          </button>`;
        allChuyenKhoa.forEach((khoa) => {
          cats.insertAdjacentHTML(
            "beforeend",
            `<button data-cat="${khoa.ma_chuyen_khoa}"
              class="svc-chip rounded-full px-4 py-1.5 text-sm border border-border hover:bg-bgpage">
              ${khoa.ten_chuyen_khoa}
            </button>`
          );
        });
      }
  
      /* 4️⃣ Hiển thị dịch vụ */
      function renderServices() {
        const keyword = searchInput.value.toLowerCase().trim();
        const filtered = allDichVu.filter((s) =>
          s.ten_dich_vu.toLowerCase().includes(keyword)
        );
  
        if (filtered.length === 0) return showEmpty("Không tìm thấy dịch vụ phù hợp.");
        empty.classList.add("hidden");
  
        grid.innerHTML = filtered
          .map(
            (s) => `
            <article class="svc-card bg-white rounded-xl shadow-card p-6 border border-border" data-aos="fade-up">
              <div class="flex items-start gap-4">
                <div class="text-3xl text-primary"><i class="fa-solid fa-stethoscope"></i></div>
                <div class="flex-1">
                  <h3 class="font-semibold text-lg mb-1">${s.ten_dich_vu}</h3>
                  <p class="text-sm text-textmain/70 mb-3">${s.mo_ta || "Không có mô tả"}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-primary font-semibold">
                      từ ${Number(s.gia_dich_vu).toLocaleString("vi-VN")}đ
                    </span>
                    <a href="#/booking" class="text-sm bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90">
                      <i class="fa-solid fa-calendar-check mr-1"></i>Đặt lịch
                    </a>
                  </div>
                </div>
              </div>
            </article>`
          )
          .join("");
      }
  
      /* 5️⃣ Loading / Empty */
      function toggleLoading(show) {
        if (!loading) return;
        loading.classList.toggle("hidden", !show);
      }
  
      function showEmpty(msg) {
        grid.innerHTML = "";
        empty.querySelector("p").textContent = msg;
        empty.classList.remove("hidden");
      }
  
      /* 6️⃣ Sự kiện UI */
      cats.addEventListener("click", async (e) => {
        if (!e.target.matches(".svc-chip")) return;
  
        // đổi style nút đang chọn
        document
          .querySelectorAll(".svc-chip")
          .forEach((b) => b.classList.remove("bg-primary", "text-white", "shadow"));
        e.target.classList.add("bg-primary", "text-white", "shadow");
  
        currentCat = e.target.dataset.cat;
  
        if (currentCat === "all") {
          await fetchDichVu("all");
        } else {
          await fetchDichVu(currentCat);
        }
      });
  
      searchInput.addEventListener("input", () => renderServices());
  
      /* 🚀 7️⃣ Khởi chạy */
      await fetchChuyenKhoa();

// 🟢 Sau khi đã render xong nút chuyên khoa, gọi luôn “Tất cả”
        const firstBtn = document.querySelector('#svc-cats [data-cat="all"]');
        if (firstBtn) firstBtn.click();

    }, 300);
  }
  
  /* SPA events */
  window.addEventListener("DOMContentLoaded", setupServicesPage);
  window.addEventListener("hashchange", setupServicesPage);
  