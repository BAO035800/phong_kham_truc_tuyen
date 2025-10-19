<?php
require_once __DIR__ . '/../config/Database.php';

class DichVu
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM dichvu ORDER BY ma_dich_vu DESC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM dichvu WHERE ma_dich_vu = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data): int
    {
        $sql = "INSERT INTO dichvu (ten_dich_vu, mo_ta, gia_dich_vu)
                VALUES (:ten, :mo_ta, :gia)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_dich_vu'],
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':gia' => $data['gia_dich_vu'] ?? 0
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update($id, $data): bool
    {
        $sql = "UPDATE dichvu SET 
                    ten_dich_vu = :ten,
                    mo_ta = :mo_ta,
                    gia_dich_vu = :gia
                WHERE ma_dich_vu = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_dich_vu'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':gia' => $data['gia_dich_vu'] ?? 0,
            ':id' => $id
        ]);
    }

    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM dichvu WHERE ma_dich_vu = ?");
        return $stmt->execute([$id]);
    }
}
