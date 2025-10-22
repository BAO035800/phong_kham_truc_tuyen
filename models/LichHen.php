<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../services/MailerService.php';

class LichHen
{
    private PDO $conn;

    public function __construct()
    {
        $this->conn = (new Database())->getConnection();
    }

    /**
     * 🟢 Đặt lịch hẹn (bệnh nhân)
     * - Tạo lịch hẹn ở trạng thái CHO_XAC_NHAN
     * - Sinh token và gửi mail xác nhận
     */
    public function datLich($data)
    {
        $this->conn->beginTransaction();
        try {
            $ma_benh_nhan = $data['ma_benh_nhan'];
            $ma_bac_si = $data['ma_bac_si'];
            $ma_dich_vu = $data['ma_dich_vu'];
            $ma_phong = $data['ma_phong'];
            $thoi_gian = $data['thoi_gian'];
            $ghi_chu = $data['ghi_chu'] ?? '';

            // 🔍 Lấy email bệnh nhân từ bảng benhnhan
            $stmt = $this->conn->prepare("SELECT email, ho_ten FROM benhnhan WHERE ma_benh_nhan = ?");
            $stmt->execute([$ma_benh_nhan]);
            $benhnhan = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$benhnhan) {
                throw new Exception("Không tìm thấy bệnh nhân với mã $ma_benh_nhan");
            }
            $email_benh_nhan = $benhnhan['email'];

            // 🔍 Kiểm tra lịch trống
            $sql = "SELECT * FROM lichtrong 
                    WHERE ma_bac_si = ? 
                      AND thoi_gian_bat_dau <= ? 
                      AND thoi_gian_ket_thuc > ? 
                      AND trang_thai = 'TRONG'";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$ma_bac_si, $thoi_gian, $thoi_gian]);
            $lichTrong = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lichTrong) {
                throw new Exception("Không có lịch trống phù hợp hoặc đã được đặt.");
            }

            // 🧩 Sinh token xác nhận
            $token = bin2hex(random_bytes(32));

            // 🗂️ Thêm lịch hẹn mới
            $sql = "INSERT INTO lichhen 
                    (ma_benh_nhan, ma_bac_si, ma_dich_vu, ma_phong, thoi_gian, trang_thai, ghi_chu, xac_nhan_token)
                    VALUES (?, ?, ?, ?, ?, 'CHO_XAC_NHAN', ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$ma_benh_nhan, $ma_bac_si, $ma_dich_vu, $ma_phong, $thoi_gian, $ghi_chu, $token]);

            $ma_lich_hen = $this->conn->lastInsertId();
            $this->conn->commit();

            // ✉️ Gửi mail xác nhận
            if ($email_benh_nhan) {
                MailerService::sendAppointmentConfirmation($email_benh_nhan, $benhnhan['ho_ten'], $token);
            }

            return [
                'status' => 'pending',
                'message' => 'Lịch hẹn đã được tạo. Vui lòng kiểm tra email để xác nhận.',
                'ma_lich_hen' => $ma_lich_hen
            ];
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Lỗi khi đặt lịch: " . $e->getMessage());
        }
    }

    /**
     * 🟡 Xác nhận lịch qua email
     */
    public function xacNhanQuaEmail($token)
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM lichhen 
            WHERE xac_nhan_token = ? AND trang_thai = 'CHO_XAC_NHAN'
        ");
        $stmt->execute([$token]);
        $lich = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$lich) {
            throw new Exception("Liên kết xác nhận không hợp lệ hoặc lịch hẹn đã được xác nhận.");
        }

        $this->conn->beginTransaction();
        try {
            // ✅ Cập nhật trạng thái lịch
            $this->conn->prepare("
                UPDATE lichhen 
                SET trang_thai = 'DA_XAC_NHAN', 
                    email_xac_nhan_at = NOW()
                WHERE ma_lich_hen = ?
            ")->execute([$lich['ma_lich_hen']]);

            // ✅ Đánh dấu lịch trống tương ứng là đã đặt
            $this->conn->prepare("
                UPDATE lichtrong 
                SET trang_thai = 'DA_DAT'
                WHERE ma_bac_si = ? 
                  AND thoi_gian_bat_dau <= ? 
                  AND thoi_gian_ket_thuc > ?
            ")->execute([$lich['ma_bac_si'], $lich['thoi_gian'], $lich['thoi_gian']]);

            $this->conn->commit();

            return ['status' => 'success', 'message' => 'Lịch hẹn đã được xác nhận qua email.'];
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Lỗi khi xác nhận lịch: " . $e->getMessage());
        }
    }

    /**
     * 🔴 Hủy lịch
     */
    public function huyLich($ma_lich_hen)
    {
        $this->conn->beginTransaction();
        try {
            $stmt = $this->conn->prepare("SELECT * FROM lichhen WHERE ma_lich_hen = ?");
            $stmt->execute([$ma_lich_hen]);
            $lich = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$lich) {
                throw new Exception("Không tìm thấy lịch hẹn.");
            }

            $this->conn->prepare("UPDATE lichhen SET trang_thai = 'DA_HUY' WHERE ma_lich_hen = ?")
                ->execute([$ma_lich_hen]);

            $this->conn->prepare("
                UPDATE lichtrong 
                SET trang_thai = 'TRONG'
                WHERE ma_bac_si = ? 
                  AND thoi_gian_bat_dau <= ? 
                  AND thoi_gian_ket_thuc > ?
            ")->execute([$lich['ma_bac_si'], $lich['thoi_gian'], $lich['thoi_gian']]);

            $this->conn->commit();

            return ['status' => 'success', 'message' => 'Đã hủy lịch thành công.'];
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Lỗi khi hủy lịch: " . $e->getMessage());
        }
    }

    /**
     * 🔹 Lấy danh sách lịch hẹn theo bệnh nhân
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

    /**
     * 🔵 Bác sĩ hoặc admin xác nhận thủ công
     */
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
