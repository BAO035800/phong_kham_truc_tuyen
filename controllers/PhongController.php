<?php
require_once __DIR__ . '/../models/Phong.php';

class PhongController
{
    private Phong $model;

    public function __construct()
    {
        session_start(); // ✅ cần thiết để dùng $_SESSION
        $this->model = new Phong();
    }

    // ✅ hàm kiểm tra quyền admin
    private function requireAdmin()
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Bạn chưa đăng nhập']);
            exit;
        }

        if ($_SESSION['user']['vai_tro'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Chỉ ADMIN mới có quyền thực hiện thao tác này']);
            exit;
        }
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                // ✅ Xem: ai cũng được
                case 'GET':
                    echo json_encode($id ? $this->model->find($id) : $this->model->all());
                    break;

                // ✅ Thêm, sửa, xóa: chỉ ADMIN
                case 'POST':
                    $this->requireAdmin();
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm phòng thành công', 'id' => $id]);
                    break;

                case 'PUT':
                    $this->requireAdmin();
                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật phòng thành công']);
                    break;

                case 'DELETE':
                    $this->requireAdmin();
                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa phòng thành công']);
                    break;

                default:
                    http_response_code(405);
                    echo json_encode(['error' => 'Phương thức không hợp lệ']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
