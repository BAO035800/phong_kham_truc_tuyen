<?php
require_once __DIR__ . '/../config/Database.php';

class BaiViet
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy danh sách bài viết
    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM baiviet ORDER BY ngay_dang DESC");
        return $stmt->fetchAll();
    }

    // 🟢 Lấy 1 bài viết
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM baiviet WHERE ma_bai_viet = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // 🟡 Thêm bài viết
    public function create($data): int
    {
        $sql = "INSERT INTO baiviet (ma_nguoi_dung, tieu_de, noi_dung, ngay_dang)
                VALUES (:user, :tieu_de, :noi_dung, NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user' => $data['ma_nguoi_dung'],
            ':tieu_de' => $data['tieu_de'],
            ':noi_dung' => $data['noi_dung']
        ]);
        return (int)$this->db->lastInsertId();
    }

    // 🟠 Cập nhật bài viết
    public function update($id, $data): bool
    {
        $sql = "UPDATE baiviet 
                SET tieu_de = :tieu_de, noi_dung = :noi_dung 
                WHERE ma_bai_viet = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':tieu_de' => $data['tieu_de'] ?? null,
            ':noi_dung' => $data['noi_dung'] ?? null,
            ':id' => $id
        ]);
    }

    // 🔴 Xóa bài viết
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM baiviet WHERE ma_bai_viet = ?");
        return $stmt->execute([$id]);
    }
}
