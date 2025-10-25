<?php
require_once __DIR__ . '/../models/LichTrong.php';

class LichTrongController
{
    private LichTrong $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->model = new LichTrong();
        // KHÔNG set header ở đây
    }

    private function getInput(): array
    {
        $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($ctype, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $d = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($d)) return $d;
        }
        return $_POST ?: [];
    }

    private function requireAdminAndBacSi(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            throw new Exception('Bạn chưa đăng nhập');
        }
        $role = $_SESSION['user']['vai_tro'] ?? null;
        if (!in_array($role, ['ADMIN','BACSI'], true)) {
            http_response_code(403);
            throw new Exception('Chỉ ADMIN hoặc BÁC SĨ mới có quyền thực hiện thao tác này');
        }
    }

    public function handleRequest(): array
    {
        $action = $_GET['action'] ?? '';
        $data   = $this->getInput();

        try {
            switch ($action) {
                case 'POST': { // giữ nguyên ý đồ cũ của bạn
                    $this->requireAdminAndBacSi();
                    $res = $this->model->taoLichTrong($data);
                    http_response_code(201);
                    return $res;
                }

                case 'PUT': {
                    $this->requireAdminAndBacSi();
                    $id = $_GET['id'] ?? null;
                    if (!$id) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã lịch trống']; }
                    $res = $this->model->capNhatLich($id, $data);
                    http_response_code(200);
                    return $res;
                }

                case 'DELETE': {
                    $this->requireAdminAndBacSi();
                    $id = $_GET['id'] ?? null;
                    if (!$id) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã lịch trống']; }
                    $res = $this->model->xoaLich($id);
                    http_response_code(200);
                    return $res;
                }

                case 'listByBacSi': {
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã bác sĩ']; }
                    $res = $this->model->getByBacSi($ma_bac_si);
                    http_response_code(200);
                    return ['status'=>'ok','data'=>$res];
                }

                case 'listCongKhai': {
                    $ma_bac_si = $_GET['ma_bac_si'] ?? null;
                    if (!$ma_bac_si) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã bác sĩ']; }
                    $res = $this->model->getLichTrongCongKhai($ma_bac_si);
                    http_response_code(200);
                    return ['status'=>'ok','data'=>$res];
                }

                case 'listTatCa': {
                    $res = $this->model->getTatCaLichTrong();
                    http_response_code(200);
                    return ['status'=>'ok','data'=>$res];
                }

                default:
                    http_response_code(404);
                    return ['status'=>'error','message'=>'Hành động không hợp lệ'];
            }
        } catch (Exception $e) {
            if (http_response_code() < 400) http_response_code(400);
            return ['status'=>'error','message'=>$e->getMessage()];
        }
    }
}
