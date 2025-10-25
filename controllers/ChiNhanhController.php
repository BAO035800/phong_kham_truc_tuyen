<?php
require_once __DIR__ . '/../models/ChiNhanh.php';

class ChiNhanhController
{
    private ChiNhanh $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new ChiNhanh();
    }

    // ⚙️ Chỉ ADMIN mới được thêm/sửa/xóa
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
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                // 🟢 Ai cũng được xem danh sách hoặc chi tiết
                case 'GET':
                    echo json_encode($id ? $this->model->find($id) : $this->model->all());
                    break;

                // 🟡 ADMIN thêm chi nhánh
                case 'POST':
                    $this->requireAdmin();
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm chi nhánh thành công', 'id' => $id]);
                    break;

                // 🟠 ADMIN sửa chi nhánh
                case 'PUT':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID chi nhánh để cập nhật");
                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật chi nhánh thành công']);
                    break;

                // 🔴 ADMIN xóa chi nhánh
                case 'DELETE':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID chi nhánh để xóa");
                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa chi nhánh thành công']);
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
