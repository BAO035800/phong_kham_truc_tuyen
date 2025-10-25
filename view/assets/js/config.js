// assets/js/config.js
window.CONFIG = {
    // ✅ API gốc của PHP (đổi khi deploy)
    API_BASE: "http://localhost:8000/index.php",
  
    // ✅ Map tới các controller (?path=...)
    PATHS: {
      AUTH: "auth",
      USER: "nguoidung",
      DOCTOR: "bacsi",
      PATIENT: "benhnhan",
      SERVICE: "dichvu",
      APPOINTMENT: "lichhen",
      AVAILABILITY: "lichtrong",
    },
  
    // ✅ Key localStorage dùng chung
    STORAGE_KEYS: {
      USER: "user",
      APPOINTMENTS: "appointments",
    },
  
    // Tuỳ chọn
    DEBUG: true,
    VERSION: "1.0.0",
  };
  