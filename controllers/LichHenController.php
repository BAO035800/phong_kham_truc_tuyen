<?php
require_once __DIR__ . '/../models/LichHen.php';

class LichHenController
{
    private LichHen $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->model = new LichHen();
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
                case 'datLich': {
    $d = $data;

    // 1) Chuẩn hoá ngày: cho phép dd/mm/yyyy
    if (!empty($d['ngay']) && preg_match('#^\d{1,2}/\d{1,2}/\d{4}$#', $d['ngay'])) {
        $dt = DateTime::createFromFormat('d/m/Y', $d['ngay']);
        if ($dt) $d['ngay'] = $dt->format('Y-m-d');
    }

    // 2) Suy ra ma_benh_nhan từ session nếu FE không gửi
    if (empty($d['ma_benh_nhan']) && !empty($_SESSION['user'])) {
        $u = $_SESSION['user'];
        if (!empty($u['ma_benh_nhan'])) {
            $d['ma_benh_nhan'] = $u['ma_benh_nhan'];
        } else {
            $maNguoiDung = $u['ma_nguoi_dung'] ?? $u['id'] ?? null;
            if ($maNguoiDung) {
                $found = $this->model->findBenhNhanIdByUserId((int)$maNguoiDung);
                if ($found) $d['ma_benh_nhan'] = $found;
            }
        }
    }

    if (empty($d['ma_benh_nhan'])) {
        http_response_code(400);
        return ['status' => 'error', 'message' => 'Thiếu hoặc không xác định được mã bệnh nhân'];
    }
    if (empty($d['ma_bac_si']) || empty($d['ngay']) || empty($d['gio'])) {
        http_response_code(400);
        return ['status'=>'error','message'=>'Thiếu thông tin bắt buộc (bác sĩ / ngày / giờ)'];
    }

    // 🔧 GHÉP thoi_gian cho đúng mô-típ model
    // d['gio'] dạng HH:MM -> thêm :00 để thành HH:MM:SS
    $d['thoi_gian'] = $d['ngay'] . ' ' . (strlen($d['gio']) === 5 ? ($d['gio'].':00') : $d['gio']);

    // (tuỳ chọn) nếu FE không gửi ma_dich_vu / ma_phong, để model tự lấy từ slot 'lichtrong'
    $d['ma_dich_vu'] = $d['ma_dich_vu'] ?? null;
    $d['ma_phong']   = $d['ma_phong']   ?? null;

    $res = $this->model->datLich($d);
    http_response_code(200);
    return $res;
}


                case 'huyLich': {
                    $id = $_GET['id'] ?? null;
                    if (!$id) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã lịch hẹn']; }
                    $res = $this->model->huyLich($id);
                    http_response_code(200);
                    return $res;
                }

                case 'listByBenhNhan': {
                    $ma_benh_nhan = $_GET['ma_benh_nhan'] ?? null;
                    if (!$ma_benh_nhan) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã bệnh nhân']; }
                    $res = $this->model->getByBenhNhan($ma_benh_nhan);
                    http_response_code(200);
                    return ['status'=>'ok','data'=>$res];
                }

                case 'xacNhanLich': {
                    $this->requireAdminAndBacSi();
                    $ma_lich_hen = $data['ma_lich_hen'] ?? null;
                    if (!$ma_lich_hen) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu mã lịch hẹn']; }
                    $res = $this->model->xacNhanLich($ma_lich_hen);
                    http_response_code(200);
                    return $res;
                }

                case 'xacNhanQuaEmail': {
                    $token = $_GET['token'] ?? null;
                    if (!$token) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu token xác nhận']; }
                    $res = $this->model->xacNhanQuaEmail($token);
                    http_response_code(200);
                    return $res;
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
