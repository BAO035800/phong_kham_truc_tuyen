/* /assets/js/login.js
 * Non-module, attaches setupLoginPage() to window for the router hook.
 */
(function () {
    function qs(sel, root = document) { return root.querySelector(sel); }
    function roleRedirect(user) {
      const v = user?.vai_tro;
      if (v === 'ADMIN') return '#/admin';
      if (v === 'BACSI') return '#/doctor-dashboard';
      return '#/'; // BENHNHAN or others
    }
  
    async function doLogin(e) {
      e?.preventDefault?.();
      const form = qs('#loginForm');
      const emailEl = qs('#email', form);
      const passEl  = qs('#password', form);
      const btn     = qs('button[type="submit"]', form);
      const status  = qs('#loginStatus');
  
      const email = (emailEl?.value || '').trim();
      const password = (passEl?.value || '').trim();
  
      if (!email || !password) {
        status.textContent = '⚠️ Vui lòng nhập email và mật khẩu';
        status.className = 'text-center text-sm text-red-500 mt-4';
        return;
      }
  
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = '⏳ Đang đăng nhập...';
      status.textContent = '';
  
      try {
        const user = await Auth.login({ email, password });
        status.textContent = '✅ Đăng nhập thành công';
        status.className = 'text-center text-sm text-green-600 mt-4';
        window.location.hash = roleRedirect(user);
      } catch (err) {
        status.textContent = '❌ ' + (err?.message || 'Đăng nhập thất bại');
        status.className = 'text-center text-sm text-red-500 mt-4';
      } finally {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Đăng nhập';
      }
    }
  
    function togglePasswordVisibility() {
      const passEl = document.getElementById('password');
      const eye = document.getElementById('togglePass');
      if (!passEl || !eye) return;
      const type = passEl.getAttribute('type') === 'password' ? 'text' : 'password';
      passEl.setAttribute('type', type);
      eye.textContent = type === 'password' ? 'Hiện' : 'Ẩn';
    }
  
    function bindLoginForm() {
      const form = document.getElementById('loginForm');
      const eye = document.getElementById('togglePass');
      if (!form) return;
      form.addEventListener('submit', doLogin);
      eye?.addEventListener('click', togglePasswordVisibility);
    }
  
    function setupLoginPage() {
      bindLoginForm();
      if (Auth?.isLoggedIn?.()) {
        window.location.hash = roleRedirect(Auth.user);
      }
    }
  
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('loginForm')) setupLoginPage();
    });
  
    window.setupLoginPage = setupLoginPage;
  })();
  