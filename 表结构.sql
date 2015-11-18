/*
Navicat MySQL Data Transfer

Source Server         : MariaDB
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : test

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2015-07-25 11:48:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for data
-- ----------------------------
DROP TABLE IF EXISTS `data`;
CREATE TABLE `data` (
  `exam_site_code` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sex` varchar(6) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `id_type` tinyint(4) NOT NULL,
  `id_number` varchar(255) NOT NULL,
  `nationality` tinyint(4) NOT NULL,
  `career` tinyint(4) NOT NULL,
  `degree_of_education` tinyint(4) NOT NULL,
  `training_type` tinyint(4) NOT NULL,
  `subject_code` tinyint(4) NOT NULL,
  `post_code` varchar(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_type`,`id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
