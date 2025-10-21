<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/NguoiDungController.php';
require_once __DIR__ . '/../controllers/PhongController.php';
require_once __DIR__ . '/../controllers/BacSiController.php';     // ✅ Thêm dòng này
require_once __DIR__ . '/../controllers/BenhNhanController.php'; // ✅ Thêm dòng này
require_once __DIR__ . '/../controllers/DichVuController.php';
require_once __DIR__ . '/../controllers/ChuyenKhoaController.php';
require_once __DIR__ . '/../controllers/BaiVietController.php';
require_once __DIR__ . '/../controllers/ChiNhanhController.php';
require_once __DIR__ . '/../controllers/LichHenController.php';
require_once __DIR__ . '/../controllers/LichTrongController.php';








/* ✅ Ghi log kiểm tra khi chạy PHP Server */
error_log("✅ PHP đang chạy từ: " . __DIR__);
error_log("✅ Đang require: " . realpath(__DIR__ . '/../controllers/AuthController.php'));
error_log("✅ File tồn tại? " . (file_exists(__DIR__ . '/../controllers/AuthController.php') ? 'YES' : 'NO'));
/* ==================================== */

$path = $_GET['path'] ?? '';

switch ($path) {
    case 'auth':
        $controller = new AuthController();
        $controller->handleRequest();
        break;

    case 'nguoidung':
        $controller = new NguoiDungController();
        $controller->handleRequest();
        break;

    case 'phong':
        $controller = new PhongController();
        $controller->handleRequest();
        break;

    case 'bacsi': // ✅ Thêm route mới
        $controller = new BacSiController();
        $controller->handleRequest();
        break;

    case 'benhnhan': // ✅ Thêm route mới
        $controller = new BenhNhanController();
        $controller->handleRequest();
        break;
    case 'dichvu':
        $controller = new DichVuController();
        $controller->handleRequest();
        break;
    case 'chuyenkhoa':
        $controller = new ChuyenKhoaController();
        $controller->handleRequest();
        break;
    case 'baiviet':
        $controller = new BaiVietController();
        $controller->handleRequest();
        break;
    case 'chinhanh':
        $controller = new ChiNhanhController();
        $controller->handleRequest();
        break;
    case 'lichhen':
        $controller = new LichHenController();
        $controller->handleRequest();
        break;
    case 'lichtrong':
        $controller = new LichTrongController();
        $controller->handleRequest();
        break;






    default:
        echo json_encode(['error' => 'API không tồn tại']);
}
