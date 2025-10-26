<?php
require_once __DIR__ . '/../models/LichTrong.php';

class LichTrongController
{
    private LichTrong $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->model = new LichTrong();
    }

    /** ✅ Chỉ cho phép ADMIN hoặc DOCTOR */
    private function requireAdminAndBacSi()
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Bạn chưa đăng nhập']);
            exit;
        }

        $role = strtolower($_SESSION['user']['vai_tro'] ?? '');
        if (!in_array($role, ['admin', 'doctor'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Chỉ ADMIN hoặc BÁC SĨ mới có quyền thực hiện thao tác này']);
            exit;
        }
    }

    public function handleRequest()
    {
        $action = $_GET['action'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($action) {
                // 🟢 Tạo mới lịch trống
                case 'POST':
                    $this->requireAdminAndBacSi();
                    $result = $this->model->taoLichTrong($data);
                    echo json_encode($result);
                    break;

                // 🟡 Cập nhật lịch trống
                case 'PUT':
                    $this->requireAdminAndBacSi();
                    $id = $_GET['id'] ?? null;
                    if (!$id) throw new Exception("Thiếu mã lịch trống.");
                    $result = $this->model->capNhatLich($id, $data);
                    echo json_encode($result);
                    break;

                // 🔴 Xoá lịch trống
                case 'DELETE':
                    $this->requireAdminAndBacSi();
                    $id = $_GET['id'] ?? null;
                    if (!$id) throw new Exception("Thiếu mã lịch trống.");
                    $result = $this->model->xoaLich($id);
                    echo json_encode($result);
                    break;

                // 📋 Lấy danh sách lịch trống theo bác sĩ
                case 'listByBacSi':
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) throw new Exception("Thiếu mã bác sĩ.");
                    $result = $this->model->getByBacSi($ma_bac_si);
                    echo json_encode($result);
                    break;

                // 🌍 Lấy lịch trống công khai cho bệnh nhân xem
                case 'listCongKhai':
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) throw new Exception("Thiếu mã bác sĩ.");
                    $result = $this->model->getLichTrongCongKhai($ma_bac_si);
                    echo json_encode($result);
                    break;

                // 🧾 Lấy toàn bộ lịch trống của tất cả bác sĩ
                case 'listTatCa':
                    $result = $this->model->getTatCaLichTrong();
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
