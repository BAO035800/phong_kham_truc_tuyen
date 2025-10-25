<?php
require_once __DIR__ . '/../models/NguoiDung.php';

class NguoiDungController
{
    private NguoiDung $model;

    public function __construct()
    {
        // CORS + Content-Type do public/index.php xử lý
        $this->model = new NguoiDung();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /** Lấy input: ưu tiên JSON, fallback sang $_POST */
    private function getInput(): array
    {
        $ctype = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($ctype, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                return $data;
            }
        }
        return $_POST ?: [];
    }

    /** Parse id số nguyên an toàn (từ ?id=) */
    private function getId(): ?int
    {
        if (!isset($_GET['id'])) return null;
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        return $id === false ? null : $id;
    }

    public function handleRequest(): array
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $id     = $this->getId();
        $data   = $this->getInput();

        switch ($method) {
            case 'GET': {
                http_response_code(200);
                if ($id !== null) {
                    $row = $this->model->find($id);
                    return $row ? ['status'=>'ok','data'=>$row]
                                : (http_response_code(404) || true) && ['status'=>'error','message'=>'Không tìm thấy'];
                }
                // (tuỳ chọn) có thể thêm paging qua ?page=&limit=
                $list = $this->model->all();
                return ['status'=>'ok','data'=>$list];
            }

            case 'POST': {
                $action = $_GET['action'] ?? '';
                if ($action === 'createBenhNhan') {
                    $newId = $this->model->createBenhNhan($data);
                    http_response_code(201);
                    return ['status'=>'ok','message'=>'Thêm bệnh nhân thành công','id'=>$newId];
                }
                if ($action === 'createBacSi') {
                    $newId = $this->model->createBacSi($data);
                    http_response_code(201);
                    return ['status'=>'ok','message'=>'Thêm bác sĩ thành công','id'=>$newId];
                }
                http_response_code(400);
                return ['status'=>'error','message'=>'Thiếu action hoặc không hợp lệ (cần createBenhNhan hoặc createBacSi)'];
            }

            case 'PUT': {
                if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                $this->model->update($id, $data);
                http_response_code(200);
                return ['status'=>'ok','message'=>'Cập nhật thành công'];
            }

            case 'DELETE': {
                if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                $this->model->delete($id);
                http_response_code(200);
                return ['status'=>'ok','message'=>'Xóa thành công'];
            }

            default: {
                http_response_code(405);
                return ['status'=>'error','message'=>'Phương thức không hợp lệ'];
            }
        }
    }
}
