window.Mock = {
  // Users (simulate BENHNHAN)
  users: [
    { ma_nguoi_dung: 1, ten_dang_nhap: "an.nguyen", ho_ten: "Nguyễn Văn An", email: "an@example.com", password:"123456", vai_tro:"BENHNHAN", so_dien_thoai:"+84901111222" },
  ],
  branches: [
    { ma_chi_nhanh:1, ten_chi_nhanh:"CN Quận 1" },
    { ma_chi_nhanh:2, ten_chi_nhanh:"CN Gò Vấp" },
  ],
  specialties: [
    { ma_chuyen_khoa:1, ten_chuyen_khoa:"Nội tổng quát" },
    { ma_chuyen_khoa:2, ten_chuyen_khoa:"Tai Mũi Họng" },
    { ma_chuyen_khoa:3, ten_chuyen_khoa:"Nhi khoa" },
  ],
  doctors: [
    { ma_bac_si:1, ma_chuyen_khoa:1, ma_chi_nhanh_mac_dinh:1, ho_ten:"BS. Trần Minh Khoa", gioi_thieu:"15 năm kinh nghiệm Nội tổng quát", chuyen_khoa:"Nội tổng quát", chi_nhanh:"CN Quận 1", avatar:"assets/img/doctors/bs1.svg" },
    { ma_bac_si:2, ma_chuyen_khoa:2, ma_chi_nhanh_mac_dinh:2, ho_ten:"BS. Lê Thu Hằng", gioi_thieu:"Chuyên sâu Tai Mũi Họng", chuyen_khoa:"Tai Mũi Họng", chi_nhanh:"CN Gò Vấp", avatar:"assets/img/doctors/bs2.svg" },
    { ma_bac_si:3, ma_chuyen_khoa:3, ma_chi_nhanh_mac_dinh:1, ho_ten:"BS. Phạm Hoài Nam", gioi_thieu:"Bác sĩ Nhi khoa thân thiện", chuyen_khoa:"Nhi khoa", chi_nhanh:"CN Quận 1", avatar:"assets/img/doctors/bs3.svg" },
    { ma_bac_si:4, ma_chuyen_khoa:1, ma_chi_nhanh_mac_dinh:2, ho_ten:"BS. Đặng Quỳnh Anh", gioi_thieu:"Tư vấn dinh dưỡng - Nội tiết", chuyen_khoa:"Nội tổng quát", chi_nhanh:"CN Gò Vấp", avatar:"assets/img/doctors/bs4.svg" },
  ],
  // Slots (lichtrong)
  slots: [
    { ma_lich_trong:101, ma_bac_si:1, ma_chi_nhanh:1, ngay:"2025-10-20", gio_bat_dau:"08:00", gio_ket_thuc:"08:30" },
    { ma_lich_trong:102, ma_bac_si:1, ma_chi_nhanh:1, ngay:"2025-10-20", gio_bat_dau:"09:00", gio_ket_thuc:"09:30" },
    { ma_lich_trong:103, ma_bac_si:2, ma_chi_nhanh:2, ngay:"2025-10-21", gio_bat_dau:"10:00", gio_ket_thuc:"10:30" },
    { ma_lich_trong:104, ma_bac_si:3, ma_chi_nhanh:1, ngay:"2025-10-22", gio_bat_dau:"14:00", gio_ket_thuc:"14:30" },
    { ma_lich_trong:105, ma_bac_si:4, ma_chi_nhanh:2, ngay:"2025-10-23", gio_bat_dau:"15:00", gio_ket_thuc:"15:30" },
  ],
  // Services (dichvu)
  services: [
    { ma_dich_vu:1, ten_dich_vu:"Khám tổng quát", mo_ta:"Khám và tư vấn tổng quát", gia_goi_y:150000 },
    { ma_dich_vu:2, ten_dich_vu:"Khám Tai Mũi Họng", mo_ta:"Khám chuyên khoa TMH", gia_goi_y:180000 },
    { ma_dich_vu:3, ten_dich_vu:"Khám Nhi", mo_ta:"Khám trẻ em", gia_goi_y:160000 },
  ],
  // Prices per branch (banggiadichvu)
  prices: [
    { ma_chi_nhanh:1, ma_dich_vu:1, don_gia:160000 },
    { ma_chi_nhanh:1, ma_dich_vu:2, don_gia:190000 },
    { ma_chi_nhanh:2, ma_dich_vu:1, don_gia:150000 },
    { ma_chi_nhanh:2, ma_dich_vu:3, don_gia:165000 },
  ],
  // Articles (baiviet)
  articles: [
    { ma_bai_viet:1, tieu_de:"5 lưu ý khi khám tai mũi họng mùa mưa", tom_tat:"Bảo vệ sức khỏe đường hô hấp khi thời tiết ẩm ướt.", tac_gia:"BS. Lê Thu Hằng", ngay_dang:"2025-10-10", thumb:"assets/img/articles/tmh.svg",
      noi_dung:"<p>Mùa mưa khiến vi khuẩn dễ phát triển. <strong>Giữ ấm cơ thể</strong>, rửa tay thường xuyên và hạn chế tiếp xúc nguồn bệnh.</p><ul><li>Đeo khẩu trang đúng cách</li><li>Vệ sinh mũi bằng nước muối sinh lý</li><li>Uống đủ nước</li></ul>" },
    { ma_bai_viet:2, tieu_de:"Khám tổng quát định kỳ có cần thiết?", tom_tat:"Vì sao bạn nên khám định kỳ 6-12 tháng/lần.", tac_gia:"BS. Trần Minh Khoa", ngay_dang:"2025-09-25", thumb:"assets/img/articles/gt.svg",
      noi_dung:"<p>Khám tổng quát giúp phát hiện sớm nhiều bệnh lý. <em>Đặc biệt</em> quan trọng với người có bệnh nền.</p>" },
    { ma_bai_viet:3, tieu_de:"Mẹo chăm sóc sức khỏe cho trẻ đầu năm học", tom_tat:"Tăng cường sức đề kháng và giấc ngủ cho trẻ.", tac_gia:"BS. Phạm Hoài Nam", ngay_dang:"2025-08-30", thumb:"assets/img/articles/nhi.svg",
      noi_dung:"<p>Dinh dưỡng đủ nhóm chất, ngủ đủ giấc và vận động phù hợp.</p>" },
  ],
  // Appointments (lichhen) - start empty
  appointments: []
};
