<?php
require_once __DIR__ . '/../models/Auth.php';

class AuthController
{
    private Auth $auth;

    public function __construct()
    {
        // CORS + Content-Type đã làm ở public/index.php
        $this->auth = new Auth();
        if (session_status() === PHP_SESSION_NONE) session_start();
    }

    /** Đọc input: ưu tiên JSON, fallback sang $_POST */
    private function getInput(): array
    {
        $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($ctype, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                return $data;
            }
        }
        return $_POST ?: [];
    }

    /** Chỉ cho ADMIN */
    private function requireAdmin(): void
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user || ($user['vai_tro'] ?? null) !== 'ADMIN') {
            http_response_code(403);
            throw new Exception('Chỉ ADMIN mới có quyền thực hiện thao tác này');
        }
    }

    public function handleRequest(): array
    {
        $action = $_GET['action'] ?? '';
        $data   = $this->getInput();

        switch ($action) {
            case 'registerBenhNhan': {
                $res = $this->auth->registerBenhNhan($data);
                // $res (từ model Auth) đã trả mảng status/message/user_id
                http_response_code(200);
                return $res;
            }

            case 'registerBacSi': {
                $this->requireAdmin();
                $res = $this->auth->registerBacSi($data);
                http_response_code(200);
                return $res;
            }

            case 'login': {
                // Map linh hoạt: nhận email/password hoặc identifier/mat_khau
                $mapped = [
                    'identifier' => $data['identifier'] ?? ($data['email'] ?? null),
                    'mat_khau'   => $data['mat_khau']   ?? ($data['password'] ?? null),
                ];
                if (!$mapped['identifier'] || !$mapped['mat_khau']) {
                    http_response_code(400);
                    return ['status' => 'error', 'message' => 'Thiếu thông tin đăng nhập'];
                }

                try {
                    $user = $this->auth->login($mapped);
                    http_response_code(200);
                    return ['status' => 'ok', 'message' => 'Đăng nhập thành công', 'user' => $user];
                } catch (Exception $e) {
                    http_response_code(401);
                    return ['status' => 'error', 'message' => $e->getMessage()];
                }
            }

            case 'logout': {
                $this->auth->logout();
                http_response_code(200);
                return ['status' => 'ok', 'message' => 'Đã đăng xuất'];
            }

            case 'me': {
                $user = $this->auth->currentUser();
                http_response_code(200);
                return $user ? ['status' => 'ok', 'user' => $user]
                             : ['status' => 'error', 'message' => 'Chưa đăng nhập'];
            }

            default: {
                http_response_code(404);
                return ['status' => 'error', 'message' => 'Hành động không hợp lệ'];
            }
        }
    }
}
