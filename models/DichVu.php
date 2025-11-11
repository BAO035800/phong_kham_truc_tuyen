<?php
require_once __DIR__ . '/../config/Database.php';

class DichVu
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy tất cả dịch vụ (kèm mô tả và chuyên khoa)
    public function all(): array
    {
        $sql = "SELECT d.*, c.ten_chuyen_khoa
                FROM dichvu d
                LEFT JOIN chuyenkhoa c ON d.ma_chuyen_khoa = c.ma_chuyen_khoa
                ORDER BY d.ma_dich_vu DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 🟢 Lấy 1 dịch vụ
    public function find($id)
    {
        $sql = "SELECT d.*, c.ten_chuyen_khoa
                FROM dichvu d
                LEFT JOIN chuyenkhoa c ON d.ma_chuyen_khoa = c.ma_chuyen_khoa
                WHERE d.ma_dich_vu = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 🟡 Thêm dịch vụ
    public function create($data): int
    {
        $sql = "INSERT INTO dichvu (ten_dich_vu, mo_ta, gia_dich_vu, ma_chuyen_khoa)
                VALUES (:ten, :mo_ta, :gia, :ma_chuyen_khoa)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_dich_vu'],
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':gia' => $data['gia_dich_vu'] ?? 0,
            ':ma_chuyen_khoa' => $data['ma_chuyen_khoa'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    // 🟠 Cập nhật dịch vụ
    public function update($id, $data): bool
    {
        $sql = "UPDATE dichvu SET 
                    ten_dich_vu = :ten,
                    mo_ta = :mo_ta,
                    gia_dich_vu = :gia,
                    ma_chuyen_khoa = :ma_chuyen_khoa
                WHERE ma_dich_vu = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_dich_vu'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':gia' => $data['gia_dich_vu'] ?? 0,
            ':ma_chuyen_khoa' => $data['ma_chuyen_khoa'] ?? null,
            ':id' => $id
        ]);
    }

    // 🔴 Xóa dịch vụ
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM dichvu WHERE ma_dich_vu = ?");
        return $stmt->execute([$id]);
    }
}
