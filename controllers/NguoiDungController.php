<?php
require_once __DIR__ . '/../models/NguoiDung.php';
require_once __DIR__ . '/../models/BacSi.php'; // 🔹 cần để tự tạo bản ghi bác sĩ

class NguoiDungController
{
    private NguoiDung $nguoiDungModel;
    private BacSi $bacSiModel;

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $this->nguoiDungModel = new NguoiDung();
        $this->bacSiModel = new BacSi();
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            switch ($method) {
                /* ==============================
                   🟢 LẤY DANH SÁCH HOẶC CHI TIẾT
                ============================== */
                case 'GET':
                    echo json_encode($id ? $this->nguoiDungModel->find($id) : $this->nguoiDungModel->all());
                    break;

                /* ==============================
                   🟡 THÊM NGƯỜI DÙNG
                ============================== */
                case 'POST':
                    if (empty($data['email']) || empty($data['mat_khau']) || empty($data['vai_tro'])) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Thiếu thông tin bắt buộc (email, mật khẩu, vai trò)']);
                        return;
                    }

                    $role = strtoupper(trim($data['vai_tro']));
                    $id = null;

                    switch ($role) {
                        /* ✅ BỆNH NHÂN */
                        case 'BENHNHAN':
                            $id = $this->nguoiDungModel->createBenhNhan($data);
                            echo json_encode([
                                'status' => 'success',
                                'message' => 'Thêm bệnh nhân thành công',
                                'id' => $id
                            ]);
                            break;

                        /* ✅ BÁC SĨ — Tự thêm luôn bản ghi trong bảng bacsi */
                        case 'BACSI':
                            // 1️⃣ Tạo tài khoản người dùng
                            $maNguoiDung = $this->nguoiDungModel->createSimpleUser($data);

                            // 2️⃣ Tạo bản ghi trong bảng bacsi (chưa có chi tiết)
                            $bacSiData = [
                                'ma_nguoi_dung' => $maNguoiDung,
                                'ma_chuyen_khoa' => $data['ma_chuyen_khoa'] ?? null,
                                'ho_ten' => $data['ho_ten'] ?? $data['ten_dang_nhap'],
                                'trinh_do' => $data['trinh_do'] ?? '',
                                'kinh_nghiem' => $data['kinh_nghiem'] ?? 0,
                                'mo_ta' => $data['mo_ta'] ?? ''
                            ];
                            $maBacSi = $this->bacSiModel->create($bacSiData);

                            echo json_encode([
                                'status' => 'success',
                                'message' => 'Thêm tài khoản bác sĩ thành công',
                                'ma_nguoi_dung' => $maNguoiDung,
                                'ma_bac_si' => $maBacSi
                            ]);
                            break;

                        /* ✅ ADMIN */
                        case 'ADMIN':
                            $id = $this->nguoiDungModel->createAdmin($data);
                            echo json_encode([
                                'status' => 'success',
                                'message' => 'Thêm admin thành công',
                                'id' => $id
                            ]);
                            break;

                        default:
                            http_response_code(400);
                            echo json_encode(['error' => 'Vai trò không hợp lệ.']);
                    }
                    break;

                /* ==============================
                   🟠 CẬP NHẬT NGƯỜI DÙNG
                ============================== */
                case 'PUT':
                    if (!$id) throw new Exception("Thiếu ID người dùng để cập nhật");
                    $this->nguoiDungModel->update($id, $data);
                    echo json_encode(['message' => 'Cập nhật người dùng thành công']);
                    break;

                /* ==============================
                   🔴 XÓA NGƯỜI DÙNG
                ============================== */
                case 'DELETE':
                    if (!$id) throw new Exception("Thiếu ID người dùng để xóa");
                    $this->nguoiDungModel->delete($id);
                    echo json_encode(['message' => 'Xóa người dùng thành công']);
                    break;

                default:
                    http_response_code(405);
                    echo json_encode(['error' => 'Phương thức không hợp lệ']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}
