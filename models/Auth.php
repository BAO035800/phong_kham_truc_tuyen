<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/NguoiDung.php';

class Auth
{
    private NguoiDung $nguoiDung;
    private PDO $conn;   
    public function __construct()
    {
        // ✅ Khởi tạo kết nối CSDL
        $db = new Database();
        $this->conn = $db->getConnection();  // <--- dòng quan trọng nhất

        // ✅ Khởi tạo model NguoiDung
        $this->nguoiDung = new NguoiDung();

        // ✅ Bắt đầu session nếu chưa có
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function registerBenhNhan($data)
    {
        // 🔹 Lấy các giá trị đầu vào
        $email = $data['email'] ?? null;
        $username = $data['ten_dang_nhap'] ?? null;
        $mat_khau = $data['mat_khau'] ?? null;

        // 🔹 Kiểm tra thông tin bắt buộc
        if (!$email || !$username || !$mat_khau) {
            throw new Exception("Thiếu thông tin bắt buộc (tên đăng nhập, email, mật khẩu).");
        }

        // 🔹 Kiểm tra email đã tồn tại chưa
        $exists = $this->nguoiDung->findByEmail($email);
        if ($exists) {
            throw new Exception("Email đã tồn tại trong hệ thống.");
        }

        // 🔹 Tạo người dùng + bệnh nhân đồng thời
        try {
            $userId = $this->nguoiDung->createBenhNhan([
                'ten_dang_nhap'   => $data['ten_dang_nhap'],
                'email'           => $data['email'],
                'mat_khau'        => $data['mat_khau'],
                'vai_tro'         => $data['vai_tro'] ?? 'BENHNHAN',
                'ho_ten'          => $data['ho_ten'] ?? '',
                'ngay_sinh'       => $data['ngay_sinh'] ?? null,
                'gioi_tinh'       => $data['gioi_tinh'] ?? 'Khác',
                'so_dien_thoai'   => $data['so_dien_thoai'] ?? '',
                'dia_chi'         => $data['dia_chi'] ?? '',
            ]);

            return [
                'status'  => 'success',
                'message' => 'Đăng ký tài khoản thành công.',
                'user_id' => $userId
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi đăng ký tài khoản: " . $e->getMessage());
        }
    }

    public function registerBacSi($data)
    {
        // 🔹 Lấy giá trị đầu vào
        $email = $data['email'] ?? null;
        $username = $data['ten_dang_nhap'] ?? null;
        $mat_khau = $data['mat_khau'] ?? null;

        // 🔹 Kiểm tra thông tin bắt buộc
        if (!$email || !$username || !$mat_khau) {
            throw new Exception("Thiếu thông tin bắt buộc (tên đăng nhập, email, mật khẩu).");
        }

        // 🔹 Kiểm tra email đã tồn tại chưa
        $exists = $this->nguoiDung->findByEmail($email);
        if ($exists) {
            throw new Exception("Email đã tồn tại trong hệ thống.");
        }

        // 🔹 Tạo người dùng + bệnh nhân + bác sĩ đồng thời
        try {
            $userId = $this->nguoiDung->createBacSi([
                'ten_dang_nhap'   => $data['ten_dang_nhap'],
                'email'           => $data['email'],
                'mat_khau'        => $data['mat_khau'],
                'vai_tro'         => $data['vai_tro'] ?? 'BACSI',
                'ho_ten'          => $data['ho_ten'] ?? '',
                'ngay_sinh'       => $data['ngay_sinh'] ?? null,
                'gioi_tinh'       => $data['gioi_tinh'] ?? 'Khác',
                'so_dien_thoai'   => $data['so_dien_thoai'] ?? '',
                'dia_chi'         => $data['dia_chi'] ?? '',
                'ma_chuyen_khoa'  => $data['ma_chuyen_khoa'] ?? null,
                'trinh_do'        => $data['trinh_do'] ?? '',
                'kinh_nghiem'     => $data['kinh_nghiem'] ?? 0,
                'mo_ta'           => $data['mo_ta'] ?? ''
            ]);

            return [
                'status'  => 'success',
                'message' => 'Đăng ký tài khoản bác sĩ thành công.',
                'user_id' => $userId
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi đăng ký bác sĩ: " . $e->getMessage());
        }
    }



    public function login($data) {
    $email = $data['email'] ?? '';
    $password = $data['mat_khau'] ?? '';

    $stmt = $this->conn->prepare("SELECT * FROM nguoidung WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("Email không tồn tại.");
    }

    if (!password_verify($password, $user['mat_khau'])) {
        throw new Exception("Mật khẩu không đúng.");
    }

    // ✅ Trả về dữ liệu người dùng để controller dùng
    return $user;
}



    public function logout()
    {
        session_unset();
        session_destroy();
        return true;
    }

    public function currentUser()
    {
        return $_SESSION['user'] ?? null;
    }
}
