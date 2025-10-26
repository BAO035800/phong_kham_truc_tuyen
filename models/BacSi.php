<?php
require_once __DIR__ . '/../config/Database.php';

class BacSi
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // 🟢 Lấy tất cả bác sĩ
    public function all()
    {
        return $this->db->query("SELECT * FROM bacsi ORDER BY ma_bac_si DESC")->fetchAll();
    }

    // 🟢 Lấy thông tin 1 bác sĩ
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM bacsi WHERE ma_bac_si = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 🟢 Thêm bác sĩ mới
    public function create($data)
    {
        $sql = "INSERT INTO bacsi (ma_nguoi_dung, ma_chuyen_khoa, ma_chi_nhanh, ho_ten, trinh_do, kinh_nghiem, mo_ta)
                VALUES (:userId, :ck, :cn, :ho_ten, :trinh_do, :kn, :mo_ta)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':userId' => $data['ma_nguoi_dung'],
            ':ck' => $data['ma_chuyen_khoa'] ?? null,
            ':cn' => $data['ma_chi_nhanh'] ?? null,
            ':ho_ten' => $data['ho_ten'],
            ':trinh_do' => $data['trinh_do'] ?? null,
            ':kn' => $data['kinh_nghiem'] ?? null,
            ':mo_ta' => $data['mo_ta'] ?? null
        ]);
        return (int) $this->db->lastInsertId();
    }

    // 🟡 Cập nhật thông tin bác sĩ
    public function update($id, $data)
    {
        $sql = "UPDATE bacsi 
                SET ho_ten = :ho_ten,
                    trinh_do = :trinh_do,
                    kinh_nghiem = :kn,
                    mo_ta = :mo_ta
                WHERE ma_bac_si = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':ho_ten' => $data['ho_ten'] ?? '',
            ':trinh_do' => $data['trinh_do'] ?? '',
            ':kn' => $data['kinh_nghiem'] ?? 0,
            ':mo_ta' => $data['mo_ta'] ?? '',
            ':id' => $id
        ]);
    }

    // 🔴 Xóa bác sĩ
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM bacsi WHERE ma_bac_si = ?");
        return $stmt->execute([$id]);
    }

    // 🟢 Lấy tất cả (dùng ở API công khai)
    public function getTatCaBacSi()
    {
        $stmt = $this->db->prepare("SELECT ma_bac_si, ho_ten, ma_chuyen_khoa FROM bacsi");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 🟢 Lọc theo chuyên khoa
    public function getByChuyenKhoa($ma_chuyen_khoa)
    {
        $stmt = $this->db->prepare("SELECT * FROM bacsi WHERE ma_chuyen_khoa = ?");
        $stmt->execute([$ma_chuyen_khoa]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
