<?php
// ⚙️ CORS — phải được gửi TRƯỚC KHI session_start()
$allowedOrigin = 'http://localhost:5500';
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 🚀 Bắt đầu session SAU khi đã set CORS
session_start();

// 🧩 Giữ session cookie khi gọi từ FE khác port
if (PHP_SAPI !== 'cli') {
    header('Set-Cookie: PHPSESSID=' . session_id() . '; Path=/; SameSite=None; Secure');
}

// ⚙️ BẮT TOÀN BỘ LỖI PHP TRẢ JSON
header("Content-Type: application/json; charset=utf-8");
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode(['error' => 'PHP Exception: ' . $e->getMessage()]);
    exit;
});
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(['error' => "$errstr in $errfile:$errline"]);
    exit;
});

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
        case 'session':
            if (isset($_SESSION['user'])) {
                echo json_encode([
                    'logged_in' => true,
                    'user' => $_SESSION['user']
                ]);
            } else {
                echo json_encode(['logged_in' => false]);
            }
            break;





    default:
        echo json_encode(['error' => 'API không tồn tại']);
}
