<?php
require_once __DIR__ . '/../config/Database.php';

class Phong
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM phong ORDER BY ma_phong DESC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM phong WHERE ma_phong = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data): int
    {
        $sql = "INSERT INTO phong (ten_phong, mo_ta) VALUES (:ten, :mo_ta)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_phong'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update($id, $data): bool
    {
        $sql = "UPDATE phong SET 
                    ten_phong = COALESCE(:ten, ten_phong),
                    mo_ta = COALESCE(:mo_ta, mo_ta)
                WHERE ma_phong = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_phong'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null,
            ':id' => $id
        ]);
    }

    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM phong WHERE ma_phong = ?");
        return $stmt->execute([$id]);
    }
}
