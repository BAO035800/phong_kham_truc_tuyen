(() => {
    /* ============================
       👨‍⚕️ Admin Doctor Viewer (Read-only + Search)
       ============================ */
  
    let doctorInit = { fetching: false };
    let allDoctors = [];
    let filteredDoctors = [];
    let allSpecialties = [];
  
    async function setupAdminDoctorsPage() {
      const view = await waitForElement("#doctor-view", 5000);
      if (!view) return;
  
      const loading = document.getElementById("doctor-loading");
      const empty = document.getElementById("doctor-empty");
      const searchInput = document.getElementById("doctorSearch");
      const clearBtn = document.getElementById("btnClearSearch");
  
      /* 1️⃣ Lấy danh sách chuyên khoa */
      async function fetchSpecialties() {
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "GET");
          allSpecialties = Array.isArray(res) ? res : [];
        } catch (err) {
          console.error("❌ Lỗi tải chuyên khoa:", err);
        }
      }
  
      /* 2️⃣ Lấy danh sách bác sĩ */
      async function fetchDoctors() {
        if (doctorInit.fetching) return;
        doctorInit.fetching = true;
        toggleLoading(true);
  
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=bacsi`, "GET");
          allDoctors = Array.isArray(res) ? res : [];
          filteredDoctors = allDoctors;
          renderDoctors();
        } catch (err) {
          console.error("❌ Lỗi tải danh sách bác sĩ:", err);
          showEmpty("Không thể tải danh sách bác sĩ.");
        } finally {
          toggleLoading(false);
          doctorInit.fetching = false;
        }
      }
  
      /* 3️⃣ Hiển thị bảng */
      function renderDoctors() {
        if (!filteredDoctors.length) return showEmpty("Không có bác sĩ.");
        empty.classList.add("hidden");
  
        view.innerHTML = `
          <table class="min-w-full text-sm">
            <thead class="bg-primary50 text-textmain/80">
              <tr>
                <th class="px-3 py-2 text-left">Mã BS</th>
                <th class="px-3 py-2 text-left">Họ tên</th>
                <th class="px-3 py-2 text-left">Chuyên khoa</th>
                <th class="px-3 py-2 text-left">Trình độ</th>
                <th class="px-3 py-2 text-left">Kinh nghiệm</th>
                <th class="px-3 py-2 text-left">Mô tả</th>
              </tr>
            </thead>
            <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
              ${filteredDoctors
                .map(
                  (d) => `
                  <tr>
                    <td class="px-3 py-2">${d.ma_bac_si}</td>
                    <td class="px-3 py-2">${d.ho_ten}</td>
                    <td class="px-3 py-2">${getSpecialtyName(d.ma_chuyen_khoa)}</td>
                    <td class="px-3 py-2">${d.trinh_do || "-"}</td>
                    <td class="px-3 py-2">${d.kinh_nghiem ? d.kinh_nghiem + " năm" : "-"}</td>
                    <td class="px-3 py-2">${d.mo_ta || "-"}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>`;
      }
  
      function getSpecialtyName(id) {
        const s = allSpecialties.find(
          (x) => String(x.ma_chuyen_khoa) === String(id)
        );
        return s ? s.ten_chuyen_khoa : "-";
      }
  
      /* 4️⃣ Tìm kiếm */
      searchInput?.addEventListener("input", (e) => {
        const q = e.target.value.trim().toLowerCase();
        filteredDoctors = !q
          ? allDoctors
          : allDoctors.filter(
              (d) =>
                d.ho_ten?.toLowerCase().includes(q) ||
                d.trinh_do?.toLowerCase().includes(q) ||
                d.mo_ta?.toLowerCase().includes(q) ||
                getSpecialtyName(d.ma_chuyen_khoa)
                  ?.toLowerCase()
                  .includes(q)
            );
        renderDoctors();
      });
  
      clearBtn?.addEventListener("click", () => {
        searchInput.value = "";
        filteredDoctors = allDoctors;
        renderDoctors();
      });
  
      function toggleLoading(show) {
        loading?.classList.toggle("hidden", !show);
      }
      function showEmpty(msg) {
        view.innerHTML = "";
        empty.textContent = msg;
        empty.classList.remove("hidden");
      }
  
      await fetchSpecialties();
      await fetchDoctors();
    }
  
    /* Chờ phần tử xuất hiện (SPA support) */
    function waitForElement(selector, timeoutMs = 3000) {
      return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        const obs = new MutationObserver(() => {
          const found = document.querySelector(selector);
          if (found) {
            obs.disconnect();
            resolve(found);
          }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(null);
        }, timeoutMs);
      });
    }
  
    window.addEventListener("DOMContentLoaded", setupAdminDoctorsPage);
    window.addEventListener("hashchange", setupAdminDoctorsPage);
  })();
  