const DoctorController = {
  async initHome(){
    // Quick search form
    const specialties = await DoctorModel.specialties();
    const branches = await DoctorModel.branches();
    $("#specialtySelect").innerHTML = `<option value=''>Tất cả chuyên khoa</option>` + specialties.map(s=>`<option value="${s.ma_chuyen_khoa}">${helpers.escapeHTML(s.ten_chuyen_khoa)}</option>`).join("");
    $("#branchSelect").innerHTML = `<option value=''>Tất cả chi nhánh</option>` + branches.map(b=>`<option value="${b.ma_chi_nhanh}">${helpers.escapeHTML(b.ten_chi_nhanh)}</option>`).join("");

    $("#homeSearchForm")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      const q = $("#q").value.trim();
      const specialtyId = $("#specialtySelect").value;
      const branchId = $("#branchSelect").value;
      const params = new URLSearchParams({ q, specialtyId, branchId });
      location.hash = "#/doctors?" + params.toString();
    });

    // Featured doctors
    const list = (await DoctorModel.all({})).slice(0,4);
    $("#featuredDoctors").innerHTML = list.map(d=>DoctorController.card(d)).join("");
  },
  async initList(){
    const url = new URL(location.href);
    const q = url.hash.includes("?") ? new URLSearchParams(url.hash.split("?")[1]) : new URLSearchParams();
    const specialtyId = q.get("specialtyId")||"";
    const branchId = q.get("branchId")||"";
    const keyword = q.get("q")||"";

    const [specialties, branches] = await Promise.all([DoctorModel.specialties(), DoctorModel.branches()]);
    $("#filterSpecialty").innerHTML = `<option value=''>Chuyên khoa</option>` + specialties.map(s=>`<option ${s.ma_chuyen_khoa==specialtyId?"selected":""} value="${s.ma_chuyen_khoa}">${helpers.escapeHTML(s.ten_chuyen_khoa)}</option>`).join("");
    $("#filterBranch").innerHTML = `<option value=''>Chi nhánh</option>` + branches.map(b=>`<option ${b.ma_chi_nhanh==branchId?"selected":""} value="${b.ma_chi_nhanh}">${helpers.escapeHTML(b.ten_chi_nhanh)}</option>`).join("");
    $("#keyword").value = keyword;

    async function load(){
      const doctors = await DoctorModel.all({
        specialtyId: $("#filterSpecialty").value || undefined,
        branchId: $("#filterBranch").value || undefined,
        q: $("#keyword").value.trim() || undefined
      });
      $("#doctorList").innerHTML = doctors.map(d=>DoctorController.card(d, true)).join("") || `<div class="alert alert-info">Không tìm thấy bác sĩ phù hợp.</div>`;
    }
    $("#filterForm")?.addEventListener("submit", (e)=>{ e.preventDefault(); load(); });
    await load();
  },
  card(d, showActions=false){
    return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <img src="${d.avatar}" class="card-img-top rounded-12" alt="Ảnh bác sĩ ${helpers.escapeHTML(d.ho_ten)}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-1">${helpers.escapeHTML(d.ho_ten)}</h5>
              <div class="text-muted small">${helpers.escapeHTML(d.chuyen_khoa)}</div>
              <span class="badge bg-success-subtle text-success border border-success-subtle mt-2"><i class="bi bi-geo-alt"></i> ${helpers.escapeHTML(d.chi_nhanh)}</span>
            </div>
            <span class="badge badge-soft"><i class="bi bi-star-fill"></i> 4.${d.ma_bac_si%10}/5</span>
          </div>
          <p class="mt-2 small">${helpers.escapeHTML(d.gioi_thieu)}</p>
          ${showActions?`
          <div class="d-flex gap-2">
            <a class="btn btn-primary btn-sm" href="#/book?doctor=${d.ma_bac_si}"><i class="bi bi-calendar2-plus"></i> Đặt lịch</a>
            <a class="btn btn-outline-primary btn-sm" href="#/schedule?doctor=${d.ma_bac_si}"><i class="bi bi-calendar-week"></i> Xem lịch trống</a>
          </div>`:""}
        </div>
      </div>
    </div>`;
  }
};
