/* ============================
   👤 Admin User Management (CRUD + Search) – No suffix
   ============================ */

   let usersInit = { fetching: false };
   let allUsers = [];
   let filteredUsers = [];
   
   /* === Helpers === */
   function getDisplayName(u) {
     if (u.ho_ten && u.ho_ten.trim()) return u.ho_ten.trim();
     if (u.email) return (u.email.split("@")[0] || "").trim();
     if (u.ten_dang_nhap) return u.ten_dang_nhap.replace(/_\d+$/, ""); // clean dữ liệu cũ
     return "-";
   }
   function formatRole(role) {
     const style =
       role === "ADMIN"
         ? "bg-red-100 text-red-600 border border-red-200"
         : "bg-green-100 text-green-600 border border-green-200";
     return `<span class="${style} px-2 py-0.5 rounded-md text-xs font-medium">${role || "USER"}</span>`;
   }
   function toggleLoading(show) {
     document.getElementById("user-loading")?.classList.toggle("hidden", !show);
   }
   function showToast(msg, type = "info") {
     // Nếu bạn đã có toast riêng thì gọi tới đó; tạm dùng alert nhẹ
     console[type === "error" ? "error" : "log"](msg);
   }
   
   /* === Khởi tạo trang === */
   async function setupAdminUsersPage() {
     const view = document.getElementById("user-view");
     const form = document.getElementById("formUser");
     const loading = document.getElementById("user-loading");
     const empty = document.getElementById("user-empty");
     const searchInput = document.getElementById("userSearch");
     const clearBtn = document.getElementById("btnClearSearch");
   
     if (!view || !form) return;
   
     /* 1️⃣ GET Users */
     async function fetchUsers() {
       if (usersInit.fetching) return;
       usersInit.fetching = true;
       toggleLoading(true);
       try {
         const res = await apiRequest(`${API_BASE_URL}?path=nguoidung&_=${Date.now()}`, "GET");
         if (!Array.isArray(res)) {
           return showEmpty("Dữ liệu không hợp lệ.");
         }
         allUsers = res.filter((u) => u.vai_tro !== "BACSI"); // ❌ bỏ bác sĩ
         filteredUsers = allUsers;
         renderUsers();
       } catch (err) {
         console.error(err);
         showEmpty("Không thể tải danh sách người dùng.");
       } finally {
         toggleLoading(false);
         usersInit.fetching = false;
       }
     }
   
     /* 2️⃣ Render Table */
     function renderUsers() {
       if (!filteredUsers.length) return showEmpty("Không có người dùng.");
       empty.classList.add("hidden");
   
       view.innerHTML = `
         <table class="min-w-full text-sm">
           <thead class="bg-primary50 text-textmain/80">
             <tr>
               <th class="px-3 py-2 text-left">Họ tên</th>
               <th class="px-3 py-2 text-left">Email</th>
               <th class="px-3 py-2 text-left">Vai trò</th>
               <th class="px-3 py-2 text-left">Ngày tạo</th>
               <th class="px-3 py-2 text-left">Hành động</th>
             </tr>
           </thead>
           <tbody class="[&>tr:nth-child(even)]:bg-slate-50/50">
             ${filteredUsers
               .map(
                 (u) => `
               <tr>
                 <td class="px-3 py-2">${getDisplayName(u)}</td>
                 <td class="px-3 py-2">${u.email || "-"}</td>
                 <td class="px-3 py-2">${formatRole(u.vai_tro)}</td>
                 <td class="px-3 py-2">${u.ngay_tao ? new Date(u.ngay_tao).toLocaleString("vi-VN") : "-"}</td>
                 <td class="px-3 py-2">
                   <button data-act="delete" data-id="${u.ma_nguoi_dung}" data-name="${getDisplayName(u)}"
                           class="text-red-600 hover:underline">Xóa</button>
                 </td>
               </tr>`
               )
               .join("")}
           </tbody>
         </table>`;
     }
   
     function showEmpty(msg) {
       view.innerHTML = "";
       empty.textContent = msg;
       empty.classList.remove("hidden");
     }
   
     /* 3️⃣ Search (dựa trên tên sạch) */
     searchInput?.addEventListener("input", (e) => {
       const q = e.target.value.trim().toLowerCase();
       filteredUsers = allUsers.filter((u) => {
         const name = getDisplayName(u).toLowerCase();
         return (
           name.includes(q) ||
           (u.email || "").toLowerCase().includes(q) ||
           (u.vai_tro || "").toLowerCase().includes(q)
         );
       });
       renderUsers();
     });
   
     clearBtn?.addEventListener("click", () => {
       searchInput.value = "";
       filteredUsers = allUsers;
       renderUsers();
     });
   
     /* 4️⃣ Submit Form – KHÔNG tạo hậu tố */
     form.addEventListener("submit", async (e) => {
       e.preventDefault();
       const data = Object.fromEntries(new FormData(form).entries());
   
       const baseUser = data.email
         .split("@")[0]
         .replace(/[^a-zA-Z0-9._-]/g, "")
         .replace(/_{2,}/g, "_")
         .replace(/^\.+|\.+$/g, "");
   
       const tenDangNhap = baseUser; // ❗ KHÔNG thêm _timestamp
   
       const payload = {
         ten_dang_nhap: tenDangNhap,
         email: data.email,
         mat_khau: data.password,
         vai_tro: data.vai_tro,
         ho_ten: data.ho_ten || baseUser,
       };
   
       try {
         const res = await apiRequest(`${API_BASE_URL}?path=nguoidung`, "POST", payload);
         showToast(res?.message || "✅ Tạo tài khoản thành công!", "success");
         form.reset();
         await new Promise((r) => setTimeout(r, 200));
         await fetchUsers();
       } catch (err) {
         console.error("POST lỗi:", err);
         // Nếu backend trả 409 (trùng ten_dang_nhap), gợi ý backend tự sinh số tăng dần / yêu cầu nhập tên khác
         showToast("Không thể lưu tài khoản (có thể trùng tên đăng nhập).", "error");
       }
     });
   
     /* 5️⃣ Delete (xác nhận modal) */
     const deleteModal = document.getElementById("deleteUserModal");
     const deleteName = document.getElementById("deleteUserName");
     const btnCancel = document.getElementById("cancelDelete");
     const btnConfirm = document.getElementById("confirmDelete");
     let pendingDeleteId = null;
   
     view.addEventListener("click", (e) => {
       const btn = e.target.closest("button[data-act='delete']");
       if (!btn) return;
       pendingDeleteId = btn.dataset.id;
       deleteName.textContent = btn.dataset.name || "";
       deleteModal.classList.remove("hidden");
       deleteModal.classList.add("flex");
     });
   
     btnCancel?.addEventListener("click", () => {
       deleteModal.classList.add("hidden");
       deleteModal.classList.remove("flex");
       pendingDeleteId = null;
     });
   
     btnConfirm?.addEventListener("click", async () => {
       if (!pendingDeleteId) return;
       try {
         await apiRequest(`${API_BASE_URL}?path=nguoidung&id=${pendingDeleteId}`, "DELETE");
         showToast("🗑️ Đã xóa tài khoản", "success");
         await fetchUsers();
       } catch (err) {
         console.error("DELETE lỗi:", err);
         showToast("Không thể xóa tài khoản", "error");
       } finally {
         btnCancel.click();
       }
     });
   
     // Start
     await fetchUsers();
   }
   
   /* SPA-safe */
   window.addEventListener("DOMContentLoaded", setupAdminUsersPage);
   window.addEventListener("hashchange", () => {
     if (window.location.hash === "#/admin/user") setupAdminUsersPage();
   });
   
   /* === API helper cơ bản (đã có ở dự án thì bỏ đoạn này đi) === */
   async function apiRequest(url, method = "GET", body) {
     const opts = { method, headers: { "Content-Type": "application/json" } };
     if (body) opts.body = JSON.stringify(body);
     const res = await fetch(url, opts);
     if (!res.ok) {
       const text = await res.text().catch(() => "");
       const err = new Error(text || res.statusText);
       err.status = res.status;
       throw err;
     }
     const ct = res.headers.get("content-type") || "";
     return ct.includes("application/json") ? res.json() : res.text();
   }
   