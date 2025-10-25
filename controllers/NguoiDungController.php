<?php
require_once __DIR__ . '/../models/NguoiDung.php';

class NguoiDungController
{
    private NguoiDung $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new NguoiDung();
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
                    try {
                        if (empty($data) || !isset($data['vai_tro'])) {
                            http_response_code(400);
                            echo json_encode(['error' => 'Thiếu dữ liệu hoặc vai trò người dùng']);
                            break;
                        }
                
                        $role = strtoupper(trim($data['vai_tro']));
                        $id = null;
                
                        switch ($role) {
                            case 'BENHNHAN':
                                $id = $this->model->createBenhNhan($data);
                                echo json_encode([
                                    'status'  => 'success',
                                    'message' => 'Thêm bệnh nhân thành công',
                                    'id'      => $id
                                ]);
                                break;
                
                            case 'BACSI':
                                $id = $this->model->createBacSi($data);
                                echo json_encode([
                                    'status'  => 'success',
                                    'message' => 'Thêm bác sĩ thành công',
                                    'id'      => $id
                                ]);
                                break;
                
                            default:
                                http_response_code(400);
                                echo json_encode(['error' => 'Vai trò không hợp lệ. Chỉ chấp nhận BENHNHAN hoặc BACSI.']);
                        }
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode([
                            'status'  => 'error',
                            'message' => 'Lỗi khi thêm người dùng: ' . $e->getMessage()
                        ]);
                    }
                    break;
                
            case 'PUT':
                $this->model->update($id, $data);
                echo json_encode(['message' => 'Cập nhật thành công']);
                break;
            case 'DELETE':
                $this->model->delete($id);
                echo json_encode(['message' => 'Xóa thành công']);
                break;
            default:
                echo json_encode(['error' => 'Phương thức không hợp lệ']);
        }
    }
}
