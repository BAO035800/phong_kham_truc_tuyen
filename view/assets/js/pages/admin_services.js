(() => {
  /* ============================
     🧾 Admin Service Manager (CRUD + Modal Delete + DEBUG LOG)
     ============================ */

  let serviceInit = { fetching: false };
  let deleteTarget = null;

  async function setupAdminServicesPage() {
    console.log("🚀 [setupAdminServicesPage] Khởi tạo trang dịch vụ...");

    const view = await waitForElement("#service-view", 5000);
    if (!view) return;

    const form = document.getElementById("formService");
    const loading = document.getElementById("service-loading");
    const empty = document.getElementById("service-empty");
    const btnReset = document.getElementById("btnServiceReset");
    const specialtySelect = form.querySelector("[name='specialty']");

    const modal = document.getElementById("deleteModal");
    const btnCancel = document.getElementById("cancelDelete");
    const btnConfirm = document.getElementById("confirmDelete");
    const modalName = document.getElementById("deleteServiceName");

    let allServices = [];
    let allSpecialties = [];

    /* 1️⃣ Lấy danh sách chuyên khoa */
    async function fetchSpecialties() {
      console.log("📘 [fetchSpecialties] Bắt đầu tải danh sách chuyên khoa...");
      try {
        const res = await apiRequest(`${API_BASE_URL}?path=chuyenkhoa`, "GET");
        console.log("✅ [fetchSpecialties] Kết quả:", res);

        allSpecialties = Array.isArray(res) ? res : [];
        specialtySelect.innerHTML =
          `<option value="">-- Chọn chuyên khoa --</option>` +
          allSpecialties
            .map(
              (s) =>
                `<option value="${s.ma_chuyen_khoa}">${s.ten_chuyen_khoa}</option>`
            )
            .join("");
      } catch (err) {
        console.error("❌ [fetchSpecialties] Lỗi khi tải chuyên khoa:", err);
      }
    }

    /* 2️⃣ Lấy danh sách dịch vụ */
    async function fetchServices() {
      if (serviceInit.fetching) return;
      serviceInit.fetching = true;
      toggleLoading(true);
      console.log("📦 [fetchServices] Bắt đầu tải danh sách dịch vụ...");

      try {
        const res = await apiRequest(`${API_BASE_URL}?path=dichvu`, "GET");
        console.log("✅ [fetchServices] Nhận dữ liệu dịch vụ:", res);

        if (!Array.isArray(res) || res.length === 0) {
          return showEmpty("Chưa có dịch vụ nào trong hệ thống.");
        }
        allServices = res;
        renderServices();
      } catch (err) {
        console.error("❌ [fetchServices] Lỗi tải danh sách dịch vụ:", err);
        showEmpty("Không thể tải danh sách dịch vụ.");
      } finally {
        toggleLoading(false);
        serviceInit.fetching = false;
      }
    }

    /* 3️⃣ Render bảng (đã bỏ cột Mã DV) */
    function renderServices() {
  console.log("🧩 [renderServices] Render bảng dịch vụ:", allServices.length);
  if (!allServices.length) return showEmpty("Không có dịch vụ.");

  empty.classList.add("hidden");

  view.innerHTML = `
    <table class="min-w-full text-sm">
      <thead class="bg-primary50 text-textmain/80">
        <tr>
          <th class="px-3 py-2 text-left">Tên dịch vụ</th>
          <th class="px-3 py-2 text-left">Mô tả</th>
          <th class="px-3 py-2 text-left">Giá (VNĐ)</th>
          <th class="px-3 py-2 text-left">Chuyên khoa</th>
          <th class="px-3 py-2 text-left">Hành động</th>
        </tr>
      </thead>
      <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
        ${allServices
          .map(
            (s) => `
            <tr>
              <td class="px-3 py-2">${s.ten_dich_vu}</td>
              <td class="px-3 py-2">${s.mo_ta || "-"}</td>
              <td class="px-3 py-2">${Number(s.gia_dich_vu).toLocaleString("vi-VN")}</td>
              <td class="px-3 py-2">${s.ten_chuyen_khoa || getSpecialtyName(s.ma_chuyen_khoa)}</td>
              <td class="px-3 py-2">
                <button data-act="edit" data-id="${s.ma_dich_vu}" class="text-blue-600 hover:underline">Sửa</button> |
                <button data-act="delete" data-id="${s.ma_dich_vu}" class="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
    }


    function getSpecialtyName(id) {
      const s = allSpecialties.find(
        (x) => String(x.ma_chuyen_khoa) === String(id)
      );
      return s ? s.ten_chuyen_khoa : "-";
    }

    /* 4️⃣ Submit form (chỉ gắn 1 lần) */
    if (!form.dataset.boundSubmit) {
      form.dataset.boundSubmit = "true";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const payload = {
          ten_dich_vu: data.name.trim(),
          mo_ta: data.desc?.trim() || null,
          gia_dich_vu: Number(data.price),
          ma_chuyen_khoa: data.specialty || null,
        };

        console.log("📤 [formSubmit] Payload:", payload);

        try {
          if (data.id) {
            await apiRequest(`${API_BASE_URL}?path=dichvu&id=${data.id}`, "PUT", payload);
            showToast("✅ Cập nhật dịch vụ thành công!", "success");
          } else {
            await apiRequest(`${API_BASE_URL}?path=dichvu`, "POST", payload);
            showToast("✅ Thêm dịch vụ thành công!", "success");
          }
          form.reset();
          fetchServices();
        } catch (err) {
          console.error("❌ [formSubmit] Lỗi khi lưu dịch vụ:", err);
          showToast("Không thể lưu dịch vụ", "error");
        }
      });
    }

    /* 5️⃣ Reset (chỉ gắn 1 lần) */
    if (btnReset && !btnReset.dataset.boundClick) {
      btnReset.dataset.boundClick = "true";
      btnReset.addEventListener("click", () => form.reset());
    }

    /* 6️⃣ Sửa / Xóa (chỉ gắn 1 lần) */
    if (!view.dataset.boundClick) {
      view.dataset.boundClick = "true";
      view.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-act]");
        if (!btn) return;

        const act = btn.dataset.act;
        const id = btn.dataset.id;

        if (act === "edit") {
          const s = allServices.find((x) => String(x.ma_dich_vu) === String(id));
          if (!s) return;
          form.id.value = s.ma_dich_vu;
          form.name.value = s.ten_dich_vu;
          form.price.value = s.gia_dich_vu;
          form.specialty.value = s.ma_chuyen_khoa || "";
          form.desc.value = s.mo_ta || ""; // 👈 thêm dòng này
          form.scrollIntoView({ behavior: "smooth" });
        }


        if (act === "delete") {
          const s = allServices.find((x) => String(x.ma_dich_vu) === String(id));
          if (!s) return;
          deleteTarget = s;
          modalName.textContent = s.ten_dich_vu;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      });
    }

    /* 7️⃣ Modal (chỉ gắn 1 lần mỗi nút) */
    if (btnCancel && !btnCancel.dataset.boundClick) {
      btnCancel.dataset.boundClick = "true";
      btnCancel.addEventListener("click", () => {
        modal.classList.add("hidden");
        deleteTarget = null;
      });
    }

    if (btnConfirm && !btnConfirm.dataset.boundClick) {
      btnConfirm.dataset.boundClick = "true";
      btnConfirm.addEventListener("click", async () => {
        if (!deleteTarget) return;
        try {
          await apiRequest(`${API_BASE_URL}?path=dichvu&id=${deleteTarget.ma_dich_vu}`, "DELETE");
          showToast("🗑️ Đã xóa dịch vụ", "success");
          deleteTarget = null;
          modal.classList.add("hidden");
          fetchServices();
        } catch (err) {
          console.error("❌ [modalConfirm] Lỗi khi xóa:", err);
          showToast("Không thể xóa dịch vụ", "error");
        }
      });
    }

    function toggleLoading(show) {
      loading?.classList.toggle("hidden", !show);
    }

    function showEmpty(msg) {
      view.innerHTML = "";
      empty.textContent = msg;
      empty.classList.remove("hidden");
    }

    await fetchSpecialties();
    await fetchServices();
  }

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

  window.addEventListener("DOMContentLoaded", setupAdminServicesPage);
  window.addEventListener("hashchange", setupAdminServicesPage);
})();
