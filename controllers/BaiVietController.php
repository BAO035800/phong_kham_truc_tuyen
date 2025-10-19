<?php
require_once __DIR__ . '/../models/BaiViet.php';

class BaiVietController
{
    private BaiViet $model;

    public function __construct()
    {
        session_start();
        $this->model = new BaiViet();
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    private function requireLogin()
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Bạn cần đăng nhập để thực hiện hành động này']);
            exit;
        }
        return $user;
    }

    private function requireAdmin()
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user || $user['vai_tro'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Chỉ ADMIN mới có quyền thực hiện thao tác này']);
            exit;
        }
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                // 🟢 Xem danh sách hoặc chi tiết (ai cũng được)
                case 'GET':
                    echo json_encode($id ? $this->model->find($id) : $this->model->all());
                    break;

                // 🟡 Thêm bài viết (BACSI hoặc ADMIN)
                case 'POST':
                    $user = $this->requireLogin();
                    if (!in_array($user['vai_tro'], ['BACSI', 'ADMIN'])) {
                        throw new Exception("Chỉ bác sĩ hoặc admin mới được đăng bài.");
                    }

                    $data['ma_nguoi_dung'] = $user['id'];
                    $id = $this->model->create($data);
                    echo json_encode(['message' => 'Thêm bài viết thành công', 'id' => $id]);
                    break;

                // 🟠 Cập nhật bài viết
                case 'PUT':
                    $user = $this->requireLogin();
                    if (!$id) throw new Exception("Thiếu ID bài viết để cập nhật");

                    $post = $this->model->find($id);
                    if (!$post) throw new Exception("Bài viết không tồn tại");

                    // Chỉ ADMIN hoặc chủ bài viết được sửa
                    if ($user['vai_tro'] !== 'ADMIN' && $user['id'] != $post['ma_nguoi_dung']) {
                        throw new Exception("Bạn không có quyền sửa bài viết này");
                    }

                    $this->model->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật bài viết thành công']);
                    break;

                // 🔴 Xóa bài viết
                case 'DELETE':
                    $user = $this->requireLogin();
                    if (!$id) throw new Exception("Thiếu ID bài viết để xóa");

                    $post = $this->model->find($id);
                    if (!$post) throw new Exception("Bài viết không tồn tại");

                    // Chỉ ADMIN hoặc chủ bài viết được xóa
                    if ($user['vai_tro'] !== 'ADMIN' && $user['id'] != $post['ma_nguoi_dung']) {
                        throw new Exception("Bạn không có quyền xóa bài viết này");
                    }

                    $this->model->delete($id);
                    echo json_encode(['message' => 'Xóa bài viết thành công']);
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
