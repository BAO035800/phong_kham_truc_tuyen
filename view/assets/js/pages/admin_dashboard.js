/* ============================
   📊 Admin Dashboard Overview (Stats + Animated Count + Loading)
   ============================ */

   let dashboardInit = { loading: false };

   async function setupAdminDashboard() {
     console.log("🚀 [AdminDashboard] Khởi tạo...");
   
     const elDoctors = document.getElementById("statDoctors");
     const elServices = document.getElementById("statServices");
     const elPatients = document.getElementById("statPatients");
     const elSpecialties = document.getElementById("statSpecialties");
   
     const section = document.querySelector("section");
     if (!section) return;
   
     // Thêm overlay loading nhẹ
     const loadingEl = document.createElement("div");
     loadingEl.id = "dashboard-loading";
     loadingEl.className =
       "absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-xl text-gray-600 text-sm font-medium hidden";
     loadingEl.innerHTML = `
       <div class="flex flex-col items-center gap-2">
         <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
         <span>Đang tải dữ liệu...</span>
       </div>`;
     section.style.position = "relative";
     section.appendChild(loadingEl);
   
     // Helper: bật/tắt loading
     function toggleLoading(show) {
       loadingEl.classList.toggle("hidden", !show);
     }
   
     // Hiệu ứng đếm mượt
     function animateCount(el, to, duration = 1200) {
       const start = 0;
       const startTime = performance.now();
       const format = (n) => n.toLocaleString("vi-VN");
   
       function step(now) {
         const progress = Math.min((now - startTime) / duration, 1);
         const value = Math.floor(start + (to - start) * progress);
         el.textContent = format(value);
         if (progress < 1) requestAnimationFrame(step);
       }
       requestAnimationFrame(step);
     }
   
     // Gọi API
     async function fetchCount(path) {
       try {
         const res = await apiRequest(`${API_BASE_URL}?path=${path}`, "GET");
         if (Array.isArray(res)) return res.length;
         return 0;
       } catch (err) {
         console.error(`❌ [Dashboard] Lỗi khi tải ${path}:`, err);
         return 0;
       }
     }
   
     if (dashboardInit.loading) return;
     dashboardInit.loading = true;
     toggleLoading(true);
   
     try {
       const [doctors, services, patients, specialties] = await Promise.all([
         fetchCount("bacsi"),
         fetchCount("dichvu"),
         fetchCount("benhnhan"),
         fetchCount("chuyenkhoa"),
       ]);
   
       console.log("✅ [Dashboard] Số liệu:", {
         doctors,
         services,
         patients,
         specialties,
       });
   
       // Hiển thị hiệu ứng đếm
       animateCount(elDoctors, doctors);
       animateCount(elServices, services);
       animateCount(elPatients, patients);
       animateCount(elSpecialties, specialties);
     } catch (err) {
       console.error("❌ [Dashboard] Lỗi tổng hợp:", err);
       elDoctors.textContent =
         elServices.textContent =
         elPatients.textContent =
         elSpecialties.textContent =
           "⚠️";
     } finally {
       dashboardInit.loading = false;
       toggleLoading(false);
     }
   }
   
   /* SPA-safe */
   window.addEventListener("DOMContentLoaded", () => {
     if (window.location.hash === "#/admin") setupAdminDashboard();
   });
   window.addEventListener("hashchange", () => {
     if (window.location.hash === "#/admin") setupAdminDashboard();
   });
   