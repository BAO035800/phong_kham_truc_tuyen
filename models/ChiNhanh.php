<?php
require_once __DIR__ . '/../config/Database.php';

class ChiNhanh
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy tất cả chi nhánh
    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM chinhanh ORDER BY ma_chi_nhanh DESC");
        return $stmt->fetchAll();
    }

    // 🟢 Lấy 1 chi nhánh
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM chinhanh WHERE ma_chi_nhanh = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // 🟡 Thêm chi nhánh (ADMIN)
    public function create($data): int
    {
        $sql = "INSERT INTO chinhanh (ten_chi_nhanh, dia_chi, so_dien_thoai)
                VALUES (:ten, :dia_chi, :sdt)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_chi_nhanh'],
            ':dia_chi' => $data['dia_chi'] ?? null,
            ':sdt' => $data['so_dien_thoai'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    // 🟠 Cập nhật chi nhánh (ADMIN)
    public function update($id, $data): bool
    {
        $sql = "UPDATE chinhanh 
                SET ten_chi_nhanh = :ten,
                    dia_chi = :dia_chi,
                    so_dien_thoai = :sdt
                WHERE ma_chi_nhanh = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_chi_nhanh'] ?? null,
            ':dia_chi' => $data['dia_chi'] ?? null,
            ':sdt' => $data['so_dien_thoai'] ?? null,
            ':id' => $id
        ]);
    }

    // 🔴 Xóa chi nhánh (ADMIN)
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM chinhanh WHERE ma_chi_nhanh = ?");
        return $stmt->execute([$id]);
    }
}
