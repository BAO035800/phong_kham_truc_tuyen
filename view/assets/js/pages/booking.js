async function setupBookingPage() {
    setTimeout(async () => {
      const form = document.getElementById("bookingForm");
      const specialtySelect = document.getElementById("specialtySelect");
      const serviceSelect = document.getElementById("serviceSelect");
      const doctorSelect = document.getElementById("doctorSelect");
      const dateInput = document.getElementById("date");
      const timeSelect = document.getElementById("timeSelect");
      const noteInput = document.getElementById("note");
      const statusMsg = document.getElementById("statusMsg");
  
      if (!form) return;
  
      console.log("🚀 booking.js loaded — init form controls");
  
      /* 1️⃣ Lấy danh sách chuyên khoa */
      try {
        const specialties = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa&action=listCongKhai`, "GET");
        console.log("📚 Chuyên khoa nhận được:", specialties);
  
        specialtySelect.innerHTML = `<option value="" selected disabled>-- Chọn chuyên khoa --</option>`;
        specialties.forEach((ck) => {
          const opt = document.createElement("option");
          opt.value = ck.ma_chuyen_khoa;
          opt.textContent = ck.ten_chuyen_khoa;
          specialtySelect.appendChild(opt);
        });
      } catch (err) {
        console.error("❌ Lỗi tải chuyên khoa:", err);
        statusMsg.textContent = "⚠️ Không thể tải danh sách chuyên khoa.";
        return;
      }
  
      /* 2️⃣ Khi chọn chuyên khoa → tải dịch vụ */
      specialtySelect.addEventListener("change", async (e) => {
        const ma_chuyen_khoa = e.target.value;
        console.log("🧭 Chuyên khoa được chọn:", ma_chuyen_khoa);
  
        serviceSelect.innerHTML = `<option selected disabled>⏳ Đang tải dịch vụ...</option>`;
        doctorSelect.innerHTML = `<option disabled selected>-- Chọn dịch vụ trước --</option>`;
  
        try {
          const services = await apiRequest(
            `${API_BASE_URL}?path=dichvu&action=listByChuyenKhoa&ma_chuyen_khoa=${ma_chuyen_khoa}`,
            "GET"
          );
          console.log("🧩 Dịch vụ nhận được:", services);
  
          serviceSelect.innerHTML = `<option value="" selected disabled>-- Chọn dịch vụ --</option>`;
          services.forEach((dv) => {
            const opt = document.createElement("option");
            opt.value = dv.ma_dich_vu;
            opt.textContent = `${dv.ten_dich_vu} (${parseFloat(dv.gia_dich_vu).toLocaleString()}₫)`;
            serviceSelect.appendChild(opt);
          });
        } catch (err) {
          console.error("❌ Lỗi tải dịch vụ:", err);
          serviceSelect.innerHTML = `<option disabled selected>⚠️ Không thể tải dịch vụ</option>`;
        }
      });
  
      /* 3️⃣ Khi chọn dịch vụ → tải bác sĩ cùng chuyên khoa */
      serviceSelect.addEventListener("change", async () => {
        const ma_chuyen_khoa = specialtySelect.value;
        console.log("👨‍⚕️ Tải bác sĩ theo chuyên khoa:", ma_chuyen_khoa);
  
        doctorSelect.innerHTML = `<option selected disabled>⏳ Đang tải bác sĩ...</option>`;
  
        try {
          const doctors = await apiRequest(
            `${API_BASE_URL}?path=bacsi&action=listByChuyenKhoa&ma_chuyen_khoa=${ma_chuyen_khoa}`,
            "GET"
          );
          console.log("👨‍⚕️ Danh sách bác sĩ:", doctors);
  
          doctorSelect.innerHTML = `<option value="" selected disabled>-- Chọn bác sĩ --</option>`;
          doctors.forEach((bs) => {
            const opt = document.createElement("option");
            opt.value = bs.ma_bac_si;
            opt.textContent = `BS. ${bs.ho_ten} — ${bs.trinh_do}`;
            doctorSelect.appendChild(opt);
          });
        } catch (err) {
          console.error("❌ Lỗi tải bác sĩ:", err);
          doctorSelect.innerHTML = `<option disabled selected>⚠️ Không thể tải bác sĩ</option>`;
        }
      });
  
      /* 4️⃣ Khi chọn bác sĩ → tải lịch trống */
      doctorSelect.addEventListener("change", async (e) => {
        const ma_bac_si = e.target.value;
        console.log("🕒 Đang tải lịch trống cho bác sĩ:", ma_bac_si);
        statusMsg.textContent = "⏳ Đang tải lịch trống...";
  
        try {
          const lich = await apiRequest(
            `${API_BASE_URL}?path=lichtrong&action=listCongKhai&ma_bac_si=${ma_bac_si}`,
            "GET"
          );
          console.log("📅 Lịch trống:", lich);
  
          const groupByDate = {};
          lich.forEach((l) => {
            const date = l.thoi_gian_bat_dau.split(" ")[0];
            const time = l.thoi_gian_bat_dau.split(" ")[1].slice(0, 5);
            if (!groupByDate[date]) groupByDate[date] = [];
            groupByDate[date].push(time);
          });
  
          dateInput.addEventListener("change", () => {
            const selectedDate = dateInput.value;
            console.log("📆 Ngày chọn:", selectedDate);
            const times = groupByDate[selectedDate] || [];
            timeSelect.innerHTML = `<option value="" disabled selected>${
              times.length ? "— Chọn giờ khám —" : "Không có giờ trống —"
            }</option>`;
            times.forEach((t) => {
              const opt = document.createElement("option");
              opt.value = t;
              opt.textContent = t;
              timeSelect.appendChild(opt);
            });
          });
          statusMsg.textContent = "";
        } catch (err) {
          console.error("❌ Lỗi tải lịch trống:", err);
          statusMsg.textContent = "⚠️ Không thể tải lịch trống.";
        }
      });
  
      /* 5️⃣ Gửi form đặt lịch */
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ma_bac_si = doctorSelect.value;
        const ngay = dateInput.value;
        const gio = timeSelect.value;
        const ghi_chu = noteInput.value.trim();
        const ma_dich_vu = serviceSelect.value;
  
        if (!ma_bac_si || !ngay || !gio || !ma_dich_vu) {
          statusMsg.textContent = "⚠️ Vui lòng chọn đủ thông tin.";
          return;
        }
  
        // ✅ Kiểm tra session đăng nhập
        let ma_benh_nhan = null;
        try {
          const data = await apiRequest(`${API_BASE_URL}?path=session`, "GET");
          console.log("🧾 Session hiện tại:", data);
          if (data.logged_in && data.user?.ma_benh_nhan) {
  ma_benh_nhan = data.user.ma_benh_nhan;
}

          else {
            showToast("⚠️ Bạn cần đăng nhập để đặt lịch", "warning");
            window.location.hash = "#/login";
            return;
          }
        } catch (err) {
          console.error("❌ Lỗi kiểm tra session:", err);
          return;
        }
  
        const payload = { ma_benh_nhan, ma_bac_si: Number(ma_bac_si), ma_dich_vu: Number(ma_dich_vu), ngay, gio, ghi_chu };
        console.log("📤 Payload gửi backend:", payload);
  
        statusMsg.textContent = "⏳ Đang gửi yêu cầu...";
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=lichhen&action=datLich`, "POST", payload);
          console.log("✅ Phản hồi đặt lịch:", res);
          showToast("🎉 Đặt lịch thành công!", "success");
          statusMsg.textContent = "✅ Đặt lịch thành công!";
          form.reset();
        } catch (err) {
          console.error("❌ Lỗi đặt lịch:", err);
          showToast("❌ Đặt lịch thất bại", "error");
          statusMsg.textContent = "❌ Không thể đặt lịch, vui lòng thử lại.";
        }
      });
    }, 300);
  }
  
  window.addEventListener("DOMContentLoaded", setupBookingPage);
  window.addEventListener("hashchange", setupBookingPage);
  