<?php
require_once __DIR__ . '/../config/Database.php';

class NguoiDung
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /* 🟢 Lấy tất cả người dùng */
    public function all(): array
    {
        $stmt = $this->db->query("
            SELECT ma_nguoi_dung, ten_dang_nhap, email, vai_tro, ngay_tao 
            FROM nguoidung 
            ORDER BY ma_nguoi_dung DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* 🟢 Lấy người dùng theo ID */
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM nguoidung WHERE ma_nguoi_dung = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* 🟢 Tìm người dùng theo email */
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM nguoidung WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* 🟢 Tìm người dùng theo username hoặc email */
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
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* 🩺 Tạo tài khoản BỆNH NHÂN */
    public function createBenhNhan($data): int
    {
        try {
            $this->db->beginTransaction();

            // 1️⃣ Tạo người dùng
            $sqlUser = "
                INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro)
                VALUES (:ten, :email, :mat_khau, :vai_tro)
            ";
            $stmtUser = $this->db->prepare($sqlUser);
            $stmtUser->execute([
                ':ten'      => $data['ten_dang_nhap'] ?? ($data['email'] ? explode('@', $data['email'])[0] : 'user_' . time()),
                ':email'    => $data['email'],
                ':mat_khau' => password_hash($data['mat_khau'] ?? $data['password'], PASSWORD_BCRYPT),
                ':vai_tro'  => $data['vai_tro'] ?? 'BENHNHAN'
            ]);

            $userId = (int)$this->db->lastInsertId();

            // 2️⃣ Tạo thông tin bệnh nhân
            $sqlPatient = "
                INSERT INTO benhnhan 
                (ho_ten, ngay_sinh, gioi_tinh, loai_benh_nhan, so_dien_thoai, email, dia_chi, ma_nguoi_dung)
                VALUES 
                (:ho_ten, :ngay_sinh, :gioi_tinh, :loai_benh_nhan, :so_dien_thoai, :email, :dia_chi, :ma_nguoi_dung)
            ";
            $stmtPatient = $this->db->prepare($sqlPatient);
            $stmtPatient->execute([
                ':ho_ten'         => $data['ho_ten'] ?? '',
                ':ngay_sinh'      => $data['ngay_sinh'] ?? null,
                ':gioi_tinh'      => $data['gioi_tinh'] ?? 'Khác',
                ':loai_benh_nhan' => $data['loai_benh_nhan'] ?? 'MOI',
                ':so_dien_thoai'  => $data['so_dien_thoai'] ?? '',
                ':email'          => $data['email'] ?? '',
                ':dia_chi'        => $data['dia_chi'] ?? '',
                ':ma_nguoi_dung'  => $userId
            ]);

            $this->db->commit();
            return $userId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw new Exception("Lỗi khi tạo người dùng & bệnh nhân: " . $e->getMessage());
        }
    }

    /* 👨‍⚕️ Tạo tài khoản BÁC SĨ */
    public function createBacSi($data): int
{
    try {
        $this->db->beginTransaction();

        // 1️⃣ Tạo người dùng (bảng nguoidung)
        $sqlUser = "
            INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro)
            VALUES (:ten, :email, :mat_khau, :vai_tro)
        ";
        $stmtUser = $this->db->prepare($sqlUser);
        $stmtUser->execute([
            ':ten'      => $data['ten_dang_nhap'] ?? ($data['email'] ? explode('@', $data['email'])[0] : 'bacsi_' . time()),
            ':email'    => $data['email'],
            ':mat_khau' => password_hash($data['mat_khau'] ?? $data['password'], PASSWORD_BCRYPT),
            ':vai_tro'  => $data['vai_tro'] ?? 'BACSI'
        ]);

        $userId = (int)$this->db->lastInsertId();

        // 2️⃣ Tạo bác sĩ (bảng bacsi)
        $sqlDoctor = "
            INSERT INTO bacsi (
                ma_nguoi_dung, 
                ma_chuyen_khoa, 
                ho_ten, 
                trinh_do, 
                kinh_nghiem, 
                mo_ta
            ) 
            VALUES (
                :ma_nguoi_dung, 
                :ma_chuyen_khoa, 
                :ho_ten, 
                :trinh_do, 
                :kinh_nghiem, 
                :mo_ta
            )
        ";
        $stmtDoctor = $this->db->prepare($sqlDoctor);
        $stmtDoctor->execute([
            ':ma_nguoi_dung'  => $userId,
            ':ma_chuyen_khoa' => $data['ma_chuyen_khoa'],
            ':ho_ten'         => $data['ho_ten'],
            ':trinh_do'       => $data['trinh_do'] ?? null,
            ':kinh_nghiem'    => $data['kinh_nghiem'] ?? null,
            ':mo_ta'          => $data['mo_ta'] ?? null
        ]);

        $this->db->commit();
        return $userId;
    } catch (Exception $e) {
        $this->db->rollBack();
        throw new Exception("Lỗi khi tạo người dùng & bác sĩ: " . $e->getMessage());
    }
}


    /* 🧱 Tạo tài khoản ADMIN */
    public function createAdmin($data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro, ngay_tao)
            VALUES (:ten, :email, :mk, 'ADMIN', NOW())
        ");
        $stmt->execute([
            ':ten' => $data['ten_dang_nhap'] ?? ($data['email'] ? explode('@', $data['email'])[0] : 'admin_' . time()),
            ':email' => $data['email'],
            ':mk' => password_hash($data['mat_khau'] ?? $data['password'], PASSWORD_DEFAULT)
        ]);
        return (int)$this->db->lastInsertId();
    }

    /* 🟡 Cập nhật thông tin hoặc đổi mật khẩu */
    public function update($id, $data): bool
    {
        if (!empty($data['mat_khau']) || !empty($data['password'])) {
            $hashed = password_hash($data['mat_khau'] ?? $data['password'], PASSWORD_BCRYPT);
            $stmt = $this->db->prepare("
                UPDATE nguoidung SET mat_khau = :mk WHERE ma_nguoi_dung = :id
            ");
            return $stmt->execute([
                ':mk' => $hashed,
                ':id' => $id
            ]);
        }

        $sql = "
            UPDATE nguoidung SET 
                ten_dang_nhap = COALESCE(:ten, ten_dang_nhap),
                email = COALESCE(:email, email),
                vai_tro = COALESCE(:vai_tro, vai_tro)
            WHERE ma_nguoi_dung = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ten' => $data['ten_dang_nhap'] ?? null,
            ':email' => $data['email'] ?? null,
            ':vai_tro' => $data['vai_tro'] ?? null,
            ':id' => $id
        ]);
    }

    /* 🔴 Xóa người dùng */
    public function delete($id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM nguoidung WHERE ma_nguoi_dung = ?");
        return $stmt->execute([$id]);
    }

    /* 🧩 Dành cho trường hợp tạo user đơn giản (ví dụ admin thêm tài khoản) */
    public function createSimpleUser($data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO nguoidung (ten_dang_nhap, email, mat_khau, vai_tro, ngay_tao)
            VALUES (:ten, :email, :mk, :role, NOW())
        ");
        $stmt->execute([
            ':ten' => $data['ten_dang_nhap'] ?? ($data['email'] ? explode('@', $data['email'])[0] : 'user_' . time()),
            ':email' => $data['email'],
            ':mk' => password_hash($data['mat_khau'] ?? $data['password'], PASSWORD_BCRYPT),
            ':role' => strtoupper($data['vai_tro'] ?? 'BENHNHAN')
        ]);
        return (int)$this->db->lastInsertId();
    }
}
