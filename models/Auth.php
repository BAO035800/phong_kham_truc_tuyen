<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/NguoiDung.php';

class Auth
{
    private NguoiDung $nguoiDung;

    public function __construct()
    {
        $this->nguoiDung = new NguoiDung();
        session_start();
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
                'ma_chi_nhanh'    => $data['ma_chi_nhanh'] ?? null,
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



    public function login($data)
    {
        $identifier = $data['identifier'] ?? null;
        $mat_khau = $data['mat_khau'] ?? null;

        if (!$identifier || !$mat_khau) {
            throw new Exception("Vui lòng nhập tên đăng nhập/email và mật khẩu.");
        }

        $user = $this->nguoiDung->findByUsernameOrEmail($identifier);

        if (!$user || !password_verify($mat_khau, $user['mat_khau'])) {
            throw new Exception("Tên đăng nhập/email hoặc mật khẩu không đúng.");
        }

        $_SESSION['user'] = [
            'id' => $user['ma_nguoi_dung'],
            'ten_dang_nhap' => $user['ten_dang_nhap'],
            'email' => $user['email'],
            'vai_tro' => $user['vai_tro']
        ];

        return $_SESSION['user'];
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
