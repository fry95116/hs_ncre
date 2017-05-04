CREATE TABLE `enterinfo` (
	`exam_site_code` VARCHAR(12) NOT NULL,
	`subject_code` VARCHAR(4) NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`sex` VARCHAR(50) NOT NULL,
	`birthday` VARCHAR(8) NOT NULL,
	`id_type` VARCHAR(4) NOT NULL,
	`id_number` VARCHAR(25) NOT NULL,
	`nationality` VARCHAR(4) NOT NULL,
	`career` VARCHAR(4) NOT NULL,
	`degree_of_education` VARCHAR(4) NOT NULL,
	`training_type` VARCHAR(4) NOT NULL,
	`post_code` VARCHAR(11) NULL DEFAULT NULL,
	`address` VARCHAR(255) NULL DEFAULT NULL,
	`email` VARCHAR(255) NOT NULL,
	`phone` VARCHAR(11) NULL DEFAULT NULL,
	`remark` VARCHAR(255) NULL DEFAULT NULL,
	`create_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	`latest_revise_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`revise_count` TINYINT(4) NOT NULL DEFAULT '-1',
	PRIMARY KEY (`id_number`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

CREATE TABLE `score` (
	`id_number` VARCHAR(25) NOT NULL,
	`examinee_number` VARCHAR(25) NOT NULL,
	`enter_number` VARCHAR(25) NOT NULL,
	`name` VARCHAR(20) NOT NULL,
	`score` FLOAT NOT NULL,
	`rank` TINYINT(4) NOT NULL,
	`certificate_number` VARCHAR(20) NOT NULL DEFAULT ''
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;
