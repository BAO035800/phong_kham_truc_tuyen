<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

class MailerService
{
    public static function sendAppointmentConfirmation($to, $name, $token)
    {
        $mail = new PHPMailer(true);
        try {
            // ⚙️ Cấu hình SMTP
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'Thang10072005@gmail.com'; // 👈 email thật của bạn
            $mail->Password = 'gnoj kmsw evai jwer'; // 🔑 Mật khẩu ứng dụng (App Password)
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            // 📨 Người gửi / người nhận
            $mail->setFrom('youremail@gmail.com', 'Phòng Khám Trực Tuyến');
            $mail->addAddress($to, $name);
            $mail->isHTML(true);

            // ✅ Đường dẫn xác nhận đúng
            $confirmUrl = "http://localhost:5500/view/index.html#/confirm?token={$token}";

            $mail->Subject = "Xác nhận lịch hẹn của bạn tại Phòng Khám Trực Tuyến";
            $mail->Body = "
                <h3>Xin chào {$name},</h3>
                <p>Bạn vừa đặt lịch khám tại <b>Phòng Khám Trực Tuyến</b>.</p>
                <p>Vui lòng bấm vào liên kết sau để xác nhận lịch hẹn:</p>
                <p><a href='{$confirmUrl}' target='_blank'>Xác nhận lịch hẹn</a></p>
                <p>Liên kết này chỉ có hiệu lực trong 30 phút.</p>
                <hr>
                <p style='font-size:13px;color:#777'>Nếu bạn không yêu cầu đặt lịch, vui lòng bỏ qua email này.</p>
            ";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}
