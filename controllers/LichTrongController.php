<?php
require_once __DIR__ . '/../models/LichTrong.php';

class LichTrongController
{
    private LichTrong $model;

    public function __construct()
    {
        $this->model = new LichTrong();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    public function handleRequest()
    {
        $action = $_GET['action'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($action) {
                case 'POST':
                    $result = $this->model->taoLichTrong($data);
                    echo json_encode($result);
                    break;

                case 'PUT':
                    $id = $_GET['id'] ?? null;
                    if (!$id) throw new Exception("Thiếu mã lịch trống.");
                    $result = $this->model->capNhatLich($id, $data);
                    echo json_encode($result);
                    break;

                case 'DELETE':
                    $id = $_GET['id'] ?? null;
                    if (!$id) throw new Exception("Thiếu mã lịch trống.");
                    $result = $this->model->xoaLich($id);
                    echo json_encode($result);
                    break;

                case 'listByBacSi':
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) throw new Exception("Thiếu mã bác sĩ.");
                    $result = $this->model->getByBacSi($ma_bac_si);
                    echo json_encode($result);
                    break;

                case 'listCongKhai':
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) throw new Exception("Thiếu mã bác sĩ.");
                    $result = $this->model->getLichTrongCongKhai($ma_bac_si);
                    echo json_encode($result);
                    break;

                default:
                    echo json_encode(['error' => 'Hành động không hợp lệ.']);
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
