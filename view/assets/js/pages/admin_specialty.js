(() => {
    /* ============================
       🏥 Admin Specialty Manager (CRUD + Search + Modal)
       ============================ */
    let specialtyInit = { fetching: false };
    let deleteTarget = null;
    let allSpecialties = [];
    let filteredSpecialties = [];
  
    async function setupAdminSpecialtyPage() {
      const view = await waitForElement("#specialty-view", 5000);
      if (!view) return;
  
      const form = document.getElementById("formSpecialty");
      const loading = document.getElementById("specialty-loading");
      const empty = document.getElementById("specialty-empty");
      const btnReset = document.getElementById("btnResetSpecialty");
      const searchInput = document.getElementById("specialtySearch");
      const clearBtn = document.getElementById("btnClearSearch");
  
      const modal = document.getElementById("deleteSpecialtyModal");
      const modalName = document.getElementById("deleteSpecialtyName");
      const btnCancel = document.getElementById("cancelDelete");
      const btnConfirm = document.getElementById("confirmDelete");
  
      /* 1️⃣ Fetch chuyên khoa */
      async function fetchSpecialties() {
        if (specialtyInit.fetching) return;
        specialtyInit.fetching = true;
        toggleLoading(true);
        try {
          const res = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "GET");
          allSpecialties = Array.isArray(res) ? res : [];
          filteredSpecialties = allSpecialties;
          renderSpecialties();
        } catch (err) {
          console.error("❌ Lỗi tải danh sách:", err);
          showEmpty("Không thể tải danh sách chuyên khoa.");
        } finally {
          toggleLoading(false);
          specialtyInit.fetching = false;
        }
      }
  
      /* 2️⃣ Hiển thị danh sách */
      function renderSpecialties() {
        if (!filteredSpecialties.length)
          return showEmpty("Không có chuyên khoa nào.");
        empty.classList.add("hidden");
  
        view.innerHTML = `
          <table class="min-w-full text-sm">
            <thead class="bg-primary50 text-textmain/80">
              <tr>
                <th class="px-3 py-2 text-left">Mã CK</th>
                <th class="px-3 py-2 text-left">Tên chuyên khoa</th>
                <th class="px-3 py-2 text-left">Mô tả</th>
                <th class="px-3 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
              ${filteredSpecialties
                .map(
                  (s) => `
                  <tr>
                    <td class="px-3 py-2">${s.ma_chuyen_khoa}</td>
                    <td class="px-3 py-2">${s.ten_chuyen_khoa}</td>
                    <td class="px-3 py-2">${s.mo_ta || "-"}</td>
                    <td class="px-3 py-2">
                      <button data-act="edit" data-id="${s.ma_chuyen_khoa}" class="text-blue-600 hover:underline">Sửa</button> |
                      <button data-act="delete" data-id="${s.ma_chuyen_khoa}" class="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>`;
      }
  
      /* 3️⃣ Form submit (Thêm/Sửa) */
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const payload = {
          ten_chuyen_khoa: data.ten_chuyen_khoa.trim(),
          mo_ta: data.mo_ta?.trim() || null,
        };
  
        try {
          if (data.id) {
            await apiRequest(`${API_BASE_URL}?path=chuyenkhoa&id=${data.id}`, "PUT", payload);
            showToast("✅ Cập nhật chuyên khoa thành công!", "success");
          } else {
            await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "POST", payload);
            showToast("✅ Thêm chuyên khoa thành công!", "success");
          }
          form.reset();
          fetchSpecialties();
        } catch (err) {
          console.error("❌ Lỗi lưu:", err);
          showToast("Không thể lưu chuyên khoa", "error");
        }
      });
  
      /* 4️⃣ Reset form */
      btnReset?.addEventListener("click", () => form.reset());
  
      /* 5️⃣ Sửa / Xóa */
      view.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-act]");
        if (!btn) return;
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        const s = allSpecialties.find((x) => String(x.ma_chuyen_khoa) === String(id));
        if (!s) return;
  
        if (act === "edit") {
          form.id.value = s.ma_chuyen_khoa;
          form.ten_chuyen_khoa.value = s.ten_chuyen_khoa;
          form.mo_ta.value = s.mo_ta || "";
          form.scrollIntoView({ behavior: "smooth" });
        }
  
        if (act === "delete") {
          deleteTarget = s;
          modalName.textContent = s.ten_chuyen_khoa;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      });
  
      /* 6️⃣ Modal xác nhận xóa */
      btnCancel?.addEventListener("click", () => modal.classList.add("hidden"));
      btnConfirm?.addEventListener("click", async () => {
        if (!deleteTarget) return;
        try {
          await apiRequest(`${API_BASE_URL}?path=chuyenkhoa&id=${deleteTarget.ma_chuyen_khoa}`, "DELETE");
          showToast("🗑️ Đã xóa chuyên khoa", "success");
          modal.classList.add("hidden");
          fetchSpecialties();
        } catch {
          showToast("Không thể xóa chuyên khoa", "error");
        }
      });
  
      /* 7️⃣ Tìm kiếm */
      searchInput?.addEventListener("input", (e) => {
        const q = e.target.value.trim().toLowerCase();
        filteredSpecialties = !q
          ? allSpecialties
          : allSpecialties.filter(
              (s) =>
                s.ten_chuyen_khoa?.toLowerCase().includes(q) ||
                s.mo_ta?.toLowerCase().includes(q)
            );
        renderSpecialties();
      });
  
      clearBtn?.addEventListener("click", () => {
        searchInput.value = "";
        filteredSpecialties = allSpecialties;
        renderSpecialties();
      });
  
      /* Helpers */
      function toggleLoading(show) {
        loading?.classList.toggle("hidden", !show);
      }
      function showEmpty(msg) {
        view.innerHTML = "";
        empty.textContent = msg;
        empty.classList.remove("hidden");
      }
  
      fetchSpecialties();
    }
  
    /* SPA-safe */
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
  
    window.addEventListener("DOMContentLoaded", setupAdminSpecialtyPage);
    window.addEventListener("hashchange", setupAdminSpecialtyPage);
  })();
  