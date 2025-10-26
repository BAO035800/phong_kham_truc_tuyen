/* ============================
   👨‍⚕️ Doctor Dashboard Logic (SPA Safe, Fixed #doc-info)
   ============================ */

   async function setupDoctorDashboard() {
    setTimeout(async () => {
      console.log("🚀 doctor_dashboard.js initializing...");
  
      /* 🕐 Helper: Đợi phần tử xuất hiện (tránh null) */
      async function waitForElement(selector, timeout = 3000) {
        return new Promise((resolve, reject) => {
          const start = Date.now();
          (function check() {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            if (Date.now() - start >= timeout) return reject(`Timeout: ${selector} not found`);
            requestAnimationFrame(check);
          })();
        });
      }
  
      // ⏳ Đợi các phần tử chính của trang xuất hiện
      const [
        tableBody,
        totalCount,
        arrivedCount,
        doneCount,
        dateFilter,
        reloadBtn,
        docInfo,
      ] = await Promise.all([
        waitForElement("#doctor-schedule").catch(() => null),
        waitForElement("#total-count").catch(() => null),
        waitForElement("#arrived-count").catch(() => null),
        waitForElement("#done-count").catch(() => null),
        waitForElement("#dateFilter").catch(() => null),
        waitForElement("#reloadBtn").catch(() => null),
        waitForElement("#doc-info").catch(() => null),
      ]);
  
      if (!tableBody || !docInfo) {
        console.warn("⚠️ Trang bác sĩ chưa render hoàn toàn, bỏ qua khởi tạo.");
        return;
      }
  
      let maBacSi = null;
      let selectedDate = new Date().toISOString().split("T")[0];
      let session = null;
  
      /* 1️⃣ Lấy session */
      try {
        session = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
        console.log("🧾 Session:", session);
  
        const role = (session.user?.vai_tro || "").toLowerCase();
  
        // ✅ Chỉ cho phép doctor hoặc admin
        if (!session.logged_in || !["doctor", "admin"].includes(role)) {
          console.warn("🚫 Không có quyền truy cập Doctor Dashboard:", role);
          showToast("⚠️ Chỉ bác sĩ mới được truy cập trang này", "warning");
          window.location.hash = "#/login";
          return;
        }
  
        // ✅ Lấy mã bác sĩ từ session
        maBacSi = session.user.ma_bac_si || session.user.id;
  
        if (dateFilter) dateFilter.value = selectedDate;
        updateHeader(session.user.name || session.user.ho_ten || "Không rõ", selectedDate);
      } catch (err) {
        console.error("❌ Không thể lấy session:", err);
        return;
      }
  
      /* 2️⃣ Cập nhật tiêu đề */
      function updateHeader(hoTen, date) {
        if (!docInfo) return;
        const d = new Date(date);
        docInfo.textContent = `BS. ${hoTen} · ${d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`;
      }
  
      /* 3️⃣ Gọi API lấy lịch bác sĩ */
      async function fetchDoctorSchedule(date = selectedDate) {
        try {
          const data = await apiRequest(
            `${API_BASE_URL}?path=lichhen&action=listByBacSi&ma_bac_si=${maBacSi}&ngay=${date}`,
            "GET"
          );
          console.log("📅 Lịch hẹn:", data);
          renderSchedule(data);
        } catch (err) {
          console.error("❌ Lỗi tải lịch bác sĩ:", err);
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center py-6 text-gray-500">
                Không thể tải lịch hẹn.
              </td>
            </tr>`;
        }
      }
  
      /* 4️⃣ Render danh sách lịch */
      function renderSchedule(list) {
        if (!list || list.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center py-6 text-gray-500">
                Không có lịch hẹn trong ngày này.
              </td>
            </tr>`;
          totalCount.textContent = 0;
          arrivedCount.textContent = 0;
          doneCount.textContent = 0;
          return;
        }
  
        totalCount.textContent = list.length;
        arrivedCount.textContent = list.filter((s) => s.trang_thai === "DA_XAC_NHAN").length;
        doneCount.textContent = list.filter((s) => s.trang_thai === "HOAN_THANH").length;
  
        tableBody.innerHTML = list
          .map(
            (s) => `
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3">${s.gio_hen || "-"}</td>
            <td class="px-4 py-3">
              <div class="font-medium">${s.ten_benh_nhan}</div>
              <div class="text-xs text-gray-500">${s.ghi_chu || ""}</div>
            </td>
            <td class="px-4 py-3">${s.ten_dich_vu}</td>
            <td class="px-4 py-3">${renderStatusBadge(s.trang_thai)}</td>
            <td class="px-4 py-3 text-right">${renderActions(s)}</td>
          </tr>`
          )
          .join("");
      }
  
      /* 5️⃣ Badge trạng thái */
      function renderStatusBadge(st) {
        const map = {
          CHO_XAC_NHAN: "bg-amber-50 text-amber-700 ring-amber-200",
          DA_XAC_NHAN: "bg-blue-50 text-blue-700 ring-blue-200",
          HOAN_THANH: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          DA_HUY: "bg-red-50 text-red-700 ring-red-200",
        };
        const name = {
          CHO_XAC_NHAN: "Chờ xác nhận",
          DA_XAC_NHAN: "Đã xác nhận",
          HOAN_THANH: "Hoàn tất",
          DA_HUY: "Đã hủy",
        };
        return `
          <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
            map[st] || "bg-gray-100 text-gray-600"
          }">
            <span class="size-1.5 rounded-full bg-current"></span>${name[st] || st}
          </span>`;
      }
  
      /* 6️⃣ Hành động */
      function renderActions(s) {
        if (s.trang_thai === "CHO_XAC_NHAN")
          return `<button class="action-btn bg-sky-500 text-white px-3 py-1.5 text-xs rounded-lg"
                  data-id="${s.ma_lich_hen}" data-act="DA_XAC_NHAN">Xác nhận</button>`;
        if (s.trang_thai === "DA_XAC_NHAN")
          return `<button class="action-btn bg-emerald-600 text-white px-3 py-1.5 text-xs rounded-lg"
                  data-id="${s.ma_lich_hen}" data-act="HOAN_THANH">Hoàn tất</button>`;
        if (s.trang_thai === "HOAN_THANH")
          return `<span class="text-xs text-gray-500">✅ Đã xong</span>`;
        return "";
      }
  
      /* 7️⃣ Cập nhật trạng thái */
      tableBody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".action-btn");
        if (!btn) return;
  
        const ma_lich = btn.dataset.id;
        const act = btn.dataset.act;
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=lichhen&action=updateTrangThai`, "POST", {
            ma_lich_hen: ma_lich,
            trang_thai: act,
          });
          showToast(res.message || "Đã cập nhật lịch", "success");
          fetchDoctorSchedule(selectedDate);
        } catch (err) {
          console.error("❌ Lỗi cập nhật:", err);
          showToast("Không thể cập nhật lịch", "error");
        }
      });
  
      /* 8️⃣ Sự kiện ngày + reload */
      dateFilter?.addEventListener("change", (e) => {
        selectedDate = e.target.value;
        updateHeader(session.user.name, selectedDate);
        fetchDoctorSchedule(selectedDate);
      });
  
      reloadBtn?.addEventListener("click", () => fetchDoctorSchedule(selectedDate));
  
      /* 🚀 Khởi tạo ban đầu */
      fetchDoctorSchedule(selectedDate);
    }, 300);
  }
  
  /* ============================================
     ✅ Wrapper chỉ chạy khi đúng route SPA
     ============================================ */
  function initDoctorDashboardOnce() {
    if (window.location.hash !== "#/doctor-dashboard") return;
    if (window.__doctorDashboardLoaded) return;
    window.__doctorDashboardLoaded = true;
    setupDoctorDashboard();
  }
  
  window.addEventListener("DOMContentLoaded", initDoctorDashboardOnce);
  window.addEventListener("hashchange", initDoctorDashboardOnce);
  