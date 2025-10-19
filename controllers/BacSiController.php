<?php
require_once __DIR__ . '/../models/BacSi.php';

class BacSiController
{
    private BacSi $model;

    public function __construct()
    {
        session_start();
        $this->model = new BacSi();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
            default:
                echo json_encode(['error' => 'Phương thức không hợp lệ']);
        }
    }
}
