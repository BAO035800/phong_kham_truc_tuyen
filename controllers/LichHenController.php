<?php
require_once __DIR__ . '/../models/LichHen.php';

class LichHenController
{
    private LichHen $model;

    public function __construct()
    {
        $this->model = new LichHen();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    public function handleRequest()
    {
        $action = $_GET['action'] ?? '';
        $data = json_decode(file_get_contents("php://input"), true);

        try {
            switch ($action) {
                case 'datLich':
                    $result = $this->model->datLich($data);
                    echo json_encode($result);
                    break;

                case 'huyLich':
                    $id = $_GET['id'] ?? null;
                    if (!$id) throw new Exception("Thiếu mã lịch hẹn.");
                    $result = $this->model->huyLich($id);
                    echo json_encode($result);
                    break;

                case 'listByBenhNhan':
                    $ma_benh_nhan = $_GET['ma_benh_nhan'] ?? null;
                    if (!$ma_benh_nhan) throw new Exception("Thiếu mã bệnh nhân.");
                    $result = $this->model->getByBenhNhan($ma_benh_nhan);
                    echo json_encode($result);
                    break;

                default:
                    echo json_encode(['error' => 'Hành động không hợp lệ']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
