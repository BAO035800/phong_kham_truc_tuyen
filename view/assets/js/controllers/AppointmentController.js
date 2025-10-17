const AppointmentController = {
  async initSchedulePage(){
    // Filters
    const [doctors, specialties, branches] = await Promise.all([DoctorModel.all({}), DoctorModel.specialties(), DoctorModel.branches()]);
    $("#filterDoctor").innerHTML = `<option value=''>Bác sĩ</option>` + doctors.map(d=>`<option value="${d.ma_bac_si}">${helpers.escapeHTML(d.ho_ten)}</option>`).join("");
    $("#filterSpecialty").innerHTML = `<option value=''>Chuyên khoa</option>` + specialties.map(s=>`<option value="${s.ma_chuyen_khoa}">${helpers.escapeHTML(s.ten_chuyen_khoa)}</option>`).join("");
    $("#filterBranch").innerHTML = `<option value=''>Chi nhánh</option>` + branches.map(b=>`<option value="${b.ma_chi_nhanh}">${helpers.escapeHTML(b.ten_chi_nhanh)}</option>`).join("");

    const qs = new URLSearchParams(location.hash.split("?")[1] || "");
    if(qs.get("doctor")) $("#filterDoctor").value = qs.get("doctor");

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      locale: 'vi',
      slotMinTime: '07:00:00',
      slotMaxTime: '19:00:00',
      height: 'auto',
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,dayGridMonth' },
      events: async (info, success, failure)=>{
        try{
          const docId = $("#filterDoctor").value;
          let events = [];
          const source = docId? await DoctorModel.slots(Number(docId)) : window.Mock.slots;
          events = source.map(s=>({
            id: String(s.ma_lich_trong),
            title: "Lịch trống",
            start: `${s.ngay}T${s.gio_bat_dau}`,
            end: `${s.ngay}T${s.gio_ket_thuc}`,
            extendedProps: { ma_bac_si: s.ma_bac_si }
          }));
          success(events);
        }catch(err){ failure(err); }
      },
      eventClick: (info)=>{
        const slotId = info.event.id;
        const doctorId = info.event.extendedProps.ma_bac_si;
        location.hash = `#/book?doctor=${doctorId}&slot=${slotId}`;
      }
    });
    calendar.render();

    $("#scheduleFilterForm")?.addEventListener("submit", (e)=>{
      e.preventDefault(); calendar.refetchEvents();
    });
  },

  async initBookingPage(){
    const qs = new URLSearchParams(location.hash.split("?")[1] || "");
    const doctorId = Number(qs.get("doctor"))||"";
    const slotId = Number(qs.get("slot"))||"";

    const [doctors, services] = await Promise.all([DoctorModel.all({}), Api.getServices()]);
    $("#doctorSelect").innerHTML = doctors.map(d=>`<option ${d.ma_bac_si==doctorId?"selected":""} value="${d.ma_bac_si}">${helpers.escapeHTML(d.ho_ten)}</option>`).join("");
    $("#serviceSelect").innerHTML = services.map(s=>`<option value="${s.ma_dich_vu}">${helpers.escapeHTML(s.ten_dich_vu)} - ${helpers.money(s.gia_goi_y)}</option>`).join("");

    async function loadSlots(){
      const id = Number($("#doctorSelect").value);
      const slots = await DoctorModel.slots(id);
      $("#slotSelect").innerHTML = slots.map(s=>`<option ${s.ma_lich_trong==slotId?"selected":""} value="${s.ma_lich_trong}">${helpers.escapeHTML(s.ngay)} • ${s.gio_bat_dau} - ${s.gio_ket_thuc}</option>`).join("");
    }
    await loadSlots();
    $("#doctorSelect").addEventListener("change", loadSlots);

    $("#bookingForm")?.addEventListener("submit", async (e)=>{
      e.preventDefault();
      if(!UserModel.isLoggedIn()){ helpers.toast("Vui lòng đăng nhập để đặt lịch","warning"); location.hash="#/login"; return; }
      const ma_bac_si = Number($("#doctorSelect").value);
      const ma_lich_trong = Number($("#slotSelect").value);
      const ma_dich_vu = Number($("#serviceSelect").value);
      const ly_do_kham = $("#reason").value.trim().slice(0,240);
      try{
        const apm = await AppointmentModel.book({ ma_bac_si, ma_lich_trong, ma_dich_vu, ly_do_kham });
        $("#confirmArea").innerHTML = `
          <div class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i> Đặt lịch thành công! Mã lịch hẹn: <strong>${apm.ma_lich_hen}</strong>.<br/>
            Bạn sẽ nhận xác nhận qua Email/SMS (demo).
          </div>`;
        helpers.toast("Đặt lịch thành công","success");
      }catch(err){ helpers.toast(err.message||"Không thể đặt lịch","danger"); }
    });
  },

  async initMyAppointments(){
    if(!UserModel.isLoggedIn()){
      $("#myAppointments").innerHTML = `<div class="alert alert-warning">Vui lòng <a href='#/login'>đăng nhập</a> để xem lịch hẹn.</div>`;
      return;
    }
    const list = await AppointmentModel.mine();
    $("#myAppointments").innerHTML = list.map(a=>`
      <tr>
        <td>${helpers.escapeHTML(a.doctor?.ho_ten||"")}</td>
        <td>${helpers.escapeHTML(a.slot?.ngay||"")}<br><span class="text-muted small">${a.slot?.gio_bat_dau} - ${a.slot?.gio_ket_thuc}</span></td>
        <td>${helpers.escapeHTML(a.service?.ten_dich_vu||"")}</td>
        <td><span class="badge ${a.trang_thai==='DaHuy'?'text-bg-secondary':'text-bg-success'}">${helpers.escapeHTML(a.trang_thai)}</span></td>
        <td>
          ${a.trang_thai!=='DaHuy'?`<button class="btn btn-sm btn-outline-danger" data-id="${a.ma_lich_hen}"><i class="bi bi-x-circle"></i> Hủy</button>`:""}
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5" class="text-center text-muted">Chưa có lịch hẹn</td></tr>`;

    // Cancel handlers
    $$("#myAppointments button[data-id]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        if(!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
        try{
          await AppointmentModel.cancel(Number(btn.dataset.id));
          helpers.toast("Đã hủy lịch hẹn","info");
          AppointmentController.initMyAppointments();
        }catch(err){ helpers.toast(err.message||"Không thể hủy","danger"); }
      });
    });
  }
};
