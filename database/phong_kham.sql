-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: phongkham
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bacsi`
--

DROP TABLE IF EXISTS `bacsi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bacsi` (
  `ma_bac_si` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `ma_chuyen_khoa` int NOT NULL,
  `ho_ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `trinh_do` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kinh_nghiem` int DEFAULT NULL,
  `mo_ta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ma_bac_si`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  KEY `ma_chuyen_khoa` (`ma_chuyen_khoa`),
  CONSTRAINT `bacsi_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoidung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `bacsi_ibfk_2` FOREIGN KEY (`ma_chuyen_khoa`) REFERENCES `chuyenkhoa` (`ma_chuyen_khoa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bacsi`
--

LOCK TABLES `bacsi` WRITE;
/*!40000 ALTER TABLE `bacsi` DISABLE KEYS */;
INSERT INTO `bacsi` VALUES (2,5,1,'Nguyễn Văn A','Bác sĩ chuyên khoa I',10,'Chuyên khoa Tai Mũi Họng, hơn 10 năm kinh nghiệm điều trị bệnh lý tai giữa, viêm xoang và thanh quản.'),(3,15,1,'Nguyễn Văn 1','Bác sĩ chuyên khoa I',20,'Chuyên khoa Tai Mũi Họng, hơn 10 năm kinh nghiệm điều trị bệnh lý tai giữa, viêm xoang và thanh quản.'),(5,40,1,'Nguyễn Văn An','Bác sĩ chuyên khoa I',10,''),(6,41,9,'Trần Thị Minh Thu','Bác sĩ chuyên khoa I',10,'');
/*!40000 ALTER TABLE `bacsi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `baiviet`
--

DROP TABLE IF EXISTS `baiviet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baiviet` (
  `ma_bai_viet` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `tieu_de` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_dang` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_bai_viet`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  CONSTRAINT `baiviet_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoidung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baiviet`
--

LOCK TABLES `baiviet` WRITE;
/*!40000 ALTER TABLE `baiviet` DISABLE KEYS */;
/*!40000 ALTER TABLE `baiviet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benhnhan`
--

DROP TABLE IF EXISTS `benhnhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benhnhan` (
  `ma_benh_nhan` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loai_benh_nhan` enum('MOI','CU') COLLATE utf8mb4_unicode_ci DEFAULT 'MOI',
  `so_dien_thoai` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_nguoi_dung` int DEFAULT NULL,
  PRIMARY KEY (`ma_benh_nhan`),
  KEY `fk_benhnhan_nguoidung` (`ma_nguoi_dung`),
  CONSTRAINT `fk_benhnhan_nguoidung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoidung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benhnhan`
--

LOCK TABLES `benhnhan` WRITE;
/*!40000 ALTER TABLE `benhnhan` DISABLE KEYS */;
INSERT INTO `benhnhan` VALUES (12,'Nguyễn Gia Bảo',NULL,'Nam','CU',NULL,'baomoren50@gmail.com',NULL,12);
/*!40000 ALTER TABLE `benhnhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuyenkhoa`
--

DROP TABLE IF EXISTS `chuyenkhoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuyenkhoa` (
  `ma_chuyen_khoa` int NOT NULL AUTO_INCREMENT,
  `ten_chuyen_khoa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyenkhoa`
--

LOCK TABLES `chuyenkhoa` WRITE;
/*!40000 ALTER TABLE `chuyenkhoa` DISABLE KEYS */;
INSERT INTO `chuyenkhoa` VALUES (1,'Tim mạch','Khám và điều trị bệnh tim'),(3,'Tai Mũi Họng','Chẩn đoán và điều trị các bệnh về tai, mũi, họng.'),(4,'Nội tổng quát','Khám và điều trị các bệnh nội khoa thông thường.'),(5,'Da liễu','Chăm sóc và điều trị các bệnh về da.'),(6,'Sản phụ khoa','Khám thai, tư vấn sức khỏe sinh sản, điều trị phụ khoa.'),(7,'Răng hàm mặt','Khám, điều trị và thẩm mỹ răng miệng.'),(8,'Nhãn khoa','Khám và điều trị các bệnh về mắt.'),(9,'Nhi khoa','Khám và điều trị bệnh cho trẻ em.'),(10,'Thần kinh','Khám và điều trị các bệnh lý thần kinh.'),(11,'Cơ xương khớp','Điều trị các bệnh lý về xương khớp và cột sống.'),(12,'Tiêu hóa','Khám và điều trị các bệnh về dạ dày, ruột, gan, mật.');
/*!40000 ALTER TABLE `chuyenkhoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dichvu`
--

DROP TABLE IF EXISTS `dichvu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dichvu` (
  `ma_dich_vu` int NOT NULL AUTO_INCREMENT,
  `ten_dich_vu` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `gia_dich_vu` decimal(10,2) NOT NULL,
  `ma_chuyen_khoa` int DEFAULT NULL,
  PRIMARY KEY (`ma_dich_vu`),
  KEY `fk_dichvu_chuyenkhoa` (`ma_chuyen_khoa`),
  CONSTRAINT `fk_dichvu_chuyenkhoa` FOREIGN KEY (`ma_chuyen_khoa`) REFERENCES `chuyenkhoa` (`ma_chuyen_khoa`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dichvu`
--

LOCK TABLES `dichvu` WRITE;
/*!40000 ALTER TABLE `dichvu` DISABLE KEYS */;
INSERT INTO `dichvu` VALUES (1,'Khám tổng quát',NULL,200000.00,1),(9,'Khám tim mạch tổng quát','Kiểm tra sức khỏe tim mạch, đo huyết áp, điện tâm đồ, siêu âm tim.',350000.00,1),(10,'Siêu âm tim Doppler','Đánh giá hoạt động van tim và lưu lượng máu qua tim.',450000.00,1),(11,'Điện tâm đồ (ECG)','Đo hoạt động điện của tim để phát hiện rối loạn nhịp.',200000.00,1),(12,'Khám tai mũi họng tổng quát','Khám tai, mũi, họng bằng thiết bị nội soi hiện đại.',250000.00,3),(13,'Nội soi tai mũi họng','Phát hiện sớm các bệnh lý viêm xoang, viêm họng, viêm tai.',300000.00,3),(14,'Lấy ráy tai chuyên sâu','Làm sạch tai bằng thiết bị y tế an toàn.',100000.00,3),(15,'Khám sức khỏe tổng quát','Kiểm tra toàn diện tình trạng sức khỏe cơ thể.',300000.00,4),(16,'Khám định kỳ','Theo dõi và đánh giá sức khỏe định kỳ hàng năm.',250000.00,4),(17,'Khám da liễu tổng quát','Chẩn đoán và điều trị mụn, viêm da, nấm da.',220000.00,5),(18,'Điều trị mụn chuyên sâu','Áp dụng công nghệ cao để điều trị mụn và sẹo.',500000.00,5),(19,'Khám phụ khoa tổng quát','Khám và tư vấn các bệnh phụ khoa.',280000.00,6),(20,'Siêu âm thai 4D','Kiểm tra sự phát triển và hình thái thai nhi bằng công nghệ 4D.',400000.00,6),(21,'Khám răng tổng quát','Kiểm tra sức khỏe răng miệng và tư vấn điều trị.',150000.00,7),(22,'Cạo vôi răng','Làm sạch cao răng và mảng bám.',180000.00,7),(23,'Tẩy trắng răng','Sử dụng công nghệ laser để làm trắng răng an toàn.',600000.00,7),(24,'Khám mắt tổng quát','Đo thị lực, soi đáy mắt và kiểm tra tật khúc xạ.',200000.00,8),(25,'Cắt mộng thịt','Phẫu thuật nhỏ điều trị mộng thịt ở mắt.',800000.00,8),(26,'Khám nhi tổng quát','Khám sức khỏe, dinh dưỡng và phát triển cho trẻ em.',250000.00,9),(27,'Tư vấn dinh dưỡng trẻ em','Hướng dẫn chế độ dinh dưỡng và phát triển thể chất.',180000.00,9),(28,'Khám thần kinh tổng quát','Chẩn đoán các bệnh về thần kinh, đau đầu, mất ngủ.',300000.00,10),(29,'Điện não đồ (EEG)','Kiểm tra hoạt động điện của não để phát hiện rối loạn.',400000.00,10),(30,'Khám cơ xương khớp tổng quát','Chẩn đoán bệnh thoái hóa, viêm khớp, đau cột sống.',300000.00,11),(31,'Vật lý trị liệu phục hồi chức năng','Hỗ trợ phục hồi vận động sau chấn thương.',500000.00,11),(32,'Khám tiêu hóa tổng quát','Khám và điều trị các bệnh lý dạ dày, ruột, gan.',320000.00,12),(33,'Nội soi dạ dày - đại tràng',NULL,100000.00,12);
/*!40000 ALTER TABLE `dichvu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lichhen`
--

DROP TABLE IF EXISTS `lichhen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichhen` (
  `ma_lich_hen` int NOT NULL AUTO_INCREMENT,
  `ma_benh_nhan` int NOT NULL,
  `ma_bac_si` int NOT NULL,
  `ma_dich_vu` int DEFAULT NULL,
  `thoi_gian` datetime NOT NULL,
  `trang_thai` enum('CHO_XAC_NHAN_EMAIL','CHO_XAC_NHAN','DA_XAC_NHAN','HOAN_THANH','DA_HUY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'CHO_XAC_NHAN_EMAIL',
  `thoi_gian_xac_nhan` datetime DEFAULT NULL,
  `ghi_chu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `xac_nhan_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_xac_nhan_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ma_lich_hen`),
  KEY `ma_benh_nhan` (`ma_benh_nhan`),
  KEY `ma_bac_si` (`ma_bac_si`),
  KEY `ma_dich_vu` (`ma_dich_vu`),
  CONSTRAINT `lichhen_ibfk_1` FOREIGN KEY (`ma_benh_nhan`) REFERENCES `benhnhan` (`ma_benh_nhan`) ON DELETE CASCADE,
  CONSTRAINT `lichhen_ibfk_2` FOREIGN KEY (`ma_bac_si`) REFERENCES `bacsi` (`ma_bac_si`) ON DELETE CASCADE,
  CONSTRAINT `lichhen_ibfk_3` FOREIGN KEY (`ma_dich_vu`) REFERENCES `dichvu` (`ma_dich_vu`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lichhen`
--

LOCK TABLES `lichhen` WRITE;
/*!40000 ALTER TABLE `lichhen` DISABLE KEYS */;
INSERT INTO `lichhen` VALUES (29,12,3,1,'2025-10-24 08:00:00','HOAN_THANH','2025-10-26 16:01:00','','7ea2a29bb37f4ef9eabe4f8bf84abd6c5d76fb902324019781126ad986d633a1','2025-10-26 15:02:40'),(30,12,3,1,'2025-10-27 04:42:00','HOAN_THANH','2025-10-26 16:44:39','','ae9905965bdccdda3262a07a7826638dd865d736fb8b4f638093b480c625c68c','2025-10-26 16:43:28'),(31,12,3,32,'2025-10-27 04:42:00','DA_HUY','2025-10-27 13:32:41','','9ba5c9f93cfc03033ef91eb78dc23b783df490fa6e45b3d519a46ea6d0f065f4','2025-10-27 13:25:05'),(32,12,3,32,'2025-10-27 04:42:00','HOAN_THANH','2025-10-27 13:34:21','','23ed95cef444c8e022c168b1257dac3b4a23f6e933b259bb85be635e38b700e9','2025-10-27 13:34:05'),(33,12,3,32,'2025-10-27 04:42:00','DA_HUY','2025-10-27 13:35:53','','cba46f15c38db6ba20ccabf7ef3e72e7983df021d0e8dc5c88dced8c3958b7d9','2025-10-27 13:35:18'),(34,12,3,32,'2025-10-27 04:42:00','HOAN_THANH','2025-10-27 13:38:41','','195d6a378b13db5d13a70c53e6819e842366661108df4c08088271b0ee078c08','2025-10-27 13:36:51'),(35,12,3,1,'2025-10-26 04:42:00','CHO_XAC_NHAN',NULL,'','25a825d9164592da61ce2153b90b1d44474cab4e5a61bb0fdee5da2c1049a855','2025-10-27 20:23:49'),(36,12,3,1,'2025-10-27 04:42:00','HOAN_THANH','2025-10-27 20:26:06','','a3661cf2c98af8c5bba79a937bbb454bfe397d3709ead380dbeae21020ec903a','2025-10-27 20:24:54'),(37,12,3,1,'2025-10-27 04:42:00','DA_HUY','2025-10-27 20:27:33','','dcfb64f2a60c27838151de0d0b6a8ee5608338a51d5d51962ba1d4a3cc492d5d','2025-10-27 20:26:56'),(38,12,3,1,'2025-10-28 08:29:00','HOAN_THANH','2025-10-29 11:16:17','','fac504ab8c9a5c5b914a2f1fa9b2504c853f2e87b941e4518702aed45d757995','2025-10-29 11:14:09'),(39,12,3,1,'2025-10-28 08:29:00','CHO_XAC_NHAN_EMAIL',NULL,'','45d1f3f9f2992196fbc0b5dc8e360168f9309ccde1fe549bcef342060ec67f0a',NULL),(40,12,3,1,'2025-10-28 08:29:00','HOAN_THANH','2025-10-29 11:53:52','','7d8ac942e6c50de46a141d215d53c8b5aeeb635eaa17524364cf778431515769','2025-10-29 11:51:50'),(41,12,3,1,'2025-10-28 08:29:00','CHO_XAC_NHAN',NULL,'','bad8a9b0d02e16cc58b3b4ec6d959dfb25d0820be4fbc8906313828300237012','2025-10-29 11:57:38');
/*!40000 ALTER TABLE `lichhen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lichtrong`
--

DROP TABLE IF EXISTS `lichtrong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichtrong` (
  `ma_lich_trong` int NOT NULL AUTO_INCREMENT,
  `ma_bac_si` int NOT NULL,
  `thoi_gian_bat_dau` datetime NOT NULL,
  `thoi_gian_ket_thuc` datetime NOT NULL,
  `trang_thai` enum('TRONG','DA_DAT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'TRONG',
  PRIMARY KEY (`ma_lich_trong`),
  KEY `ma_bac_si` (`ma_bac_si`),
  CONSTRAINT `lichtrong_ibfk_1` FOREIGN KEY (`ma_bac_si`) REFERENCES `bacsi` (`ma_bac_si`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lichtrong`
--

LOCK TABLES `lichtrong` WRITE;
/*!40000 ALTER TABLE `lichtrong` DISABLE KEYS */;
INSERT INTO `lichtrong` VALUES (1,2,'2025-10-24 08:00:00','2025-10-24 09:00:00','TRONG'),(2,2,'2025-10-24 09:00:00','2025-10-24 10:00:00','DA_DAT'),(5,3,'2025-10-26 04:42:00','2025-10-26 16:42:00','TRONG'),(6,3,'2025-10-27 04:42:00','2025-10-27 16:42:00','TRONG'),(8,3,'2025-10-28 08:29:00','2025-10-28 20:29:00','TRONG'),(14,3,'2025-10-31 08:01:00','2025-10-31 09:30:00','TRONG');
/*!40000 ALTER TABLE `lichtrong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung` (
  `ma_nguoi_dung` int NOT NULL AUTO_INCREMENT,
  `ten_dang_nhap` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mat_khau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vai_tro` enum('ADMIN','BACSI','BENHNHAN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nguoi_dung`),
  UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

LOCK TABLES `nguoidung` WRITE;
/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES (2,'thang','thang@gmail.com','$2y$10$0DLB4gRjJDziS6yYS7FxxujJXG67rnN6X5j/aYJzwI4A.Ema4kgdS','ADMIN','2025-10-19 13:43:29'),(5,'a','dr.nguyenvana@example.com','$2y$10$7Ual2bSzyMvC5TTAuRK9.eusHtIhdcrkXYehIjEHT6qSDVg0s02Pq','BACSI','2025-10-21 15:31:10'),(12,'bao','baomoren50@gmail.com','$2y$10$P259cK1Y3LppSJadBrrEtuALQEcjJmnyqqVQfnMpJ8zLhdn2CZh4S','BENHNHAN','2025-10-25 20:28:22'),(15,'1','1@gmail.com','$2y$10$tEYtAjEBDpJ0HCUDpREoL.L.tMNYqevbZGSnCDc/EQO7Xjp3e5wEO','BACSI','2025-10-25 21:26:08'),(17,'admin','admin@gmail.com','$2y$10$EZ7ItpsrxVUezLFn3BHEV.7I0O.XvcIbjIPk2T3xHpi7Dk.XWnWLG','ADMIN','2025-10-26 19:21:26'),(40,'nguyenvanan','nguyenvanan@gmail.com','$2y$10$hWM7lKScGd/OBwqevG/F5uMxkmZN9oa4iyHZ6DdfnCGdeHf8Hteti','BACSI','2025-10-27 12:40:41'),(41,'tranminhthu','tranminhthu@gmail.com','$2y$10$EHHW6mx4gvw4RE9YpKW4ruy7ZBhGbfuZ1lkNmj/Sg0XX2ejrXBwJa','BACSI','2025-10-27 12:41:09'),(50,'dr.phamngoc','dr.phamngoc@example.com','$2y$10$EXAMPLEHASHEDPASSdoctor1','BACSI','2025-10-28 16:09:36'),(51,'dr.tranthuy','dr.tranthuy@example.com','$2y$10$EXAMPLEHASHEDPASSdoctor2','BACSI','2025-10-28 16:09:36'),(52,'dr.nguyenvanbinh','dr.nguyenvanbinh@example.com','$2y$10$EXAMPLEHASHEDPASSdoctor3','BACSI','2025-10-28 16:09:36'),(53,'dr.holethanh','dr.holethanh@example.com','$2y$10$EXAMPLEHASHEDPASSdoctor4','BACSI','2025-10-28 16:09:36'),(54,'dr.danghoang','dr.danghoang@example.com','$2y$10$EXAMPLEHASHEDPASSdoctor5','BACSI','2025-10-28 16:09:36');
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thongbao`
--

DROP TABLE IF EXISTS `thongbao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thongbao` (
  `ma_thong_bao` int NOT NULL AUTO_INCREMENT,
  `ma_benh_nhan` int NOT NULL,
  `noi_dung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_gui` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_thong_bao`),
  KEY `ma_benh_nhan` (`ma_benh_nhan`),
  CONSTRAINT `thongbao_ibfk_1` FOREIGN KEY (`ma_benh_nhan`) REFERENCES `benhnhan` (`ma_benh_nhan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thongbao`
--

LOCK TABLES `thongbao` WRITE;
/*!40000 ALTER TABLE `thongbao` DISABLE KEYS */;
/*!40000 ALTER TABLE `thongbao` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-01 15:07:11
