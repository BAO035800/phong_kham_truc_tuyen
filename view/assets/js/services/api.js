// API service (placeholder). Replace endpoints with your PHP backend later.
const Api = {
  // Simulate fetch from DB-backed PHP endpoints using local mock
  async getSpecialties(){ return window.Mock.specialties; },
  async getBranches(){ return window.Mock.branches; },
  async getDoctors(params={}){
    const { specialtyId, branchId, q } = params;
    let list = [...window.Mock.doctors];
    if(specialtyId) list = list.filter(d=> d.ma_chuyen_khoa == specialtyId);
    if(branchId) list = list.filter(d=> d.ma_chi_nhanh_mac_dinh == branchId);
    if(q){ const k=q.toLowerCase(); list = list.filter(d=> d.ho_ten.toLowerCase().includes(k)); }
    return list;
  },
  async getDoctorSlots(doctorId){
    return window.Mock.slots.filter(s=> s.ma_bac_si == doctorId);
  },
  async getServices(){ return window.Mock.services; },
  async getArticles(){ return window.Mock.articles; },
  async getArticle(id){ return window.Mock.articles.find(a=> a.ma_bai_viet==Number(id)); },
  async getPrices(){ return window.Mock.prices; },

  // Auth (mock)
  async login({email, password}){
    const user = window.Mock.users.find(u=> u.email.toLowerCase()===email.toLowerCase() && u.password===password);
    if(!user) throw new Error("Thông tin đăng nhập không đúng");
    return {...user, password: undefined};
  },
  async register(payload){
    if(window.Mock.users.some(u=> u.email.toLowerCase()===payload.email.toLowerCase())){
      throw new Error("Email đã tồn tại");
    }
    const newUser = { ...payload, ma_nguoi_dung: Date.now(), vai_tro:"BENHNHAN" };
    window.Mock.users.push(newUser);
    return {...newUser, password: undefined};
  },

  // Appointments (mock with conflict checking by unique slot id)
  async bookAppointment({ ma_bac_si, ma_lich_trong, ma_dich_vu, ly_do_kham }){
    const slot = window.Mock.slots.find(s=> s.ma_lich_trong==ma_lich_trong && s.ma_bac_si==ma_bac_si);
    if(!slot) throw new Error("Lịch trống không tồn tại");
    if(window.Mock.appointments.some(a=> a.ma_lich_trong==ma_lich_trong)) throw new Error("Lịch này đã được đặt");
    const current = UserModel.getCurrent();
    const apm = {
      ma_lich_hen: Date.now(),
      ma_benh_nhan: current?.ma_benh_nhan ?? current?.ma_nguoi_dung,
      ma_bac_si, ma_lich_trong, ma_dich_vu, ly_do_kham,
      trang_thai: "DaDat",
      thoi_diem_dat: new Date().toISOString()
    };
    window.Mock.appointments.push(apm);
    return apm;
  },
  async myAppointments(){
    const current = UserModel.getCurrent();
    return window.Mock.appointments.filter(a=> a.ma_benh_nhan==(current?.ma_benh_nhan ?? current?.ma_nguoi_dung))
      .map(a=>({...a, slot: window.Mock.slots.find(s=> s.ma_lich_trong==a.ma_lich_trong), doctor: window.Mock.doctors.find(d=> d.ma_bac_si==a.ma_bac_si), service: window.Mock.services.find(sv=> sv.ma_dich_vu==a.ma_dich_vu) }));
  },
  async cancelAppointment(id){
    const apm = window.Mock.appointments.find(a=> a.ma_lich_hen==id);
    if(!apm) throw new Error("Không tìm thấy lịch hẹn");
    apm.trang_thai = "DaHuy";
    return apm;
  }
};
