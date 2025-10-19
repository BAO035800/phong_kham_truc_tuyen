<?php
require_once __DIR__ . '/../models/ChuyenKhoa.php';

class ChuyenKhoaController
{
    private ChuyenKhoa $model;

    public function __construct()
    {
        session_start();
        $this->model = new ChuyenKhoa();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                // 🟢 Xem danh sách hoặc chi tiết chuyên khoa
                case 'GET':
                    echo json_encode($id ? $this->model->find($id) : $this->model->all());
                    break;

                // 🟡 Thêm chuyên khoa (ADMIN)
                case 'POST':
                    $this->requireAdmin();
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm chuyên khoa thành công', 'id' => $id]);
                    break;

                // 🟠 Sửa chuyên khoa (ADMIN)
                case 'PUT':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID chuyên khoa để cập nhật");
                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật chuyên khoa thành công']);
                    break;

                // 🔴 Xóa chuyên khoa (ADMIN)
                case 'DELETE':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID chuyên khoa để xóa");
                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa chuyên khoa thành công']);
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
