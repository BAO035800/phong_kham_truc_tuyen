<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5500");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (isset($_SESSION['user'])) {
    echo json_encode([
        'logged_in' => true,
        'user' => $_SESSION['user']
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
