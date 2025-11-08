async function setupSchedulePage() {
  // 🔍 Chờ đến khi phần tử #schedule-view xuất hiện (fix lỗi load trễ)
  const observer = new MutationObserver(() => {
    const view = document.getElementById("schedule-view");
    if (view) {
      observer.disconnect();
      initSchedulePage(); // Gọi khởi tạo khi DOM đã sẵn sàng
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function initSchedulePage() {
  setTimeout(async () => {
    const view = document.getElementById("schedule-view");
    const loading = document.getElementById("schedule-loading");
    const empty = document.getElementById("schedule-empty");
    const statusSelect = document.getElementById("sch-status");
    const searchInput = document.getElementById("sch-search");
    const btnWeek = document.querySelector('[data-view="week"]');
    const btnList = document.querySelector('[data-view="list"]');

    if (!view) return;
    console.log("🚀 schedule.js loaded — init schedule page");

    let currentView = "week";
    let allSchedules = [];
    let maBenhNhan = null;

    /* 1️⃣ Kiểm tra session đăng nhập */
    try {
      const session = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
if (!session.logged_in || !session.user?.ma_benh_nhan) {
  showToast("⚠️ Vui lòng đăng nhập để xem lịch hẹn", "warning");
  window.location.hash = "#/login";
  return;
}
maBenhNhan = session.user.ma_benh_nhan;
console.log("👤 Mã bệnh nhân:", maBenhNhan);

    } catch (err) {
      console.error("❌ Lỗi lấy session:", err);
      showToast("Không thể xác thực người dùng", "error");
      return;
    }

    /* 2️⃣ Tải danh sách lịch hẹn */
    async function fetchSchedules() {
      toggleLoading(true);
      try {
        const res = await apiRequest(
          `${API_BASE_URL}?path=lichhen&action=listByBenhNhan&ma_benh_nhan=${maBenhNhan}`,
          "GET"
        );
        console.log("📅 Dữ liệu lịch hẹn:", res);
        if (!Array.isArray(res) || res.length === 0)
          return showEmpty("Chưa có lịch hẹn nào.");
        allSchedules = res;
        renderSchedules();
      } catch (err) {
        console.error("❌ Lỗi tải lịch:", err);
        showEmpty("Không thể tải danh sách lịch hẹn.");
      } finally {
        toggleLoading(false);
      }
    }

    /* 3️⃣ Render danh sách */
    function renderSchedules() {
      const keyword = searchInput.value.toLowerCase().trim();
      const status = statusSelect.value;

      const filtered = allSchedules.filter((s) => {
        const matchStatus = status === "all" || s.trang_thai === status;
        const matchKeyword =
          s.ten_bac_si?.toLowerCase().includes(keyword) ||
          s.ghi_chu?.toLowerCase().includes(keyword);
        return matchStatus && matchKeyword;
      });

      if (filtered.length === 0) return showEmpty("Không tìm thấy lịch hẹn phù hợp.");
      empty.classList.add("hidden");

      view.innerHTML =
        currentView === "list" ? renderListView(filtered) : renderWeekView(filtered);
    }

    /* 4️⃣ View: DANH SÁCH */
    function renderListView(list) {
      return `
        <div class="overflow-x-auto rounded-xl border border-gray-200">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase">
              <tr>
                <th class="px-4 py-3 text-left">Bác sĩ</th>
                <th class="px-4 py-3 text-left">Ngày</th>
                <th class="px-4 py-3 text-left">Giờ</th>
                <th class="px-4 py-3 text-left">Trạng thái</th>
                <th class="px-4 py-3 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map(
                  (s) => `
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">${s.ten_bac_si || "—"}</td>
                  <td class="px-4 py-3">${formatDate(s.ngay_hen)}</td>
                  <td class="px-4 py-3">${s.gio_hen || "-"}</td>
                  <td class="px-4 py-3">${formatStatus(s.trang_thai)}</td>
                  <td class="px-4 py-3">${s.ghi_chu || ""}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
    }

    /* 5️⃣ View: TUẦN */
    function renderWeekView(list) {
      const grouped = {};
      list.forEach((item) => {
        const date = formatDate(item.ngay_hen);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      return Object.entries(grouped)
        .map(
          ([date, items]) => `
        <div class="mb-6">
          <h3 class="font-semibold text-sky-600 mb-2">${date}</h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${items
              .map(
                (s) => `
              <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                <p class="font-semibold text-gray-800">${s.ten_bac_si}</p>
                <p class="text-gray-500 text-sm">${s.gio_hen || "-"}</p>
                <p class="text-sm mt-1">${formatStatus(s.trang_thai)}</p>
                ${s.ghi_chu ? `<p class="text-sm text-gray-600 mt-2 italic">${s.ghi_chu}</p>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
        </div>`
        )
        .join("");
    }

    /* 6️⃣ Helpers */
    function formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    function formatStatus(st) {
      const map = {
        CHO_XAC_NHAN: "🕒 Chờ xác nhận",
        DA_XAC_NHAN: "✅ Đã xác nhận",
        HOAN_THANH: "🎉 Hoàn thành",
        DA_HUY: "❌ Đã hủy",
      };
      return map[st] || st;
    }

    function toggleLoading(show) {
      loading.classList.toggle("hidden", !show);
    }

    function showEmpty(msg) {
      view.innerHTML = "";
      empty.querySelector("p").textContent = msg;
      empty.classList.remove("hidden");
    }

    function toggleViewButton(active) {
      document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.classList.remove("bg-sky-500", "text-white", "shadow-md");
        btn.classList.add("bg-gray-50");
      });
      active.classList.add("bg-sky-500", "text-white", "shadow-md");
    }

    /* 7️⃣ Sự kiện UI */
    btnWeek.addEventListener("click", () => {
      currentView = "week";
      toggleViewButton(btnWeek);
      renderSchedules();
    });

    btnList.addEventListener("click", () => {
      currentView = "list";
      toggleViewButton(btnList);
      renderSchedules();
    });

    searchInput.addEventListener("input", () => renderSchedules());
    statusSelect.addEventListener("change", () => renderSchedules());

    /* 🚀 Khởi chạy */
    fetchSchedules();
  }, 300);
}

/* SPA events */
window.addEventListener("DOMContentLoaded", setupSchedulePage);
window.addEventListener("hashchange", setupSchedulePage);
