<?php
require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../config/Database.php';

class AuthController
{
    private Auth $auth;

    public function __construct()
    {
        $this->auth = new Auth();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /** Chuẩn hoá role về: admin | doctor | patient | guest */
    private function normalizeRole($role)
    {
        $role = strtolower(trim($role));
        return match ($role) {
            'admin' => 'admin',
            'bacsi', 'doctor' => 'doctor',
            'benhnhan', 'patient' => 'patient',
            default => 'guest',
        };
    }

    /** Chỉ admin */
    private function requireAdmin()
    {
        $role = $this->normalizeRole($_SESSION['user']['vai_tro'] ?? '');
        if ($role !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Chỉ ADMIN mới có quyền thực hiện thao tác này']);
            exit;
        }
    }
    
    public function handleRequest()
    {
        $action = $_GET['action'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($action) {
                case 'registerBenhNhan':
                    $id = $this->auth->registerBenhNhan($data);
                    echo json_encode(['message' => 'Đăng ký thành công', 'id' => $id]);
                    break;

                case 'registerBacSi':
                    $this->requireAdmin();
                    $id = $this->auth->registerBacSi($data);
                    echo json_encode(['message' => 'Đăng ký thành công', 'id' => $id]);
                    break;

                case 'login':
                    $user = $this->auth->login($data);
                    if (!$user) {
                        throw new Exception("Email hoặc mật khẩu không đúng");
                    }

                    // Chuẩn hoá vai trò
                    $norm = $this->normalizeRole($user['vai_tro'] ?? '');

                    // Trích xuất trường
                    $id    = $user['id'] ?? $user['ma_nguoi_dung'] ?? $user['id_nguoi_dung'] ?? null;
                    $email = $user['email'] ?? $user['ten_dang_nhap'] ?? null;
                    $name  = $user['ten_dang_nhap'] ?? $user['ho_ten'] ?? $email;

                    // Lưu session
                    $_SESSION['user'] = [
                        'id'      => $id,
                        'name'    => $name,
                        'email'   => $email,
                        'vai_tro' => $norm,   // <-- luôn: admin/doctor/patient
                    ];

                    // Nếu là bác sĩ → map sang ma_bac_si thật
                    if ($norm === 'doctor') {
                        $pdo = (new Database())->getConnection();
                        $stmt = $pdo->prepare("SELECT ma_bac_si FROM bacsi WHERE ma_nguoi_dung = ?");
                        $stmt->execute([$id]);
                        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            $_SESSION['user']['ma_bac_si'] = $row['ma_bac_si'];
                        }
                    }

                    error_log("✅ SESSION SAU LOGIN: " . print_r($_SESSION['user'], true));

                    echo json_encode([
                        'message' => 'Đăng nhập thành công',
                        'user'    => $_SESSION['user'],
                    ]);
                    break;

                case 'logout':
                    $this->auth->logout();
                    echo json_encode(['message' => 'Đã đăng xuất']);
                    break;

                case 'me':
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
                    echo json_encode(['error' => 'Hành động không hợp lệ']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
