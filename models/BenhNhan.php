<?php
require_once __DIR__ . '/../config/Database.php';

class BenhNhan
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy tất cả bệnh nhân + loại (mới/cũ)
    public function all(): array
    {
        $sql = "
            SELECT 
                b.*, 
                CASE 
                    WHEN COUNT(l.ma_lich_hen) > 0 THEN 'CU' 
                    ELSE 'MOI' 
                END AS loai_benh_nhan
            FROM benhnhan b
            LEFT JOIN lichhen l 
                ON b.ma_benh_nhan = l.ma_benh_nhan 
                AND l.trang_thai = 'HOAN_THANH'
            GROUP BY b.ma_benh_nhan
            ORDER BY b.ma_benh_nhan DESC
        ";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 🟢 Lấy chi tiết bệnh nhân theo ID + loại
    public function find($id)
    {
        $sql = "
            SELECT 
                b.*, 
                CASE 
                    WHEN COUNT(l.ma_lich_hen) > 0 THEN 'CU' 
                    ELSE 'MOI' 
                END AS loai_benh_nhan
            FROM benhnhan b
            LEFT JOIN lichhen l 
                ON b.ma_benh_nhan = l.ma_benh_nhan 
                AND l.trang_thai = 'HOAN_THANH'
            WHERE b.ma_benh_nhan = :id
            GROUP BY b.ma_benh_nhan
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 🟢 Thêm bệnh nhân mới
    public function create($data): int
    {
        $sql = "
            INSERT INTO benhnhan (ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, email, dia_chi, ma_nguoi_dung)
            VALUES (:ho_ten, :ngay_sinh, :gioi_tinh, :sdt, :email, :dia_chi, :userId)
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ho_ten' => $data['ho_ten'],
            ':ngay_sinh' => $data['ngay_sinh'] ?? null,
            ':gioi_tinh' => $data['gioi_tinh'] ?? 'Khác',
            ':sdt' => $data['so_dien_thoai'] ?? null,
            ':email' => $data['email'] ?? null,
            ':dia_chi' => $data['dia_chi'] ?? null,
            ':userId' => $data['ma_nguoi_dung'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    // 🟡 Cập nhật thông tin bệnh nhân
    public function update($id, $data): bool
    {
        $sql = "
            UPDATE benhnhan 
            SET 
                ho_ten = :ho_ten,
                ngay_sinh = :ngay_sinh,
                gioi_tinh = :gioi_tinh,
                so_dien_thoai = :sdt,
                email = :email,
                dia_chi = :dia_chi
            WHERE ma_benh_nhan = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ho_ten' => $data['ho_ten'] ?? null,
            ':ngay_sinh' => $data['ngay_sinh'] ?? null,
            ':gioi_tinh' => $data['gioi_tinh'] ?? null,
            ':sdt' => $data['so_dien_thoai'] ?? null,
            ':email' => $data['email'] ?? null,
            ':dia_chi' => $data['dia_chi'] ?? null,
            ':id' => $id
        ]);
    }

    // 🔴 Xóa bệnh nhân
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM benhnhan WHERE ma_benh_nhan = ?");
        return $stmt->execute([$id]);
    }
}
