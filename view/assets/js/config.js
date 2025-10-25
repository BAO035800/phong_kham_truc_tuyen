/** config.js — cấu hình hệ thống API chung **/

// 🔹 Địa chỉ backend API (có thể sửa cho phù hợp)
const API_BASE_URL = "http://localhost:8000/index.php";

// 🔹 Cấu hình endpoint
const API_ENDPOINTS = {
  auth: `${API_BASE_URL}?path=auth`,       // AuthController
  users: `${API_BASE_URL}?path=nguoidung`, // NguoiDungController
  booking: `${API_BASE_URL}?path=lichhen`, // ví dụ: đặt lịch
};

// 🔹 Hàm request chung
async function apiRequest(url, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ Cực kỳ quan trọng — giúp giữ cookie PHPSESSID
  };

  if (data) options.body = JSON.stringify(data);

  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Lỗi kết nối máy chủ");
    return json;
  } catch (err) {
    console.error("❌ API error:", err);
    throw err;
  }
}

