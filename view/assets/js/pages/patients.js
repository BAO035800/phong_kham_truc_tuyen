async function setupPatientsPage() {
    setTimeout(async () => {
      const view = document.getElementById("patient-view");
      const loading = document.getElementById("patient-loading");
      const empty = document.getElementById("patient-empty");
      const filterSelect = document.getElementById("patientFilter");
      const searchInput = document.getElementById("patientSearch");
  
      if (!view) return;
      console.log("🚀 patients.js loaded — init patient page");
  
      let allPatients = [];
  
      /* 1️⃣ Lấy danh sách bệnh nhân */
      async function fetchPatients() {
        toggleLoading(true);
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=benhnhan`, "GET");
          console.log("🧾 Danh sách bệnh nhân:", res);
  
          if (!Array.isArray(res) || res.length === 0) {
            return showEmpty("Không có bệnh nhân nào trong hệ thống.");
          }
  
          allPatients = res;
          renderPatients();
        } catch (err) {
          console.error("❌ Lỗi tải danh sách:", err);
          showEmpty("Không thể tải danh sách bệnh nhân.");
        } finally {
          toggleLoading(false);
        }
      }
  
      /* 2️⃣ Hiển thị danh sách */
      function renderPatients() {
        const keyword = searchInput.value.toLowerCase().trim();
        const filter = filterSelect.value;
  
        const filtered = allPatients.filter((p) => {
          const matchKeyword =
            p.ho_ten?.toLowerCase().includes(keyword) ||
            String(p.ma_benh_nhan).includes(keyword);
          const matchType =
            filter === "all" ||
            (filter === "new" && p.loai_benh_nhan === "MOI") ||
            (filter === "followup" && p.loai_benh_nhan === "CU");
          return matchKeyword && matchType;
        });
  
        if (filtered.length === 0) return showEmpty("Không tìm thấy bệnh nhân phù hợp.");
        empty.classList.add("hidden");
  
        view.innerHTML = renderTable(filtered);
      }
  
      /* 3️⃣ Bảng danh sách bệnh nhân (không có hành động) */
      function renderTable(list) {
        return `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-primary/10 text-xs font-semibold uppercase text-primary">
                <tr>
                  <th class="px-4 py-3 text-left">Họ và tên</th>
                  <th class="px-4 py-3 text-left">Mã BN</th>
                  <th class="px-4 py-3 text-left">Giới tính</th>
                  <th class="px-4 py-3 text-left">Tuổi</th>
                  <th class="px-4 py-3 text-left">Loại bệnh nhân</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
                ${list
                  .map(
                    (p) => `
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 font-medium text-gray-900">${p.ho_ten}</td>
                      <td class="px-4 py-3">${p.ma_benh_nhan}</td>
                      <td class="px-4 py-3">${p.gioi_tinh || "-"}</td>
                      <td class="px-4 py-3">${tinhTuoi(p.ngay_sinh)}</td>
                      <td class="px-4 py-3">${formatLoaiBenhNhan(p.loai_benh_nhan)}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      }
  
      /* 4️⃣ Helpers */
      function tinhTuoi(dateStr) {
        if (!dateStr) return "-";
        const birth = new Date(dateStr);
        const diff = new Date().getFullYear() - birth.getFullYear();
        return diff;
      }
  
      function formatLoaiBenhNhan(type) {
        const map = {
          MOI: '<span class="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-lg">Mới</span>',
          CU: '<span class="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-lg">Tái khám</span>',
          MAN_TINH: '<span class="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-lg">Mãn tính</span>',
        };
        return map[type] || "-";
      }
  
      function toggleLoading(show) {
        loading.classList.toggle("hidden", !show);
      }
  
      function showEmpty(msg) {
        view.innerHTML = "";
        empty.textContent = msg;
        empty.classList.remove("hidden");
      }
  
      /* 5️⃣ Sự kiện UI */
      searchInput.addEventListener("input", renderPatients);
      filterSelect.addEventListener("change", renderPatients);
  
      /* 🚀 Khởi chạy */
      fetchPatients();
    }, 300);
  }
  
  /* SPA events */
  window.addEventListener("DOMContentLoaded", setupPatientsPage);
  window.addEventListener("hashchange", setupPatientsPage);
  