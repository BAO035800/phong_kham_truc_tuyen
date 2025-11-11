<?php
require_once __DIR__ . '/../config/Database.php';

class ChuyenKhoa
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy tất cả chuyên khoa
    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM chuyenkhoa ORDER BY ma_chuyen_khoa DESC");
        return $stmt->fetchAll();
    }

    // 🟢 Lấy 1 chuyên khoa
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM chuyenkhoa WHERE ma_chuyen_khoa = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // 🟡 Thêm chuyên khoa
  public function create($data): int
    {
        $sql = "INSERT INTO chuyenkhoa (ten_chuyen_khoa, mo_ta)
                VALUES (:ten, :mo_ta)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_chuyen_khoa'],
            ':mo_ta' => $data['mo_ta'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }



    // 🟠 Cập nhật chuyên khoa
    public function update($id, $data): bool
    {
        $sql = "UPDATE chuyenkhoa SET 
                    ten_chuyen_khoa = :ten,
                    mo_ta = :mo_ta
                WHERE ma_chuyen_khoa = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_chuyen_khoa'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':id' => $id
        ]);
    }

    // 🔴 Xóa chuyên khoa
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM chuyenkhoa WHERE ma_chuyen_khoa = ?");
        return $stmt->execute([$id]);
    }
}
