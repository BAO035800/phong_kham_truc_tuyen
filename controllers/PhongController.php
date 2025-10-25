<?php
require_once __DIR__ . '/../models/Phong.php';

class PhongController
{
    private Phong $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->model = new Phong();
        // KHÔNG set header CORS/Content-Type ở đây. public/index.php đã xử lý.
    }

    /** Lấy input: ưu tiên JSON, fallback sang $_POST */
    private function getInput(): array
    {
        $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($ctype, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $d = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($d)) return $d;
        }
        return $_POST ?: [];
    }

    /** Lấy id số an toàn từ query */
    private function getId(): ?int
    {
        if (!isset($_GET['id'])) return null;
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        return $id === false ? null : $id;
    }

    /** Chỉ ADMIN được phép */
    private function requireAdmin(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            throw new Exception('Bạn chưa đăng nhập');
        }
        if (($_SESSION['user']['vai_tro'] ?? '') !== 'ADMIN') {
            http_response_code(403);
            throw new Exception('Chỉ ADMIN mới có quyền thực hiện thao tác này');
        }
    }

    /** $action để tương thích với index.php gọi handleRequest($action) */
    public function handleRequest($action = null): array
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $id     = $this->getId();
        $data   = $this->getInput();

        try {
            switch ($method) {
                // ✅ Xem: ai cũng được
                case 'GET': {
                    http_response_code(200);
                    if ($id !== null) {
                        $row = $this->model->find($id);
                        return $row ? ['status'=>'ok','data'=>$row]
                                    : (http_response_code(404) || true) && ['status'=>'error','message'=>'Không tìm thấy'];
                    }
                    return ['status'=>'ok','data'=>$this->model->all()];
                }

                // ✅ Thêm: chỉ ADMIN
                case 'POST': {
                    $this->requireAdmin();
                    $newId = $this->model->create($data);
                    http_response_code(201);
                    return ['status'=>'ok','message'=>'Thêm phòng thành công','id'=>$newId];
                }

                // ✅ Sửa: chỉ ADMIN
                case 'PUT': {
                    $this->requireAdmin();
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                    $this->model->update($id, $data);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Cập nhật phòng thành công'];
                }

                // ✅ Xóa: chỉ ADMIN
                case 'DELETE': {
                    $this->requireAdmin();
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                    $this->model->delete($id);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Xóa phòng thành công'];
                }

                default: {
                    http_response_code(405);
                    return ['status'=>'error','message'=>'Phương thức không hợp lệ'];
                }
            }
        } catch (Exception $e) {
            if (http_response_code() < 400) http_response_code(400);
            return ['status'=>'error','message'=>$e->getMessage()];
        }
    }
}
