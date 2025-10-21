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


    public function createBenhNhan($data): int
    {
        try {
            $this->db->beginTransaction();

            // 🔹 1. Thêm người dùng
            $sqlUser = "INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro)
                    VALUES (:ten, :email, :mat_khau, :vai_tro)";
            $stmtUser = $this->db->prepare($sqlUser);
            $stmtUser->execute([
                ':ten'       => $data['ten_dang_nhap'],
                ':email'     => $data['email'],
                ':mat_khau'  => password_hash($data['mat_khau'], PASSWORD_BCRYPT),
                ':vai_tro'   => $data['vai_tro'] ?? 'BENHNHAN'
            ]);

            $userId = (int)$this->db->lastInsertId();

            // 🔹 2. Thêm thông tin bệnh nhân gắn luôn với người dùng vừa tạo
            $sqlPatient = "INSERT INTO benhnhan (ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, email, dia_chi, ma_nguoi_dung)
                       VALUES (:ho_ten, :ngay_sinh, :gioi_tinh, :so_dien_thoai, :email, :dia_chi, :ma_nguoi_dung)";
            $stmtPatient = $this->db->prepare($sqlPatient);
            $stmtPatient->execute([
                ':ho_ten'        => $data['ho_ten'] ?? '',
                ':ngay_sinh'     => $data['ngay_sinh'] ?? null,
                ':gioi_tinh'     => $data['gioi_tinh'] ?? 'Khác',
                ':so_dien_thoai' => $data['so_dien_thoai'] ?? '',
                ':email'         => $data['email'] ?? '',
                ':dia_chi'       => $data['dia_chi'] ?? '',
                ':ma_nguoi_dung' => $userId
            ]);

            $this->db->commit();
            return $userId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw new Exception("Lỗi khi tạo người dùng và bệnh nhân: " . $e->getMessage());
        }
    }

    public function createBacSi($data): int
    {
        try {
            $this->db->beginTransaction();

            // 🔹 1. Tạo người dùng
            $sqlUser = "INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro)
                    VALUES (:ten, :email, :mat_khau, :vai_tro)";
            $stmtUser = $this->db->prepare($sqlUser);
            $stmtUser->execute([
                ':ten'       => $data['ten_dang_nhap'],
                ':email'     => $data['email'],
                ':mat_khau'  => password_hash($data['mat_khau'], PASSWORD_BCRYPT),
                ':vai_tro'   => $data['vai_tro'] ?? 'BACSI'
            ]);

            $userId = (int)$this->db->lastInsertId();

            // 🔹 2. Tạo thông tin bệnh nhân (luôn chèn)
            // 🔹 2. Tạo thông tin bác sĩ
            $sqlDoctor = "INSERT INTO bacsi (ma_nguoi_dung, ma_chuyen_khoa, ma_chi_nhanh, ho_ten, trinh_do, kinh_nghiem, mo_ta)
               VALUES (:ma_nguoi_dung, :ma_chuyen_khoa, :ma_chi_nhanh, :ho_ten, :trinh_do, :kinh_nghiem, :mo_ta)";
            $stmtDoctor = $this->db->prepare($sqlDoctor);
            $stmtDoctor->execute([
                ':ma_nguoi_dung' => $userId,
                ':ma_chuyen_khoa' => $data['ma_chuyen_khoa'] ?? null,
                ':ma_chi_nhanh' => $data['ma_chi_nhanh'] ?? null,
                ':ho_ten' => $data['ho_ten'] ?? '',
                ':trinh_do' => $data['trinh_do'] ?? '',
                ':kinh_nghiem' => $data['kinh_nghiem'] ?? 0,
                ':mo_ta' => $data['mo_ta'] ?? ''
            ]);


            $this->db->commit();
            return $userId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw new Exception("Lỗi khi tạo người dùng, bệnh nhân và bác sĩ: " . $e->getMessage());
        }
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
