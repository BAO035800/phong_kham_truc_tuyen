const AuthController = {
  initLogin(){
    const form = $("#loginForm");
    form?.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const email = $("#email").value.trim();
      const password = $("#password").value;
      if(!validator.isEmail(email)){ helpers.toast("Email không hợp lệ","warning"); return; }
      if(!validator.notEmpty(password)){ helpers.toast("Vui lòng nhập mật khẩu","warning"); return; }
      try{
        const user = await Api.login({email,password});
        UserModel.setCurrent(user);
        helpers.toast("Đăng nhập thành công","success");
        location.hash = "#/";
        renderAuthArea();
      }catch(err){ helpers.toast(err.message||"Đăng nhập thất bại","danger"); }
    });
  },
  initRegister(){
    const form = $("#registerForm");
    form?.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const payload = {
        ten_dang_nhap: $("#username").value.trim(),
        ho_ten: $("#fullname").value.trim(),
        email: $("#email").value.trim(),
        password: $("#password").value,
        so_dien_thoai: $("#phone").value.trim()
      };
      if(!validator.notEmpty(payload.ten_dang_nhap) || !validator.notEmpty(payload.ho_ten)){
        helpers.toast("Vui lòng nhập tên đăng nhập & họ tên","warning"); return;
      }
      if(!validator.isEmail(payload.email)){ helpers.toast("Email không hợp lệ","warning"); return; }
      if(!validator.isPhone(payload.so_dien_thoai)){ helpers.toast("Số điện thoại không hợp lệ","warning"); return; }
      if(payload.password.length<6){ helpers.toast("Mật khẩu tối thiểu 6 ký tự","warning"); return; }
      try{
        const user = await Api.register(payload);
        UserModel.setCurrent(user);
        helpers.toast("Đăng ký thành công","success");
        location.hash = "#/";
        renderAuthArea();
      }catch(err){ helpers.toast(err.message||"Đăng ký thất bại","danger"); }
    });
  },
  logout(){
    UserModel.clear();
    helpers.toast("Đã đăng xuất","info");
    renderAuthArea();
    location.hash = "#/";
  },
  initProfile(){
    const user = UserModel.getCurrent();
    if(!user){
      $("#profileArea").innerHTML = `<div class="alert alert-warning">Vui lòng <a href='#/login'>đăng nhập</a>.</div>`;
      return;
    }
    $("#profileArea").innerHTML = `
      <div class="card p-3">
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-person-circle fs-1 text-primary"></i>
          <div>
            <div class="fw-bold">${helpers.escapeHTML(user.ho_ten||user.ten_dang_nhap)}</div>
            <div class="text-muted small">${helpers.escapeHTML(user.email)}</div>
            <div class="text-muted small">Vai trò: ${helpers.escapeHTML(user.vai_tro||'BENHNHAN')}</div>
          </div>
        </div>
      </div>
    `;
  }
};
