(() => {
  /* ============================
     👨‍⚕️ Admin Doctor Management (Add + View + Search + Delete) + Toast + Modal
     ============================ */

  let doctorInit = { fetching: false };
  let allDoctors = [];
  let filteredDoctors = [];
  let allSpecialties = [];

  // ====== TOAST ======
  function showToast(message, type = "info") {
    const wrap = document.getElementById("toast");
    if (!wrap) return;
    // giới hạn tối đa 4 toast
    while (wrap.children.length >= 4) wrap.firstChild.remove();

    const el = document.createElement("div");
    el.className = `toast-item ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    // animate in
    requestAnimationFrame(() => el.classList.add("show"));
    // auto remove sau 2.6s
    const t = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 180);
    }, 2600);
    el.addEventListener("click", () => {
      clearTimeout(t);
      el.classList.remove("show");
      setTimeout(() => el.remove(), 180);
    });
  }

  // ====== MODAL xoá bác sĩ ======
  const modal = {
    el: null,
    nameEl: null,
    btnCancel: null,
    btnConfirm: null,
    pending: null, // { userId, doctorId }
    ensure() {
      if (this.el) return;
      this.el = document.getElementById("deleteDoctorModal");
      this.nameEl = document.getElementById("deleteDoctorName");
      this.btnCancel = document.getElementById("cancelDoctorDelete");
      this.btnConfirm = document.getElementById("confirmDoctorDelete");
      this.btnCancel?.addEventListener("click", () => this.hide());
    },
    show(name, payload) {
      this.ensure();
      this.pending = payload;
      if (this.nameEl) this.nameEl.textContent = name || "bác sĩ";
      this.el?.classList.remove("hidden");
      this.el?.classList.add("flex");
    },
    onConfirm(cb) {
      this.ensure();
      if (!this.btnConfirm || this._wired) return;
      this.btnConfirm.addEventListener("click", async () => {
        if (!this.pending) return;
        await cb(this.pending);
        this.hide();
      });
      this._wired = true;
    },
    hide() {
      this.el?.classList.add("hidden");
      this.el?.classList.remove("flex");
      this.pending = null;
    }
  };

  async function setupAdminDoctorsPage() {
    const view = await waitForElement("#doctor-view", 5000);
    if (!view) return;

    const loading = document.getElementById("doctor-loading");
    const empty = document.getElementById("doctor-empty");
    const searchInput = document.getElementById("doctorSearch");
    const clearBtn = document.getElementById("btnClearSearch");
    const form = document.getElementById("formDoctor");
    const selectChuyenKhoa = document.getElementById("selectChuyenKhoa");

    /* === 1️⃣ Lấy danh sách chuyên khoa === */
    async function fetchSpecialties() {
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "GET");
        allSpecialties = Array.isArray(res) ? res : [];
        if (selectChuyenKhoa) {
          selectChuyenKhoa.innerHTML = '<option value="">-- Chọn chuyên khoa --</option>';
          allSpecialties.forEach((ck) => {
            const opt = document.createElement("option");
            opt.value = ck.ma_chuyen_khoa;
            opt.textContent = ck.ten_chuyen_khoa;
            selectChuyenKhoa.appendChild(opt);
          });
        }
      } catch (err) {
        console.error("❌ Lỗi tải chuyên khoa:", err);
        showToast("Không tải được danh sách chuyên khoa", "error");
      }
    }

    /* === 2️⃣ Lấy danh sách bác sĩ === */
    async function fetchDoctors() {
      if (doctorInit.fetching) return;
      doctorInit.fetching = true;
      toggleLoading(true);
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=bacsi&_=${Date.now()}`, "GET");
        allDoctors = Array.isArray(res) ? res : [];
        filteredDoctors = allDoctors;
        renderDoctors();
      } catch (err) {
        console.error("❌ Lỗi tải danh sách bác sĩ:", err);
        showEmpty("Không thể tải danh sách bác sĩ.");
        showToast("Không thể tải danh sách bác sĩ", "error");
      } finally {
        toggleLoading(false);
        doctorInit.fetching = false;
      }
    }

    function getSpecialtyName(id) {
      const s = allSpecialties.find((x) => String(x.ma_chuyen_khoa) === String(id));
      return s ? s.ten_chuyen_khoa : "-";
    }

    /* === 3️⃣ Hiển thị bảng (thêm cột Hành động → Xóa) === */
    function renderDoctors() {
      if (!filteredDoctors.length) return showEmpty("Không có bác sĩ.");
      empty.classList.add("hidden");

      view.innerHTML = `
        <table class="min-w-full text-sm">
          <thead class="bg-primary50 text-textmain/80">
            <tr>
              <th class="px-3 py-2 text-left">Họ tên</th>
              <th class="px-3 py-2 text-left">Chuyên khoa</th>
              <th class="px-3 py-2 text-left">Trình độ</th>
              <th class="px-3 py-2 text-left">Kinh nghiệm</th>
              <th class="px-3 py-2 text-left">Mô tả</th>
              <th class="px-3 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
            ${filteredDoctors.map((d) => {
              const name = d.ho_ten || "-";
              const userId = d.ma_nguoi_dung ?? d.maNguoiDung ?? null;
              const doctorId = d.ma_bac_si ?? d.maBacSi ?? null;
              return `
              <tr>
                <td class="px-3 py-2">${name}</td>
                <td class="px-3 py-2">${getSpecialtyName(d.ma_chuyen_khoa)}</td>
                <td class="px-3 py-2">${d.trinh_do || "-"}</td>
                <td class="px-3 py-2">${d.kinh_nghiem ? d.kinh_nghiem + " năm" : "-"}</td>
                <td class="px-3 py-2">${d.mo_ta || "-"}</td>
                <td class="px-3 py-2">
                  <button 
                    class="text-red-600 hover:underline"
                    data-act="delete"
                    data-name="${(name || "").replace(/"/g, '&quot;')}"
                    ${userId != null ? `data-user-id="${userId}"` : ""}
                    ${doctorId != null ? `data-doctor-id="${doctorId}"` : ""}
                  >
                    Xóa
                  </button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>`;
    }

    /* === 4️⃣ Tìm kiếm === */
    searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      filteredDoctors = !q
        ? allDoctors
        : allDoctors.filter(
            (d) =>
              (d.ho_ten || "").toLowerCase().includes(q) ||
              (d.trinh_do || "").toLowerCase().includes(q) ||
              (d.mo_ta || "").toLowerCase().includes(q) ||
              getSpecialtyName(d.ma_chuyen_khoa)?.toLowerCase().includes(q)
          );
      renderDoctors();
    });

    clearBtn?.addEventListener("click", () => {
      searchInput.value = "";
      filteredDoctors = allDoctors;
      renderDoctors();
    });

    /* === 5️⃣ Thêm bác sĩ mới === */
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const baseUser = (data.email || "").split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "");

      const payload = {
        ten_dang_nhap: baseUser || undefined, // không hậu tố
        ho_ten: data.ho_ten,
        email: data.email,
        mat_khau: data.mat_khau,
        vai_tro: "BACSI",
        ma_chuyen_khoa: parseInt(data.ma_chuyen_khoa),
        trinh_do: data.trinh_do,
        kinh_nghiem: parseInt(data.kinh_nghiem || 0),
        mo_ta: data.mo_ta,
      };

      try {
        await apiRequest(`${API_BASE_URL}?path=nguoidung`, "POST", payload);
        showToast("✅ Thêm bác sĩ thành công!", "success");
        form.reset();
        await new Promise((r) => setTimeout(r, 300));
        await fetchDoctors();
      } catch (err) {
        console.error("❌ [POST lỗi]:", err);
        showToast("Không thể thêm bác sĩ", "error");
      }
    });

    /* === 6️⃣ Xóa bác sĩ — Mở modal xác nhận, không dùng confirm() === */
    view.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act='delete']");
      if (!btn) return;
      const name = btn.dataset.name || "bác sĩ";
      const userId = btn.dataset.userId || null;
      const doctorId = btn.dataset.doctorId || null;

      if (!userId && !doctorId) {
        showToast("Không tìm thấy ID để xóa.", "error");
        return;
      }
      modal.show(name, { userId, doctorId });
    });

    // Xử lý khi ấn "Xóa" trên modal
    modal.onConfirm(async ({ userId, doctorId }) => {
      toggleLoading(true);
      try {
        if (userId) {
          // Xóa user → (nếu DB set ON DELETE CASCADE) sẽ xóa luôn bản ghi bác sĩ
          await apiRequest(`${API_BASE_URL}?path=nguoidung&id=${encodeURIComponent(userId)}`, "DELETE");
        } else if (doctorId) {
          // Fallback: nếu bạn có endpoint xóa bác sĩ riêng
          await apiRequest(`${API_BASE_URL}?path=bacsi&id=${encodeURIComponent(doctorId)}`, "DELETE");
        }
        showToast("🗑️ Đã xóa thành công", "success");
        await fetchDoctors();
      } catch (err) {
        console.error("❌ [DELETE lỗi]:", err);
        showToast("Không thể xóa", "error");
      } finally {
        toggleLoading(false);
      }
    });

    function toggleLoading(show) {
      loading?.classList.toggle("hidden", !show);
    }
    function showEmpty(msg) {
      view.innerHTML = "";
      empty.textContent = msg;
      empty.classList.remove("hidden");
    }

    await fetchSpecialties();
    await fetchDoctors();
  }

  /* SPA support */
  function waitForElement(selector, timeoutMs = 3000) {
    return new Promise((resolve) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const obs = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => {
        obs.disconnect();
        resolve(null);
      }, timeoutMs);
    });
  }

  window.addEventListener("DOMContentLoaded", setupAdminDoctorsPage);
  window.addEventListener("hashchange", setupAdminDoctorsPage);
})();
