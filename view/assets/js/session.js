// QUẢN LÝ PHIÊN Ở FE (localStorage)
const KEY = "auth_user";

export const session = {
  save(user) { localStorage.setItem(KEY, JSON.stringify(user)); },
  get() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
  clear() { localStorage.removeItem(KEY); },
  roleFromUser() {
    const u = session.get();
    if (!u) return null;
    const r = (u.vai_tro || u.role || "").toUpperCase();
    if (r === "ADMIN") return "admin";
    if (r === "BACSI" || r === "DOCTOR") return "doctor";
    return "patient";
  }
};
