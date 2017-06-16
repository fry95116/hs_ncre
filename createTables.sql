-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        10.1.22-MariaDB - mariadb.org binary distribution
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- 导出  表 test.enterinfo 结构
CREATE TABLE IF NOT EXISTS `enterinfo` (
  `exam_site_code` varchar(12) NOT NULL,
  `subject_code` varchar(4) NOT NULL,
  `name` varchar(50) NOT NULL,
  `sex` varchar(50) NOT NULL,
  `birthday` varchar(8) NOT NULL,
  `id_type` varchar(4) NOT NULL,
  `id_number` varchar(25) NOT NULL,
  `nationality` varchar(4) NOT NULL,
  `career` varchar(4) NOT NULL,
  `degree_of_education` varchar(4) NOT NULL,
  `training_type` varchar(4) NOT NULL,
  `post_code` varchar(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `latest_revise_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `revise_count` tinyint(4) NOT NULL DEFAULT '-1',
  PRIMARY KEY (`id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。
-- 导出  表 test.photo 结构
CREATE TABLE IF NOT EXISTS `photo` (
  `id_number` varchar(25) NOT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。
-- 导出  表 test.score 结构
CREATE TABLE IF NOT EXISTS `score` (
  `id_number` varchar(25) NOT NULL,
  `examinee_number` varchar(25) NOT NULL,
  `enter_number` varchar(25) NOT NULL,
  `name` varchar(20) NOT NULL,
  `score` float NOT NULL,
  `rank` tinyint(4) NOT NULL,
  `certificate_number` varchar(20) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。
-- 导出  表 test.testinfo 结构
CREATE TABLE IF NOT EXISTS `testinfo` (
  `id_number` varchar(25) NOT NULL,
  `examinee_number` varchar(25) DEFAULT NULL,
  `enter_number` varchar(25) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `testRoom_number` varchar(5) NOT NULL,
  `batch_number` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 数据导出被取消选择。
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
