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

    public function register($data)
    {
        $email = $data['email'] ?? null;
        $username = $data['ten_dang_nhap'] ?? null;
        $mat_khau = $data['mat_khau'] ?? null;

        if (!$email || !$username || !$mat_khau) {
            throw new Exception("Thiếu thông tin bắt buộc.");
        }

        $exists = $this->nguoiDung->findByEmail($email);
        if ($exists) throw new Exception("Email đã tồn tại.");

        $id = $this->nguoiDung->create($data);
        return $id;
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
