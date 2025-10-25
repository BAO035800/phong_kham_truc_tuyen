<?php
require_once __DIR__ . '/../models/BaiViet.php';

class BaiVietController
{
    private BaiViet $model;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->model = new BaiViet();
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

    private function requireLogin(): array
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            throw new Exception('Bạn cần đăng nhập để thực hiện hành động này');
        }
        return $user;
    }

    private function isOwnerOrAdmin(array $user, array $post): bool
    {
        return ($user['vai_tro'] ?? '') === 'ADMIN' || (string)($user['id'] ?? '') === (string)($post['ma_nguoi_dung'] ?? '');
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
                                    : (http_response_code(404) || true) && ['status'=>'error','message'=>'Bài viết không tồn tại'];
                    }
                    return ['status'=>'ok','data'=>$this->model->all()];

                case 'POST': {
                    $user = $this->requireLogin();
                    if (!in_array($user['vai_tro'] ?? '', ['BACSI','ADMIN'], true)) {
                        http_response_code(403);
                        return ['status'=>'error','message'=>'Chỉ bác sĩ hoặc admin mới được đăng bài'];
                    }
                    $data['ma_nguoi_dung'] = $user['id'];
                    $newId = $this->model->create($data);
                    http_response_code(201);
                    return ['status'=>'ok','message'=>'Thêm bài viết thành công','id'=>$newId];
                }

                case 'PUT': {
                    $user = $this->requireLogin();
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu ID bài viết để cập nhật']; }
                    $post = $this->model->find($id);
                    if (!$post) { http_response_code(404); return ['status'=>'error','message'=>'Bài viết không tồn tại']; }
                    if (!$this->isOwnerOrAdmin($user, $post)) {
                        http_response_code(403);
                        return ['status'=>'error','message'=>'Bạn không có quyền sửa bài viết này'];
                    }
                    $this->model->update($id, $data);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Cập nhật bài viết thành công'];
                }

                case 'DELETE': {
                    $user = $this->requireLogin();
                    if ($id === null) { http_response_code(400); return ['status'=>'error','message'=>'Thiếu ID bài viết để xóa']; }
                    $post = $this->model->find($id);
                    if (!$post) { http_response_code(404); return ['status'=>'error','message'=>'Bài viết không tồn tại']; }
                    if (!$this->isOwnerOrAdmin($user, $post)) {
                        http_response_code(403);
                        return ['status'=>'error','message'=>'Bạn không có quyền xóa bài viết này'];
                    }
                    $this->model->delete($id);
                    http_response_code(200);
                    return ['status'=>'ok','message'=>'Xóa bài viết thành công'];
                }

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
