<?php
require_once __DIR__ . '/../models/BenhNhan.php';

class BenhNhanController
{
    private BenhNhan $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new BenhNhan();
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                case 'GET':
                    echo json_encode($id ? $this->model->find($id) : $this->model->all());
                    break;

                case 'POST':
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm bệnh nhân thành công', 'id' => $id]);
                    break;

                case 'PUT':
                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật bệnh nhân thành công']);
                    break;

                case 'DELETE':
                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa bệnh nhân thành công']);
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
