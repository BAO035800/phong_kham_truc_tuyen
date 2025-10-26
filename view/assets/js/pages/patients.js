let patientInit = {
  listenersBound: false,
  fetching: false,
};

async function setupPatientsPage() {
  // Đợi cho đến khi patient-view xuất hiện (SPA render xong)
  const view = await waitForElement("#patient-view", 5000);
  if (!view) return; // không có view sau 5s thì bỏ qua quietly

  const loading = document.getElementById("patient-loading");
  const empty = document.getElementById("patient-empty");
  const filterSelect = document.getElementById("patientFilter");
  const searchInput = document.getElementById("patientSearch");

  // Chỉ gắn listeners 1 lần
  if (!patientInit.listenersBound && filterSelect && searchInput) {
    searchInput.addEventListener("input", renderPatients);
    filterSelect.addEventListener("change", renderPatients);
    patientInit.listenersBound = true;
  }

  // Lần nào vào route cũng refetch để đảm bảo dữ liệu mới
  fetchPatients();

  /* --- dưới đây là các hàm dùng chung, giữ nguyên hoặc đặt ra ngoài nếu bạn tách module --- */

  let allPatients = [];

  async function fetchPatients() {
    if (patientInit.fetching) return; // chống trùng lặp nếu hashchange liên tiếp
    patientInit.fetching = true;
    toggleLoading(true);
    try {
      const res = await apiRequest(`${API_BASE_URL}?path=benhnhan`, "GET");
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
      patientInit.fetching = false;
    }
  }

  function renderPatients() {
    const keyword = (document.getElementById("patientSearch")?.value || "")
      .toLowerCase()
      .trim();
    const filter = document.getElementById("patientFilter")?.value || "all";
    const viewEl = document.getElementById("patient-view");
    const emptyEl = document.getElementById("patient-empty");

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
    emptyEl?.classList.add("hidden");
    if (viewEl) viewEl.innerHTML = renderTable(filtered);
  }

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

  function tinhTuoi(dateStr) {
    if (!dateStr) return "-";
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
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
    document.getElementById("patient-loading")?.classList.toggle("hidden", !show);
  }

  function showEmpty(msg) {
    const viewEl = document.getElementById("patient-view");
    const emptyEl = document.getElementById("patient-empty");
    if (viewEl) viewEl.innerHTML = "";
    if (emptyEl) {
      emptyEl.textContent = msg;
      emptyEl.classList.remove("hidden");
    }
  }
}

// Đợi phần tử với MutationObserver (ổn định hơn setTimeout)
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

    if (timeoutMs > 0) {
      setTimeout(() => {
        obs.disconnect();
        resolve(null);
      }, timeoutMs);
    }
  });
}

/* SPA events */
window.addEventListener("DOMContentLoaded", setupPatientsPage);
window.addEventListener("hashchange", setupPatientsPage);
