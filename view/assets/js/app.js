// Simple SPA Router + MVC bootstrap
const routes = {
  "/": "views/home.html",
  "/doctors": "views/doctors.html",
  "/schedule": "views/schedule.html",
  "/book": "views/book.html",
  "/appointments": "views/appointments.html",
  "/articles": "views/articles.html",
  "/article": "views/article-detail.html",
  "/pricing": "views/pricing.html",
  "/login": "views/login.html",
  "/register": "views/register.html",
  "/profile": "views/profile.html",
  "/privacy": "views/privacy.html",
};

const AppState = {
  currentUser: UserModel.getCurrent(),
  routeParams: {}
};

async function includeComponent(elId, url){
  const el = document.getElementById(elId);
  const res = await fetch(url);
  el.innerHTML = await res.text();
}

async function renderAuthArea(){
  const area = document.getElementById("authArea");
  if(!area) return;
  if(UserModel.isLoggedIn()){
    const user = UserModel.getCurrent();
    area.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i> ${helpers.escapeHTML(user?.ho_ten || user?.ten_dang_nhap || "Tài khoản")}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#/profile"><i class="bi bi-person"></i> Hồ sơ</a></li>
          <li><a class="dropdown-item" href="#/appointments"><i class="bi bi-clipboard2-check"></i> Lịch hẹn của tôi</a></li>
          <li><hr class="dropdown-divider"/></li>
          <li><button class="dropdown-item text-danger" id="btnLogout"><i class="bi bi-box-arrow-right"></i> Đăng xuất</button></li>
        </ul>
      </div>
    `;
    document.getElementById("btnLogout")?.addEventListener("click", ()=>{
      AuthController.logout();
    });
  } else {
    area.innerHTML = `
      <a class="btn btn-outline-primary" href="#/login">Đăng nhập</a>
      <a class="btn btn-primary" href="#/register">Đăng ký</a>
    `;
  }
}

async function router(){
  await includeComponent("header", "components/header.html");
  await includeComponent("footer", "components/footer.html");
  await renderAuthArea();

  const hash = window.location.hash || "#/";
  const [_, path, id] = hash.match(/^#(\/[a-zA-Z-]+)?\/?([^\/]+)?/) || [];
  const viewPath = routes[path || "/"];
  const root = document.getElementById("view-root");

  // route params
  AppState.routeParams = { id };

  if(!viewPath){
    root.innerHTML = `<div class="alert alert-warning">Không tìm thấy trang.</div>`;
    return;
  }
  const res = await fetch(viewPath);
  const html = await res.text();
  root.innerHTML = html;

  // Controller wiring by route
  switch(path || "/"){
    case "/":
      DoctorController.initHome();
      ArticleController.initHomeArticles();
      break;
    case "/doctors":
      DoctorController.initList();
      break;
    case "/schedule":
      AppointmentController.initSchedulePage();
      break;
    case "/book":
      AppointmentController.initBookingPage();
      break;
    case "/appointments":
      AppointmentController.initMyAppointments();
      break;
    case "/articles":
      ArticleController.initList();
      break;
    case "/article":
      ArticleController.initDetail(AppState.routeParams.id);
      break;
    case "/pricing":
      ArticleController.initPricing();
      break;
    case "/login":
      AuthController.initLogin();
      break;
    case "/register":
      AuthController.initRegister();
      break;
    case "/profile":
      AuthController.initProfile();
      break;
    case "/privacy":
      ArticleController.initPrivacy();
      break;
    default:
      break;
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
