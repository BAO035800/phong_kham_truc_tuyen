# Phòng Khám Trực Tuyến – Frontend (Demo MVC)

- UI responsive với **Bootstrap 5** + **FullCalendar**.
- Cấu trúc theo hướng **MVC (Model–View–Controller)** cho JS.
- Có sẵn mock data khớp schema MySQL bạn cung cấp (bảng bác sĩ, lịch trống, dịch vụ, bài viết...).

## Chạy thử
1. Mở thư mục bằng VS Code, cài extension Live Server (hoặc `php -S 127.0.0.1:8080`).
2. Truy cập `http://127.0.0.1:8080/index.html`.
3. Đăng nhập demo: **an@example.com / 123456**.

## Tích hợp backend PHP
- Thay `assets/js/services/api.js` bằng các request `fetch('/api/...')` đến PHP.
- Bảo mật: hãy bật CSRF token, SameSite cookies, rate-limit, xác thực session trên server.

## Thư mục
```
assets/
  css/ main.css
  js/
    controllers/ (AuthController.js, DoctorController.js, AppointmentController.js, ArticleController.js)
    models/      (UserModel.js, DoctorModel.js, AppointmentModel.js)
    services/    (api.js) – Điểm nối với backend (hiện dùng mock)
    utils/       (dom.js, validator.js, helpers.js)
  mock/ mock-data.js
  img/  (doctor avatars, article thumbs, hero)
components/ (header.html, footer.html)
views/ (các trang: home, doctors, schedule, book, appointments, login, register, profile, articles, article-detail, pricing, privacy)
index.html
```

## Ghi chú an toàn
- Có **Content-Security-Policy** cơ bản trong `<head>`.
- Mọi nội dung render đều đi qua `helpers.escapeHTML` để chống XSS.
- Form có kiểm tra đầu vào (email/điện thoại/độ dài mật khẩu).
- Demo **không** yêu cầu dữ liệu thẻ/OTP.
