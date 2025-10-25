/** auth.js — Quản lý đăng nhập / đăng ký / xác thực người dùng **/

// ================== Helpers ==================
const USER_KEY = "user"; // key trong localStorage

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return !!getUser();
}

function isAdmin() {
  const user = getUser();
  return user?.vai_tro === "ADMIN";
}

function getAuthHeaders() {
  const user = getUser();
  return user ? { Authorization: `Bearer ${user.token || ""}` } : {};
}

// ================== API FUNCTIONS ==================

/**
 * Đăng ký bệnh nhân
 * @param {Object} data {ho_ten, email, mat_khau, ...}
 */
async function registerBenhNhan(data) {
  return apiRequest(`${API_ENDPOINTS.auth}&action=registerBenhNhan`, "POST", data);
}

/**
 * Đăng ký bác sĩ (chỉ admin mới được gọi)
 */
async function registerBacSi(data) {
  return apiRequest(`${API_ENDPOINTS.auth}&action=registerBacSi`, "POST", data);
}

/**
 * Đăng nhập
 * @param {Object} data {email, mat_khau}
 */
async function login(data) {
  const res = await apiRequest(`${API_ENDPOINTS.auth}&action=login`, "POST", data);
  if (res.user) saveUser(res.user);
  return res;
}

/**
 * Đăng xuất
 */
async function logout() {
  await apiRequest(`${API_ENDPOINTS.auth}&action=logout`, "POST");
  clearUser();
}

/**
 * Lấy thông tin người dùng hiện tại (từ server)
 */
async function currentUser() {
  return apiRequest(`${API_ENDPOINTS.auth}&action=me`, "GET");
}
