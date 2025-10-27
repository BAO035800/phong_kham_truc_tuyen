/* ============================
   👤 Admin User Management (CRUD + Search)
   ============================ */

   let usersInit = { fetching: false };
   let allUsers = [];
   let filteredUsers = [];
   
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
         if (!Array.isArray(res)) return showEmpty("Dữ liệu không hợp lệ.");
         allUsers = res.filter(u => u.vai_tro !== "BACSI"); // ❌ bỏ bác sĩ
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
                 <td class="px-3 py-2">${u.ho_ten || u.ten_dang_nhap || "-"}</td>
                 <td class="px-3 py-2">${u.email || "-"}</td>
                 <td class="px-3 py-2">${formatRole(u.vai_tro)}</td>
                 <td class="px-3 py-2">${u.ngay_tao ? new Date(u.ngay_tao).toLocaleString("vi-VN") : "-"}</td>
                 <td class="px-3 py-2">
                   <button data-act="delete" data-id="${u.ma_nguoi_dung}" class="text-red-600 hover:underline">
                     Xóa
                   </button>
                 </td>
               </tr>`
               )
               .join("")}
           </tbody>
         </table>`;
     }
   
     function formatRole(role) {
       const style =
         role === "ADMIN"
           ? "bg-red-100 text-red-600 border border-red-200"
           : "bg-green-100 text-green-600 border border-green-200";
       return `<span class="${style} px-2 py-0.5 rounded-md text-xs font-medium">${role}</span>`;
     }
   
     /* 3️⃣ Search */
     searchInput?.addEventListener("input", (e) => {
       const q = e.target.value.trim().toLowerCase();
       filteredUsers = allUsers.filter(
         (u) =>
           u.ho_ten?.toLowerCase().includes(q) ||
           u.email?.toLowerCase().includes(q) ||
           u.vai_tro?.toLowerCase().includes(q)
       );
       renderUsers();
     });
   
     clearBtn?.addEventListener("click", () => {
       searchInput.value = "";
       filteredUsers = allUsers;
       renderUsers();
     });
   
     /* 4️⃣ Submit Form */
     form.addEventListener("submit", async (e) => {
       e.preventDefault();
       const data = Object.fromEntries(new FormData(form).entries());
   
       const baseUser = data.email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "");
       const tenDangNhap = `${baseUser}_${Date.now()}`;
   
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
         await new Promise((r) => setTimeout(r, 300));
         await fetchUsers();
       } catch (err) {
         console.error("POST lỗi:", err);
         showToast("Không thể lưu tài khoản", "error");
       }
     });
   
     /* 5️⃣ Delete */
     view.addEventListener("click", async (e) => {
       const btn = e.target.closest("button[data-act='delete']");
       if (!btn) return;
       const id = btn.dataset.id;
   
       try {
         await apiRequest(`${API_BASE_URL}?path=nguoidung&id=${id}`, "DELETE");
         showToast("🗑️ Đã xóa tài khoản", "success");
         await fetchUsers();
       } catch (err) {
         console.error("DELETE lỗi:", err);
         showToast("Không thể xóa tài khoản", "error");
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
   
     fetchUsers();
   }
   
   /* SPA-safe */
   window.addEventListener("DOMContentLoaded", setupAdminUsersPage);
   window.addEventListener("hashchange", () => {
     if (window.location.hash === "#/admin/user") setupAdminUsersPage();
   });
   