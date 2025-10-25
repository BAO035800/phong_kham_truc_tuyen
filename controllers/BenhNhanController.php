<?php
require_once __DIR__ . '/../models/BenhNhan.php';

class BenhNhanController
{
    private BenhNhan $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->model = new BenhNhan();
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

        try {
            switch ($method) {
                case 'GET':
                    http_response_code(200);
                    if ($id !== null) {
                        $row = $this->model->find($id);
                        return $row ? ['status'=>'ok','data'=>$row]
                                    : (http_response_code(404) || true) && ['status'=>'error','message'=>'Không tìm thấy'];
                    }
                    return ['status'=>'ok','data'=>$this->model->all()];

                case 'POST':
                    $newId = $this->model->create($data);
                    http_response_code(201);
                    return ['status'=>'ok','message'=>'Thêm bệnh nhân thành công','id'=>$newId];

                case 'PUT':
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                    $this->model->update($id, $data);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Cập nhật bệnh nhân thành công'];

                case 'DELETE':
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu id']; }
                    $this->model->delete($id);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Xóa bệnh nhân thành công'];

                default:
                    http_response_code(405);
                    return ['status'=>'error','message'=>'Phương thức không hợp lệ'];
            }
        } catch (Exception $e) {
            if (http_response_code() < 400) http_response_code(400);
            return ['status'=>'error','message'=>$e->getMessage()];
        }
    }
}
