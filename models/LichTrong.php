<?php
require_once __DIR__ . '/../config/Database.php';

class LichTrong
{
    private PDO $conn;

    public function __construct()
    {
        $this->conn = (new Database())->getConnection();
    }

    /**
     * 🔹 Tạo lịch trống mới (bác sĩ tự tạo)
     */
    public function taoLichTrong($data)
    {
        $ma_bac_si = $data['ma_bac_si'] ?? null;
        $thoi_gian_bat_dau = $data['thoi_gian_bat_dau'] ?? null;
        $thoi_gian_ket_thuc = $data['thoi_gian_ket_thuc'] ?? null;

        if (!$ma_bac_si || !$thoi_gian_bat_dau || !$thoi_gian_ket_thuc) {
            throw new Exception("Thiếu thông tin bắt buộc: mã bác sĩ, thời gian bắt đầu, thời gian kết thúc.");
        }

        // ✅ Kiểm tra trùng thời gian
        $check = $this->conn->prepare("
            SELECT * FROM lichtrong
            WHERE ma_bac_si = ?
              AND ((thoi_gian_bat_dau < ? AND thoi_gian_ket_thuc > ?) 
                OR (thoi_gian_bat_dau < ? AND thoi_gian_ket_thuc > ?))
        ");
        $check->execute([$ma_bac_si, $thoi_gian_bat_dau, $thoi_gian_bat_dau, $thoi_gian_ket_thuc, $thoi_gian_ket_thuc]);

        if ($check->fetch()) {
            throw new Exception("Khoảng thời gian này đã có lịch trống hoặc lịch hẹn.");
        }

        // ✅ Tạo mới
        $sql = "INSERT INTO lichtrong (ma_bac_si, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai)
                VALUES (?, ?, ?, 'TRONG')";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$ma_bac_si, $thoi_gian_bat_dau, $thoi_gian_ket_thuc]);

        return [
            'status' => 'success',
            'message' => 'Tạo lịch trống thành công.',
            'ma_lich_trong' => $this->conn->lastInsertId()
        ];
    }

    /**
     * 🔹 Cập nhật lịch trống (chỉ cho lịch chưa bị đặt)
     */
    public function capNhatLich($id, $data)
    {
        $stmt = $this->conn->prepare("SELECT * FROM lichtrong WHERE ma_lich_trong = ?");
        $stmt->execute([$id]);
        $lich = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$lich) throw new Exception("Không tìm thấy lịch trống.");
        if ($lich['trang_thai'] === 'DA_DAT') {
            throw new Exception("Không thể chỉnh sửa lịch đã được đặt.");
        }

        $thoi_gian_bat_dau = $data['thoi_gian_bat_dau'] ?? $lich['thoi_gian_bat_dau'];
        $thoi_gian_ket_thuc = $data['thoi_gian_ket_thuc'] ?? $lich['thoi_gian_ket_thuc'];

        $sql = "UPDATE lichtrong 
                SET thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ?
                WHERE ma_lich_trong = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$thoi_gian_bat_dau, $thoi_gian_ket_thuc, $id]);

        return [
            'status' => 'success',
            'message' => 'Cập nhật lịch trống thành công.'
        ];
    }

    /**
     * 🔹 Xóa lịch trống (chỉ khi chưa bị đặt)
     */
    public function xoaLich($id)
    {
        $stmt = $this->conn->prepare("SELECT trang_thai FROM lichtrong WHERE ma_lich_trong = ?");
        $stmt->execute([$id]);
        $lich = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$lich) throw new Exception("Không tìm thấy lịch trống.");
        if ($lich['trang_thai'] === 'DA_DAT') {
            throw new Exception("Không thể xóa lịch đã được đặt.");
        }

        $stmt = $this->conn->prepare("DELETE FROM lichtrong WHERE ma_lich_trong = ?");
        $stmt->execute([$id]);

        return [
            'status' => 'success',
            'message' => 'Đã xóa lịch trống thành công.'
        ];
    }

    /**
     * 🔹 Lấy danh sách lịch trống theo bác sĩ
     */
    public function getByBacSi($ma_bac_si)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM lichtrong 
            WHERE ma_bac_si = ?
            ORDER BY thoi_gian_bat_dau ASC
        ");
        $stmt->execute([$ma_bac_si]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 🔹 Lấy tất cả lịch trống của bác sĩ (cho bệnh nhân xem)
     */
    public function getLichTrongCongKhai($ma_bac_si)
    {
        $stmt = $this->conn->prepare("
            SELECT ma_lich_trong, ma_bac_si, thoi_gian_bat_dau, thoi_gian_ket_thuc
            FROM lichtrong
            WHERE ma_bac_si = ? AND trang_thai = 'TRONG'
            ORDER BY thoi_gian_bat_dau ASC
        ");
        $stmt->execute([$ma_bac_si]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 🔹 Lấy danh sách lịch trống của tất cả bác sĩ (cho bệnh nhân chọn)
     */
    public function getTatCaLichTrong()
    {
        $stmt = $this->conn->prepare("
        SELECT 
            lt.ma_lich_trong,
            lt.ma_bac_si,
            bs.ho_ten AS ten_bac_si,
            bs.chuyen_khoa,
            lt.thoi_gian_bat_dau,
            lt.thoi_gian_ket_thuc,
            lt.trang_thai
        FROM lichtrong lt
        JOIN bacsi bs ON lt.ma_bac_si = bs.ma_bac_si
        WHERE lt.trang_thai = 'TRONG'
        ORDER BY bs.ho_ten ASC, lt.thoi_gian_bat_dau ASC
    ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
