<?php
class Database
{
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO
    {
        if (self::$pdo === null) {
            $cfg = parse_ini_file(__DIR__ . '/config.properties');
            if (!$cfg) {
                throw new Exception("❌ Không thể đọc file cấu hình database.");
            }

            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=%s",
                $cfg['db_host'] ?? '127.0.0.1',
                $cfg['db_name'] ?? 'phongkham',
                $cfg['db_charset'] ?? 'utf8mb4'
            );

            try {
                self::$pdo = new PDO(
                    $dsn,
                    $cfg['db_user'] ?? 'root',
                    $cfg['db_pass'] ?? '',
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new Exception("❌ Lỗi kết nối Database: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}
