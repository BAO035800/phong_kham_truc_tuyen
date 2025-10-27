<?php
require_once __DIR__ . '/../models/BacSi.php';

class BacSiController
{
    private BacSi $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $this->model = new BacSi();
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? null;  // 🔥 Lấy action từ query string
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            if ($method === 'GET') {
                // ✅ xử lý các action đặc biệt
                switch ($action) {
                    case 'listCongKhai':
                        $result = $this->model->getTatCaBacSi();
                        echo json_encode($result);
                        return;

                    case 'listByChuyenKhoa':
                        $ma_chuyen_khoa = $_GET['ma_chuyen_khoa'] ?? null;
                        if (!$ma_chuyen_khoa) throw new Exception("Thiếu mã chuyên khoa.");
                        $result = $this->model->getByChuyenKhoa($ma_chuyen_khoa);
                        echo json_encode($result);
                        return;

                    default:
                        // Nếu không có action → lấy danh sách hoặc chi tiết
                        echo json_encode($id ? $this->model->find($id) : $this->model->all());
                        return;
                }
            }

            elseif ($method === 'POST') {
                $id = $this->model->create($data);
                echo json_encode(['message' => 'Thêm bác sĩ thành công', 'id' => $id]);
            }

            elseif ($method === 'PUT') {
                $this->model->update($id, $data);
                echo json_encode(['message' => 'Cập nhật bác sĩ thành công']);
            }

            elseif ($method === 'DELETE') {
                $this->model->delete($id);
                echo json_encode(['message' => 'Xóa bác sĩ thành công']);
            }

            else {
                http_response_code(405);
                echo json_encode(['error' => 'Phương thức không hợp lệ']);
            }

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}
