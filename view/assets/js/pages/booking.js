/* booking.js — nối API đặt lịch (SPA-friendly)
 * Cần: window.CONFIG (API_BASE, PATHS, DEFAULTS), window.Auth (tuỳ chọn)
 * BE:
 *  - GET   ?path=bacsi
 *  - GET   ?path=lichtrong&action=listCongKhai&ma_bac_si={id}
 *  - POST  ?path=lichhen&action=datLich
 */

(function () {
    if (!window.CONFIG) {
      console.error("❌ CONFIG chưa được load. Hãy đảm bảo /assets/js/config.js chạy trước booking.js");
      return;
    }
  
    const CFG = window.CONFIG;
    const log = (...args) => CFG.DEBUG && console.log("[Booking]", ...args);
  
    // ---------- DOM helpers ----------
    const $ = (s, r = document) => r.querySelector(s);
    const docSel   = () => $("#doctorSelect");
    const dateInp  = () => $("#date");       // type="date" -> .value luôn "YYYY-MM-DD"
    const timeSel  = () => $("#timeSelect");
    const noteInp  = () => $("#note");
    const formEl   = () => $("#bookingForm");
    const statusEl = () => $("#statusMsg");
  
    // ---------- App helpers ----------
    function getCurrentUser() {
      // tuỳ app: thử các chỗ phổ biến
      return (window.Auth && (Auth.currentUser?.() || Auth.user)) || window.USER || null;
    }
  
    // ---------- HTTP ----------
    function buildUrl(pathKey, params = {}) {
      const u = new URL(CFG.API_BASE);
      u.searchParams.set("path", CFG.PATHS[pathKey] || pathKey);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
      });
      return u.toString();
    }
  
    async function request(pathKey, { method = "GET", action, query = {}, data = null } = {}) {
      const q = { ...(action ? { action } : {}), ...query };
      const url = buildUrl(pathKey, q);
      const opts = {
        method,
        credentials: "include",
        headers: { Accept: "application/json" },
      };
      if (data != null) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(data);
      }
      log(method, url, data || "");
      const res = await fetch(url, opts);
      const ctype = res.headers.get("content-type") || "";
      const payload = ctype.includes("application/json") ? await res.json() : await res.text();
  
      if (!res.ok) {
        const msg = typeof payload === "string" ? payload : (payload?.message || payload?.error || `HTTP ${res.status}`);
        throw new Error(msg);
      }
      if (payload && typeof payload === "object" && payload.status === "error") {
        throw new Error(payload.message || "Yêu cầu thất bại");
      }
      return payload;
    }
  
    // ---------- Chuẩn hoá ----------
    function normalizeDoctor(d) {
      // Phù hợp JSON bạn gửi: ma_bac_si + ho_ten
      const id = d.ma_bac_si ?? d.id ?? d.ma_nguoi_dung ?? d.ma ?? null;
      const ten = d.ho_ten ?? d.ten ?? d.fullname ?? d.name ?? `Bác sĩ #${id ?? "?"}`;
      const chuyenKhoa = d.ten_chuyen_khoa ?? d.chuyen_khoa ?? d.specialty ?? "";
      return { id, name: ten, specialty: chuyenKhoa };
    }
  
    function normalizeAvailList(list) {
      // Hỗ trợ nhiều dạng → trả Map<YYYY-MM-DD, [HH:MM]>
      const byDay = new Map();
      const push = (d, t) => {
        if (!d || !t) return;
        if (!byDay.has(d)) byDay.set(d, new Set());
        byDay.get(d).add(t);
      };
      const toSlots30 = (start, end) => {
        const out = [];
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        let cur = sh * 60 + sm;
        const stop = eh * 60 + em;
        while (cur + 29 <= stop) {
          const hh = String(Math.floor(cur / 60)).padStart(2, "0");
          const mm = String(cur % 60).padStart(2, "0");
          out.push(`${hh}:${mm}`);
          cur += 30;
        }
        return out;
      };
  
      (list || []).forEach((it) => {
        const baseDay = it.ngay ?? it.date ?? it.ngay_kham ?? null;
  
        if (Array.isArray(it.slots)) {
          it.slots.forEach((t) => push(baseDay, t));
          return;
        }
        if ((it.time || it.gio) && baseDay) {
          push(baseDay, it.time ?? it.gio);
          return;
        }
        if (it.gio_bat_dau && it.gio_ket_thuc && baseDay) {
          toSlots30(it.gio_bat_dau, it.gio_ket_thuc).forEach((t) => push(baseDay, t));
          return;
        }
  
        // DẠNG API: "YYYY-MM-DD HH:MM:SS"
        if (it.thoi_gian_bat_dau && it.thoi_gian_ket_thuc) {
          const [d1, t1Full] = String(it.thoi_gian_bat_dau).split(" ");
          const [d2, t2Full] = String(it.thoi_gian_ket_thuc).split(" ");
          const start = (t1Full || "").slice(0, 5); // HH:MM
          const end   = (t2Full || "").slice(0, 5);
          const day   = baseDay || d1 || d2 || null; // ISO yyyy-mm-dd
          if (day && start && end) {
            toSlots30(start, end).forEach((t) => push(day, t));
          }
          return;
        }
      });
  
      const result = new Map();
      for (const [k, set] of byDay.entries()) result.set(k, Array.from(set).sort());
      return result;
    }
  
    // ---------- Actions ----------
    async function loadDoctors() {
      const sel = docSel();
      const status = statusEl();
      if (!sel) return;
  
      sel.innerHTML = `<option value="" selected disabled>-- Chọn bác sĩ --</option>`;
  
      try {
        const payload = await request("DOCTOR", { method: "GET" });
        log("DOCTOR payload:", payload);
  
        // Linh động hấp thụ
        let rows = [];
        if (Array.isArray(payload)) rows = payload;
        else if (Array.isArray(payload?.data)) rows = payload.data;
        else if (Array.isArray(payload?.rows)) rows = payload.rows;
        else if (payload?.status === "ok" && payload?.data && typeof payload.data === "object") {
          rows = Array.isArray(payload.data) ? payload.data : Object.values(payload.data);
        }
  
        if (!rows.length) {
          const opt = document.createElement("option");
          opt.disabled = true;
          opt.textContent = "Chưa có bác sĩ nào";
          sel.appendChild(opt);
          if (status) {
            status.textContent = "ℹ️ API bác sĩ rỗng hoặc khác format.";
            status.className = "text-center text-sm mt-2 text-gray-500";
          }
          return;
        }
  
        rows.map(normalizeDoctor)
          .filter((d) => d.id != null)
          .forEach((d) => {
            const opt = document.createElement("option");
            opt.value = d.id;
            opt.textContent = d.specialty ? `${d.name} — ${d.specialty}` : d.name;
            sel.appendChild(opt);
          });
  
        // nếu vẫn không có option hợp lệ
        if (sel.options.length <= 1) {
          const opt = document.createElement("option");
          opt.disabled = true;
          opt.textContent = "Không tìm thấy dữ liệu bác sĩ hợp lệ";
          sel.appendChild(opt);
          if (status) {
            status.textContent = "ℹ️ Thiếu field id/họ tên trong dữ liệu bác sĩ.";
            status.className = "text-center text-sm mt-2 text-gray-500";
          }
        }
      } catch (err) {
        console.error("[Booking] loadDoctors error:", err);
        const opt = document.createElement("option");
        opt.value = "";
        opt.disabled = true;
        opt.textContent = "Không tải được danh sách bác sĩ";
        sel.appendChild(opt);
  
        if (status) {
          status.textContent = "❌ Lỗi tải bác sĩ: " + err.message;
          status.className = "text-center text-sm mt-2 text-red-500";
        }
      }
    }
  
    async function loadAvailabilitiesIfReady() {
      const selDoc = docSel();
      const d = dateInp();
      const tSel = timeSel();
      if (!selDoc || !d || !tSel) return;
  
      tSel.innerHTML = `<option value="" selected disabled>— Chọn bác sĩ & ngày trước —</option>`;
      const doctorId = selDoc.value;
      const dayISO   = d.value; // type="date" -> luôn YYYY-MM-DD
      if (!doctorId || !dayISO) return;
  
      try {
        const payload = await request("AVAILABILITY", {
          method: "GET",
          action: "listCongKhai",
          query: { ma_bac_si: doctorId },
        });
        const list = Array.isArray(payload) ? payload : (payload.data || []);
        const mapByDay = normalizeAvailList(list);
        const slots = mapByDay.get(dayISO) || [];
  
        if (slots.length === 0) {
          tSel.innerHTML = `<option value="" selected disabled>— Không còn slot trống ngày này —</option>`;
          return;
        }
  
        tSel.innerHTML = `<option value="" selected disabled>— Chọn giờ —</option>`;
        slots.forEach((s) => {
          const opt = document.createElement("option");
          opt.value = s;
          opt.textContent = s;
          tSel.appendChild(opt);
        });
      } catch (err) {
        console.error("[Booking] loadAvailabilities error:", err);
        tSel.innerHTML = `<option value="" selected disabled>— Lỗi tải lịch trống —</option>`;
      }
    }
  
    async function submitBooking(e) {
      e.preventDefault();
      const status = statusEl();
      const selDoc = docSel();
      const d = dateInp();
      const tSel = timeSel();
  
      if (!selDoc?.value || !d?.value || !tSel?.value) {
        status.textContent = "⚠️ Vui lòng chọn bác sĩ, ngày và giờ.";
        status.className = "text-center text-sm mt-2 text-red-500";
        return;
      }
  
      if (window.Auth && typeof Auth.ensureLoggedIn === "function") {
        const ok = Auth.ensureLoggedIn("#/login");
        if (!ok) return;
      }
  
      status.textContent = "⏳ Đang gửi yêu cầu đặt lịch...";
      status.className = "text-center text-sm mt-2 text-gray-600";
  
      // --------- Bổ sung logic theo Model mới ---------
      // lấy bệnh nhân từ session FE (nếu có)
      const me = getCurrentUser() || {};
      const ma_benh_nhan = me.ma_benh_nhan ?? me.benh_nhan_id ?? null;
  
      // dựng thoi_gian = 'YYYY-MM-DD HH:MM:SS'
      const isoDay = d.value;      // type="date" -> 'YYYY-MM-DD'
      const hhmm   = tSel.value;   // 'HH:MM'
      const thoi_gian = `${isoDay} ${hhmm}:00`;
  
      // dịch vụ/phòng: lấy từ select nếu có, hoặc default trong CONFIG
      const ma_dich_vu = (document.querySelector("#serviceSelect")?.value) || CFG.DEFAULTS?.MA_DICH_VU;
      const ma_phong   = (document.querySelector("#roomSelect")?.value)    || CFG.DEFAULTS?.MA_PHONG;
  
      // Payload cũ (giữ nguyên mô típ) + Payload mới (Model hiện hành)
      const payload = {
        // ---- mô típ cũ (giữ lại để tương thích ngược)
        ma_bac_si: selDoc.value,
        ngay: isoDay,             // YYYY-MM-DD
        gio: hhmm,                // HH:MM
        ghi_chu: noteInp()?.value?.trim() || "",
  
        // ---- bổ sung mô típ mới (Model bạn đang dùng)
        ...(ma_benh_nhan ? { ma_benh_nhan } : {}), // nếu chưa đăng nhập đúng role sẽ không có
        ...(ma_dich_vu ? { ma_dich_vu: Number(ma_dich_vu) } : {}),
        ...(ma_phong   ? { ma_phong:   Number(ma_phong)   } : {}),
        thoi_gian, // YYYY-MM-DD HH:MM:SS
      };
      // -----------------------------------------------
  
      try {
        await request("APPOINTMENT", { method: "POST", action: "datLich", data: payload });
        status.textContent = "✅ Đặt lịch thành công! Vui lòng kiểm tra email để xác nhận.";
        status.className = "text-center text-sm mt-2 text-green-600";
        // window.location.hash = "#/schedule";
      } catch (err) {
        status.textContent = "❌ " + err.message;
        status.className = "text-center text-sm mt-2 text-red-500";
      }
    }
  
    // ---------- Bootstrap (SPA friendly) ----------
    let inited = false;
    function initBookingPage() {
      const f = formEl();
      if (!f || inited) return;
  
      inited = true;
  
      // ❗ KHÔNG gán giá trị dd/mm/yyyy cho input type="date"
      // Vì type="date" chỉ chấp nhận 'YYYY-MM-DD'. Để tránh console error,
      // ta để người dùng chọn bằng UI mặc định của trình duyệt.
  
      loadDoctors().then(loadAvailabilitiesIfReady);
      docSel()?.addEventListener("change", loadAvailabilitiesIfReady);
      dateInp()?.addEventListener("change", loadAvailabilitiesIfReady);
      f.addEventListener("submit", submitBooking);
  
      log("Booking page initialized");
    }
  
    // 1) Nếu page đã có sẵn trong DOM (SSR/MPA)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => initBookingPage());
    } else {
      initBookingPage();
    }
  
    // 2) Nếu là SPA: đợi element được insert
    const mo = new MutationObserver(() => {
      if (!inited && formEl()) initBookingPage();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  
    // 3) Cho phép router của bạn gọi trực tiếp
    window.setupBookingPage = initBookingPage;
  })();
  