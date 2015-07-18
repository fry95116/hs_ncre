CREATE TABLE `data` (
`exam_site_code`  int(11) NOT NULL ,
`name`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL ,
`sex`  tinyint(4) NOT NULL ,
`birthday`  date NOT NULL ,
`id_type`  tinyint(4) NOT NULL ,
`id_number`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL ,
`nationality`  tinyint(4) NOT NULL ,
`career`  tinyint(4) NOT NULL ,
`degree_of_education`  tinyint(4) NOT NULL ,
`training_type`  tinyint(4) NOT NULL ,
`subject_code`  tinyint(4) NOT NULL ,
`post_code`  int(11) NULL DEFAULT NULL ,
`address`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL ,
`email`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL ,
`phone`  int(11) NULL DEFAULT NULL ,
`remark`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL ,
PRIMARY KEY (`id_type`, `id_number`)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8 COLLATE=utf8_general_ci
ROW_FORMAT=COMPACT
;
