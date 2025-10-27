<?php
require_once __DIR__ . '/../models/DichVu.php';

class DichVuController
{
    private DichVu $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new DichVu();
    }

    private function requireAdmin()
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user || strtoupper($user['vai_tro']) !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Chỉ ADMIN mới có quyền thực hiện thao tác này']);
            exit;
        }
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $action = $_GET['action'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                /* 🟢 GET: xem tất cả / chi tiết / theo chuyên khoa */
                case 'GET':
                    if ($action === 'listByChuyenKhoa') {
                        $ma_chuyen_khoa = $_GET['ma_chuyen_khoa'] ?? null;
                        if (!$ma_chuyen_khoa) throw new Exception("Thiếu mã chuyên khoa.");
                        $result = $this->model->getByChuyenKhoa($ma_chuyen_khoa);
                        echo json_encode($result);
                    } elseif ($id) {
                        echo json_encode($this->model->find($id));
                    } else {
                        echo json_encode($this->model->all());
                    }
                    break;

                /* 🟡 POST: thêm dịch vụ */
                case 'POST':
                    $this->requireAdmin();
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm dịch vụ thành công', 'id' => $id]);
                    break;

                /* 🟠 PUT: cập nhật */
                case 'PUT':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID dịch vụ để cập nhật");
                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật dịch vụ thành công']);
                    break;

                /* 🔴 DELETE: xóa */
                case 'DELETE':
                    $this->requireAdmin();
                    if (!$id) throw new Exception("Thiếu ID dịch vụ để xóa");
                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa dịch vụ thành công']);
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
