/* ========================================
   👨‍⚕️ Doctor Availability Manager (SPA)
   ======================================== */

   async function setupDoctorAvailability() {
    console.log("🩺 doctor_availability.js loaded");
  
    const tableBody = document.getElementById("lichTrongBody");
    const addForm = document.getElementById("addForm");
    const infoBox = document.getElementById("doctor-info");
  
    if (!tableBody || !addForm || !infoBox) {
      console.error("❌ Không tìm thấy DOM phần tử (có thể chưa render HTML).");
      return;
    }
  
    let maBacSi = null;
    let session = null;
  
    /* 1️⃣ Lấy session bác sĩ */
    try {
      session = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
      const role = (session.user?.vai_tro || "").toLowerCase();
  
      if (!session.logged_in || !["doctor", "admin"].includes(role)) {
        showToast("⚠️ Chỉ bác sĩ mới có quyền truy cập!", "warning");
        window.location.hash = "#/login";
        return;
      }
  
      maBacSi = session.user.ma_bac_si || session.user.id;
      infoBox.textContent = `👨‍⚕️ ${session.user.name || session.user.ho_ten || "Bác sĩ"} (Mã: ${maBacSi})`;
    } catch (err) {
      console.error("❌ Không thể lấy session:", err);
      infoBox.textContent = "❌ Lỗi khi tải thông tin bác sĩ.";
      return;
    }
  
    /* 2️⃣ Hàm tải danh sách lịch trống */
    async function loadLichTrong() {
      try {
        const data = await apiRequest(
          `${API_BASE_URL}?path=lichtrong&action=listByBacSi&ma_bac_si=${maBacSi}`,
          "GET"
        );
        renderTable(data);
      } catch (err) {
        console.error("❌ Lỗi tải lịch trống:", err);
        tableBody.innerHTML = `
          <tr><td colspan="4" class="text-center py-3 text-gray-500">
            Không thể tải lịch trống.
          </td></tr>`;
      }
    }
  
    /* 3️⃣ Render bảng lịch trống */
    function renderTable(list) {
      if (!list || list.length === 0) {
        tableBody.innerHTML = `
          <tr><td colspan="4" class="text-center py-3 text-gray-500">
            Chưa có lịch trống nào.
          </td></tr>`;
        return;
      }
  
      tableBody.innerHTML = list
        .map(
          (l) => `
          <tr class="hover:bg-gray-50 border-b border-gray-100">
            <td class="px-4 py-2">${new Date(l.thoi_gian_bat_dau).toLocaleDateString("vi-VN")}</td>
            <td class="px-4 py-2">${new Date(l.thoi_gian_bat_dau).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}</td>
            <td class="px-4 py-2">${new Date(l.thoi_gian_ket_thuc).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}</td>
            <td class="px-4 py-2 text-right">
              <button data-id="${l.ma_lich_trong}" class="deleteBtn text-red-500 hover:underline">Xoá</button>
            </td>
          </tr>`
        )
        .join("");
    }
  
    /* 4️⃣ Thêm lịch trống */
    /* 4️⃣ Thêm lịch trống */
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ngay = document.getElementById("ngay").value;
  const bat_dau = document.getElementById("bat_dau").value;
  const ket_thuc = document.getElementById("ket_thuc").value;

  if (!ngay || !bat_dau || !ket_thuc) {
    showToast("⚠️ Vui lòng nhập đủ thông tin", "warning");
    return;
  }

  // ✅ Chuẩn hoá thời gian đầu vào
  const thoi_gian_bat_dau = `${ngay} ${bat_dau}:00`;
  const thoi_gian_ket_thuc = `${ngay} ${ket_thuc}:00`;

  // ⚙️ Thời lượng mỗi slot (phút)
  const SLOT_DURATION = 60; // bạn có thể đổi thành 15, 20, 60... tùy nhu cầu

  // 🧩 Hàm tạo các khung giờ con
  // 🧩 Hàm tạo các khung giờ con (không bị lệch múi giờ)
function generateTimeSlots(startStr, endStr, stepMinutes) {
  const slots = [];

  // Parse thủ công tránh timezone shift
  const [startDate, startTime] = startStr.split(" ");
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [startHour, startMinute] = startTime.split(":").map(Number);

  const [endDate, endTime] = endStr.split(" ");
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Tạo Date theo local time (không UTC)
  let current = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
  const endTimeObj = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

  while (current < endTimeObj) {
    const next = new Date(current.getTime() + stepMinutes * 60000);
    if (next <= endTimeObj) {
      slots.push({
        thoi_gian_bat_dau: formatDateTime(current),
        thoi_gian_ket_thuc: formatDateTime(next),
      });
    }
    current = next;
  }
  return slots;
}

// 👉 Helper để format "YYYY-MM-DD HH:mm:ss"
function formatDateTime(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}


  try {
    const slots = generateTimeSlots(thoi_gian_bat_dau, thoi_gian_ket_thuc, SLOT_DURATION);
    console.log("📅 Các khung giờ được tạo:", slots);

    if (slots.length === 0) {
      showToast("⚠️ Khoảng thời gian quá ngắn để chia khung giờ!", "warning");
      return;
    }

    // 📨 Gửi từng slot lên server
    for (const slot of slots) {
      await apiRequest(`${API_BASE_URL}?path=lichtrong&action=POST`, "POST", {
        ma_bac_si: maBacSi,
        ...slot,
      });
    }

    showToast(`✅ Đã thêm ${slots.length} khung giờ trống!`, "success");
    addForm.reset();
    loadLichTrong();
  } catch (err) {
    console.error("❌ Lỗi thêm lịch:", err);
    showToast("Không thể thêm lịch", "error");
  }
});

  
    /* 5️⃣ Xoá lịch trống */
    tableBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".deleteBtn");
      if (!btn) return;
  
      const id = btn.dataset.id;
      if (!confirm("Bạn có chắc muốn xoá lịch này?")) return;
  
      try {
        const res = await apiRequest(
          `${API_BASE_URL}?path=lichtrong&action=DELETE&id=${id}`,
          "DELETE"
        );
        showToast(res.message || "🗑️ Đã xoá lịch trống", "success");
        loadLichTrong();
      } catch (err) {
        console.error("❌ Lỗi xoá:", err);
        showToast("Không thể xoá lịch", "error");
      }
    });
  
    /* 🚀 Khởi tạo */
    loadLichTrong();
  }
  