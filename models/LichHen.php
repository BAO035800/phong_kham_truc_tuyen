<?php
require_once __DIR__ . '/../config/Database.php';

class LichHen
{
    private PDO $conn;

    public function __construct()
    {
        $this->conn = (new Database())->getConnection();
    }

    /**
     * 🔹 Tạo lịch hẹn mới (khi bệnh nhân đặt)
     * - Tạo bản ghi trong bảng lichhen
     * - Cập nhật lichtrong thành 'DA_DAT'
     */
    public function datLich($data)
    {
        $this->conn->beginTransaction();
        try {
            // Lấy thông tin cần thiết
            $ma_benh_nhan = $data['ma_benh_nhan'];
            $ma_bac_si = $data['ma_bac_si'];
            $ma_dich_vu = $data['ma_dich_vu'];
            $ma_phong = $data['ma_phong'];
            $thoi_gian = $data['thoi_gian'];
            $ghi_chu = $data['ghi_chu'] ?? '';

            // ✅ Kiểm tra lịch trống có tồn tại và chưa bị đặt
            $sqlCheck = "SELECT * FROM lichtrong 
                         WHERE ma_bac_si = ? 
                         AND thoi_gian_bat_dau <= ? 
                         AND thoi_gian_ket_thuc > ? 
                         AND trang_thai = 'TRONG'";
            $stmt = $this->conn->prepare($sqlCheck);
            $stmt->execute([$ma_bac_si, $thoi_gian, $thoi_gian]);
            $lichTrong = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lichTrong) {
                throw new Exception("Không có lịch trống phù hợp hoặc đã được đặt.");
            }

            // ✅ Tạo lịch hẹn
            $sqlInsert = "INSERT INTO lichhen (ma_benh_nhan, ma_bac_si, ma_dich_vu, ma_phong, thoi_gian, trang_thai, ghi_chu)
                          VALUES (?, ?, ?, ?, ?, 'CHO_XAC_NHAN', ?)";
            $stmt = $this->conn->prepare($sqlInsert);
            $stmt->execute([$ma_benh_nhan, $ma_bac_si, $ma_dich_vu, $ma_phong, $thoi_gian, $ghi_chu]);

            $ma_lich_hen = $this->conn->lastInsertId();

            // ✅ Cập nhật lịch trống thành đã đặt
            $sqlUpdate = "UPDATE lichtrong SET trang_thai = 'DA_DAT' WHERE ma_lich_trong = ?";
            $stmt = $this->conn->prepare($sqlUpdate);
            $stmt->execute([$lichTrong['ma_lich_trong']]);

            $this->conn->commit();

            return [
                'status' => 'success',
                'message' => 'Đặt lịch thành công!',
                'ma_lich_hen' => $ma_lich_hen
            ];
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Lỗi khi đặt lịch: " . $e->getMessage());
        }
    }

    /**
     * 🔹 Hủy lịch hẹn (bệnh nhân hoặc bác sĩ)
     */
    public function huyLich($ma_lich_hen)
    {
        $this->conn->beginTransaction();
        try {
            // Lấy thông tin lịch hẹn
            $stmt = $this->conn->prepare("SELECT * FROM lichhen WHERE ma_lich_hen = ?");
            $stmt->execute([$ma_lich_hen]);
            $lich = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lich) {
                throw new Exception("Không tìm thấy lịch hẹn.");
            }

            // Cập nhật trạng thái lịch hẹn
            $this->conn->prepare("UPDATE lichhen SET trang_thai = 'DA_HUY' WHERE ma_lich_hen = ?")
                ->execute([$ma_lich_hen]);

            // Mở lại lịch trống
            $this->conn->prepare("UPDATE lichtrong 
                SET trang_thai = 'TRONG' 
                WHERE ma_bac_si = ? 
                  AND thoi_gian_bat_dau <= ? 
                  AND thoi_gian_ket_thuc > ?")
                ->execute([$lich['ma_bac_si'], $lich['thoi_gian'], $lich['thoi_gian']]);

            $this->conn->commit();

            return ['status' => 'success', 'message' => 'Đã hủy lịch thành công.'];
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Lỗi khi hủy lịch: " . $e->getMessage());
        }
    }

    /**
     * 🔹 Danh sách lịch hẹn theo bệnh nhân
     */
    public function getByBenhNhan($ma_benh_nhan)
    {
        $stmt = $this->conn->prepare("
            SELECT lh.*, bs.ho_ten AS ten_bac_si, dv.ten_dich_vu, p.ten_phong
            FROM lichhen lh
            JOIN bacsi bs ON lh.ma_bac_si = bs.ma_bac_si
            JOIN dichvu dv ON lh.ma_dich_vu = dv.ma_dich_vu
            JOIN phong p ON lh.ma_phong = p.ma_phong
            WHERE lh.ma_benh_nhan = ?
            ORDER BY lh.thoi_gian DESC
        ");
        $stmt->execute([$ma_benh_nhan]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function xacNhanLich($ma_lich_hen)
    {
        $stmt = $this->conn->prepare("
        UPDATE lichhen 
        SET trang_thai = 'DA_XAC_NHAN',
            thoi_gian_xac_nhan = NOW()
        WHERE ma_lich_hen = ? AND trang_thai = 'CHO_XAC_NHAN'
    ");
        $stmt->execute([$ma_lich_hen]);
        return [
            'status' => 'success',
            'message' => 'Đã xác nhận lịch hẹn.'
        ];
    }
}
