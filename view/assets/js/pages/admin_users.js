/* ============================
   👤 Admin User Management (CRUD + Search + Modal + Debug)
   ============================ */

   let usersInit = { fetching: false };
   let deleteTarget = null;
   let allUsers = [];
   let filteredUsers = [];
   
   /* === Khởi tạo trang === */
   async function setupAdminUsersPage() {
     console.log("%c🚀 [Init] setupAdminUsersPage()", "color: limegreen; font-weight: bold;");
   
     const view = document.getElementById("user-view");
     const form = document.getElementById("formUser");
     const loading = document.getElementById("user-loading");
     const empty = document.getElementById("user-empty");
     const searchInput = document.getElementById("userSearch");
     const clearBtn = document.getElementById("btnClearSearch");
     const modal = document.getElementById("deleteUserModal");
     const modalName = document.getElementById("deleteUserName");
     const btnCancel = document.getElementById("cancelDelete");
     const btnConfirm = document.getElementById("confirmDelete");
   
     if (!view || !form) {
       console.warn("%c⚠️ Không tìm thấy phần tử chính của trang người dùng!", "color: orange;");
       return;
     }
   
     /* === 1️⃣ Lấy danh sách người dùng === */
     async function fetchUsers() {
       if (usersInit.fetching) return;
       usersInit.fetching = true;
       toggleLoading(true);
       console.log("%c📡 [Fetch] Đang tải danh sách người dùng...", "color: deepskyblue;");
   
       try {
         const res = await apiRequest(`${API_BASE_URL}?path=nguoidung`, "GET");
         console.log("%c✅ [Fetch thành công] Dữ liệu người dùng:", "color: green;", res);
   
         if (!Array.isArray(res)) {
           console.error("%c❌ [Fetch lỗi] API không trả về mảng:", "color: red;", res);
           showEmpty("Dữ liệu trả về không hợp lệ.");
           return;
         }
   
         allUsers = res;
         filteredUsers = allUsers;
         renderUsers();
       } catch (err) {
         console.error("%c❌ [Fetch lỗi API]:", "color: red;", err);
         showEmpty("Không thể tải danh sách người dùng.");
       } finally {
         toggleLoading(false);
         usersInit.fetching = false;
       }
     }
   
     /* === 2️⃣ Render bảng người dùng === */
     function renderUsers() {
       console.log("%c🧩 [Render] Render danh sách người dùng:", "color: cyan;", filteredUsers);
   
       if (!filteredUsers.length) return showEmpty("Không có người dùng nào.");
       empty.classList.add("hidden");
   
       view.innerHTML = `
         <table class="min-w-full text-sm">
           <thead class="bg-primary50 text-textmain/80">
             <tr>
               <th class="px-3 py-2 text-left">Mã ND</th>
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
                   <td class="px-3 py-2">${u.ma_nguoi_dung}</td>
                   <td class="px-3 py-2">${u.ho_ten || u.ten_dang_nhap || "-"}</td>
                   <td class="px-3 py-2">${u.email || "-"}</td>
                   <td class="px-3 py-2">${formatRole(u.vai_tro)}</td>
                   <td class="px-3 py-2">${u.ngay_tao ? new Date(u.ngay_tao).toLocaleString("vi-VN") : "-"}</td>
                   <td class="px-3 py-2">
                     <button data-act="delete" data-id="${u.ma_nguoi_dung}" class="text-red-600 hover:underline">Xóa</button>
                   </td>
                 </tr>`
               )
               .join("")}
           </tbody>
         </table>`;
     }
   
     /* Badge màu cho vai trò */
     function formatRole(role) {
        const color =
          role === "ADMIN"
            ? "bg-red-100 text-red-600 border border-red-200"
            : role === "BACSI"
            ? "bg-blue-100 text-blue-600 border border-blue-200"
            : "bg-green-100 text-green-600 border border-green-200";
        return `<span class="${color} px-1.5 py-0.5 rounded-md text-xs font-medium">${role}</span>`;
      }
      
   
     /* === 3️⃣ Tìm kiếm người dùng === */
     searchInput?.addEventListener("input", (e) => {
       const q = e.target.value.trim().toLowerCase();
       console.log("%c🔍 [Search] Từ khóa:", "color: violet;", q);
   
       filteredUsers = allUsers.filter(
         (u) =>
           u.ho_ten?.toLowerCase().includes(q) ||
           u.email?.toLowerCase().includes(q) ||
           u.vai_tro?.toLowerCase().includes(q)
       );
       renderUsers();
     });
   
     clearBtn?.addEventListener("click", () => {
       console.log("%c🧹 [Search] Xóa từ khóa tìm kiếm", "color: gray;");
       searchInput.value = "";
       filteredUsers = allUsers;
       renderUsers();
     });
   
     /* === 4️⃣ Thêm tài khoản === */
     form.addEventListener("submit", async (e) => {
       e.preventDefault();
       const data = Object.fromEntries(new FormData(form).entries());
       const payload = {
         email: data.email,
         password: data.password,
         vai_tro: data.vai_tro,
         ho_ten: data.ho_ten,
         ten_dang_nhap: data.email.split("@")[0],
       };
   
       console.log("%c📝 [Submit] Gửi payload thêm tài khoản:", "color: orange;", payload);
   
       try {
         const res = await apiRequest(`${API_BASE_URL}?path=nguoidung`, "POST", payload);
         console.log("%c✅ [POST Thành công]:", "color: green;", res);
         showToast("✅ Tạo tài khoản thành công!", "success");
         form.reset();
         fetchUsers();
       } catch (err) {
         console.error("%c❌ [POST lỗi]:", "color: red;", err);
         showToast("Không thể lưu tài khoản", "error");
       }
     });
   
     /* === 5️⃣ Xử lý xóa === */
     view.addEventListener("click", (e) => {
       const btn = e.target.closest("button[data-act='delete']");
       if (!btn) return;
   
       const id = btn.dataset.id;
       const u = allUsers.find((x) => String(x.ma_nguoi_dung) === String(id));
       if (!u) {
         console.warn("%c⚠️ [Delete] Không tìm thấy người dùng để xóa", "color: orange;");
         return;
       }
   
       console.log("%c🗑️ [Delete Modal] Mở modal xác nhận cho:", "color: red;", u);
       deleteTarget = u;
       modalName.textContent = u.email;
       modal.classList.remove("hidden");
       modal.classList.add("flex");
     });
   
     btnCancel?.addEventListener("click", () => {
       console.log("%c❎ [Delete] Đã hủy xóa", "color: gray;");
       modal.classList.add("hidden");
     });
   
     btnConfirm?.addEventListener("click", async () => {
       if (!deleteTarget) return;
       console.log("%c🔥 [Delete] Xác nhận xóa tài khoản:", "color: red;", deleteTarget);
   
       try {
         const res = await apiRequest(
           `${API_BASE_URL}?path=nguoidung&id=${deleteTarget.ma_nguoi_dung}`,
           "DELETE"
         );
         console.log("%c✅ [DELETE Thành công]:", "color: green;", res);
         showToast("🗑️ Đã xóa tài khoản", "success");
         modal.classList.add("hidden");
         fetchUsers();
       } catch (err) {
         console.error("%c❌ [DELETE lỗi]:", "color: red;", err);
         showToast("Không thể xóa tài khoản", "error");
       }
     });
   
     /* === Helpers === */
     function toggleLoading(show) {
       loading?.classList.toggle("hidden", !show);
       console.log(show ? "%c⌛ [Loading bật]" : "%c✅ [Loading tắt]", "color: teal;");
     }
   
     function showEmpty(msg) {
       view.innerHTML = "";
       empty.textContent = msg;
       empty.classList.remove("hidden");
       console.warn("%c⚠️ [Empty]", "color: gray;", msg);
     }
   
     /* Bắt đầu tải dữ liệu */
     fetchUsers();
   }
   
   /* SPA-safe */
   window.addEventListener("DOMContentLoaded", setupAdminUsersPage);
   window.addEventListener("hashchange", () => {
     if (window.location.hash === "#/admin/user") setupAdminUsersPage();
   });
   