<?php
require_once __DIR__ . '/../models/Auth.php';

class AuthController
{
    private Auth $auth;

    public function __construct()
    {
        $this->auth = new Auth();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    private function requireAdmin()
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user || $user['vai_tro'] !== 'ADMIN') {
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
                    echo json_encode(['message' => 'Đăng nhập thành công', 'user' => $user]);
                    break;

                case 'logout':
                    $this->auth->logout();
                    echo json_encode(['message' => 'Đã đăng xuất']);
                    break;

                case 'me':
                    $user = $this->auth->currentUser();
                    echo json_encode($user ?: ['message' => 'Chưa đăng nhập']);
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
