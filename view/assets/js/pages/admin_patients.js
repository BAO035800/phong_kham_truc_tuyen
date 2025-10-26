(() => {
  /* ============================
     👨‍⚕️ Admin Patient Viewer (Read-only + Search)
     ============================ */

  let patientInit = { fetching: false };
  let allPatients = [];
  let filteredPatients = [];

  async function setupAdminPatientsPage() {
    const view = await waitForElement("#admin_patient-view", 5000);
    if (!view) return;

    const loading = document.getElementById("patient-loading");
    const empty = document.getElementById("patient-empty");
    const searchInput = document.getElementById("patientSearch");
    const clearBtn = document.getElementById("btnClearSearch");

    /* 1️⃣ Fetch danh sách bệnh nhân */
    async function fetchPatients() {
      if (patientInit.fetching) return;
      patientInit.fetching = true;
      toggleLoading(true);
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=benhnhan`, "GET");
        allPatients = Array.isArray(res) ? res : [];
        filteredPatients = allPatients;
        renderPatients();
      } catch (err) {
        console.error("❌ Lỗi tải danh sách bệnh nhân:", err);
        showEmpty("Không thể tải danh sách bệnh nhân.");
      } finally {
        toggleLoading(false);
        patientInit.fetching = false;
      }
    }

    /* 2️⃣ Render danh sách */
    function renderPatients() {
      if (!filteredPatients.length) return showEmpty("Không tìm thấy bệnh nhân.");
      empty.classList.add("hidden");

      view.innerHTML = `
        <table class="min-w-full text-sm">
          <thead class="bg-primary50 text-textmain/80">
            <tr>
              <th class="px-3 py-2 text-left">Mã BN</th>
              <th class="px-3 py-2 text-left">Họ tên</th>
              <th class="px-3 py-2 text-left">Ngày sinh</th>
              <th class="px-3 py-2 text-left">Giới tính</th>
              <th class="px-3 py-2 text-left">Loại</th>
              <th class="px-3 py-2 text-left">Điện thoại</th>
              <th class="px-3 py-2 text-left">Email</th>
              <th class="px-3 py-2 text-left">Địa chỉ</th>
            </tr>
          </thead>
          <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
            ${filteredPatients
              .map(
                (p) => `
                <tr>
                  <td class="px-3 py-2">${p.ma_benh_nhan}</td>
                  <td class="px-3 py-2">${p.ho_ten}</td>
                  <td class="px-3 py-2">${p.ngay_sinh || "-"}</td>
                  <td class="px-3 py-2">${p.gioi_tinh || "-"}</td>
                  <td class="px-3 py-2">${formatType(p.loai_benh_nhan)}</td>
                  <td class="px-3 py-2">${p.so_dien_thoai || "-"}</td>
                  <td class="px-3 py-2">${p.email || "-"}</td>
                  <td class="px-3 py-2">${p.dia_chi || "-"}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
    }

    /* 3️⃣ Định dạng loại bệnh nhân */
    function formatType(type) {
      const map = {
        MOI: '<span class="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-lg">Mới</span>',
        CU: '<span class="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-lg">Tái khám</span>',
      };
      return map[type] || "-";
    }

    /* 4️⃣ Tìm kiếm */
    searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      filteredPatients = !q
        ? allPatients
        : allPatients.filter(
            (p) =>
              p.ho_ten?.toLowerCase().includes(q) ||
              p.email?.toLowerCase().includes(q) ||
              p.so_dien_thoai?.toLowerCase().includes(q) ||
              p.loai_benh_nhan?.toLowerCase().includes(q)
          );
      renderPatients();
    });

    clearBtn?.addEventListener("click", () => {
      searchInput.value = "";
      filteredPatients = allPatients;
      renderPatients();
    });

    /* Helpers */
    function toggleLoading(show) {
      loading?.classList.toggle("hidden", !show);
    }

    function showEmpty(msg) {
      view.innerHTML = "";
      empty.textContent = msg;
      empty.classList.remove("hidden");
    }

    fetchPatients();
  }

  /* Chờ phần tử xuất hiện (SPA safe) */
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

  window.addEventListener("DOMContentLoaded", setupAdminPatientsPage);
  window.addEventListener("hashchange", setupAdminPatientsPage);
})();
