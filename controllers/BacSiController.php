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
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        switch ($method) {
            case 'GET':
                echo json_encode($id ? $this->model->find($id) : $this->model->all());
                break;
            case 'POST':
                $id = $this->model->create($data);
                echo json_encode(['message' => 'Thêm bác sĩ thành công', 'id' => $id]);
                break;
            case 'PUT':
                $this->model->update($id, $data);
                echo json_encode(['message' => 'Cập nhật bác sĩ thành công']);
                break;
            case 'DELETE':
                $this->model->delete($id);
                echo json_encode(['message' => 'Xóa bác sĩ thành công']);
                break;
            case 'listCongKhai':
                $result = $this->model->getTatCaBacSi();
                echo json_encode($result);
                break;
            case 'listByChuyenKhoa':
                $ma_chuyen_khoa = $_GET['ma_chuyen_khoa'] ?? null;
                if (!$ma_chuyen_khoa) throw new Exception("Thiếu mã chuyên khoa.");
                $result = $this->model->getByChuyenKhoa($ma_chuyen_khoa);
                echo json_encode($result);
                break;
            default:
                echo json_encode(['error' => 'Phương thức không hợp lệ']);
        }
    }
}
