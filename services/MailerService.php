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
            // ⚙️ Cấu hình SMTP Gmail
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'nguyentue14102005@gmail.com'; // ✅ Gmail thật
            $mail->Password = 'pspa fkdm jnfj djwv';      // ✅ App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            // 📨 Người gửi & người nhận
            $mail->setFrom('Thang10072005@gmail.com', 'Phòng Khám Trực Tuyến'); // ✅ Sửa lại ở đây
            // $mail->setFrom('youremail@gmail.com', 'Phòng Khám Trực Tuyến');
            $mail->addAddress($to, $name);
            $mail->isHTML(true);

            // ✅ Đường dẫn xác nhận
            $confirmUrl = "http://localhost:5500/view/index.html#/confirm?token={$token}";

            // 📧 Nội dung
            $mail->Subject = "Xác nhận lịch hẹn tại Phòng Khám Trực Tuyến";
            $mail->Body = "
                <h3>Xin chào {$name},</h3>
                <p>Bạn vừa đặt lịch khám tại <b>Phòng Khám Trực Tuyến</b>.</p>
                <p>Vui lòng nhấn vào liên kết bên dưới để xác nhận lịch hẹn:</p>
                <p><a href='{$confirmUrl}' target='_blank' style='color:#1d4ed8;'>Xác nhận lịch hẹn</a></p>
                <p>Liên kết có hiệu lực trong 30 phút.</p>
                <hr>
                <p style='font-size:13px;color:#777'>Nếu bạn không yêu cầu đặt lịch, vui lòng bỏ qua email này.</p>
            ";

            // 🧠 Log debug
            error_log("📤 Đang gửi mail tới: $to");
            $mail->send();
            error_log("✅ Đã gửi mail thành công tới: $to");

            return true;
        } catch (Exception $e) {
            error_log("❌ Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}
