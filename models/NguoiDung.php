<?php
require_once __DIR__ . '/../config/Database.php';

class NguoiDung
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM nguoidung ORDER BY ma_nguoi_dung DESC");
        return $stmt->fetchAll();
    }

    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM nguoidung WHERE ma_nguoi_dung = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM nguoidung WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findByUsernameOrEmail($identifier)
    {
        $stmt = $this->db->prepare("
        SELECT * FROM nguoidung 
        WHERE ten_dang_nhap = :username OR email = :email 
        LIMIT 1
    ");
        $stmt->execute([
            ':username' => $identifier,
            ':email' => $identifier
        ]);
        return $stmt->fetch();
    }


    public function create($data): int
    {
        $sql = "INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro)
                VALUES (:ten, :email, :mat_khau, :vai_tro)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':ten' => $data['ten_dang_nhap'],
            ':email' => $data['email'],
            ':mat_khau' => password_hash($data['mat_khau'], PASSWORD_BCRYPT),
            ':vai_tro' => $data['vai_tro'] ?? 'BENHNHAN'
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update($id, $data): bool
    {
        $sql = "UPDATE nguoidung SET 
                ten_dang_nhap = COALESCE(:ten, ten_dang_nhap),
                email = COALESCE(:email, email),
                vai_tro = COALESCE(:vai_tro, vai_tro)
                WHERE ma_nguoi_dung = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_dang_nhap'] ?? null,
            ':email' => $data['email'] ?? null,
            ':vai_tro' => $data['vai_tro'] ?? null,
            ':id' => $id
        ]);
    }

    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM nguoidung WHERE ma_nguoi_dung = ?");
        return $stmt->execute([$id]);
    }
}
