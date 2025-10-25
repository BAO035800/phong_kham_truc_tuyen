<?php
// ================== API Bootstrap (JSON-only, CORS, safe output) ==================

// --- Gỡ mọi header CORS cũ có thể bị chèn (Apache/.htaccess) ---
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Credentials');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');
header_remove('Access-Control-Max-Age');
header_remove('Vary');

// --- CORS chuẩn, phản chiếu đúng origin của FE ---
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
  'http://localhost:5500',
  'http://127.0.0.1:5500', // chỉ dùng nếu thật cần
  'http://localhost:3000',
];

if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin"); // KHÔNG dùng '*'
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
header('Access-Control-Max-Age: 86400');
header('Vary: Origin, Access-Control-Request-Headers, Access-Control-Request-Method');

// --- Preflight ---
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- JSON headers & error policy ---
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', '0'); // không rò rỉ HTML lỗi
ini_set('log_errors', '1');

// --- Session cookie (dev) ---
session_set_cookie_params([
  'lifetime' => 0,
  'path'     => '/',
  'domain'   => 'localhost', // khớp FE host chính
  'secure'   => false,       // dev HTTP
  'httponly' => true,
  'samesite' => 'Lax',
]);
session_start();


// ---- Autoload controllers (adjust paths if needed) ----
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/NguoiDungController.php';
require_once __DIR__ . '/../controllers/PhongController.php';
require_once __DIR__ . '/../controllers/BacSiController.php';
require_once __DIR__ . '/../controllers/BenhNhanController.php';
require_once __DIR__ . '/../controllers/DichVuController.php';
require_once __DIR__ . '/../controllers/ChuyenKhoaController.php';
require_once __DIR__ . '/../controllers/BaiVietController.php';
require_once __DIR__ . '/../controllers/ChiNhanhController.php';
require_once __DIR__ . '/../controllers/LichHenController.php';
require_once __DIR__ . '/../controllers/LichTrongController.php';

// ---- Buffer output from controllers to keep response JSON-clean ----
if (ob_get_level() === 0) { ob_start(); } else { ob_clean(); }

$path   = $_GET['path']   ?? '';
$action = $_GET['action'] ?? '';
$result = null; // optional structured return from controllers that choose to return arrays

try {
    switch ($path) {
        case 'auth':       $controller = new AuthController();       break;
        case 'nguoidung':  $controller = new NguoiDungController();  break;
        case 'phong':      $controller = new PhongController();      break;
        case 'bacsi':      $controller = new BacSiController();      break;
        case 'benhnhan':   $controller = new BenhNhanController();   break;
        case 'dichvu':     $controller = new DichVuController();     break;
        case 'chuyenkhoa': $controller = new ChuyenKhoaController(); break;
        case 'baiviet':    $controller = new BaiVietController();    break;
        case 'chinhanh':   $controller = new ChiNhanhController();   break;
        case 'lichhen':    $controller = new LichHenController();    break;
        case 'lichtrong':  $controller = new LichTrongController();  break;
        default:
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'API không tồn tại']);
            $out = ob_get_clean();
            echo $out; // already JSON
            exit;
    }

    // Some controllers echo JSON directly; some might return arrays/objects.
    // Prefer a common entry like handleRequest($action), but keep compatibility.
    if (method_exists($controller, 'handleRequest')) {
        $maybe = $controller->handleRequest($action);
        if ($maybe !== null) { $result = $maybe; }
    } else {
        // Fallback: try action-specific method if provided
        if ($action && method_exists($controller, $action)) {
            $maybe = $controller->{$action}();
            if ($maybe !== null) { $result = $maybe; }
        }
    }

    $out = ob_get_clean();

    // ---- If controller echoed something ----
    if ($out !== '' && $out !== false && $out !== null) {
        // If it's valid JSON, pass through
        $decoded = json_decode($out, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo $out; // already JSON
            exit;
        }
        // Not JSON (likely HTML warning/notice) -> wrap safely into JSON
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Non-JSON output intercepted from server.',
            'raw'     => substr(strip_tags($out), 0, 500)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ---- If controller returned a value instead of echoing ----
    if ($result !== null) {
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ---- Nothing returned and nothing echoed -> default response ----
    echo json_encode(['status' => 'ok'], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Throwable $e) {
    if (ob_get_level() > 0) { ob_end_clean(); }
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
