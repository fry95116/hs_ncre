import pyexcel
import pyexcel_xlsx
import pymysql.cursors


mapping_sex = {
    '男': 'male',
    '女': 'famale'
}

connection = pymysql.connect(
    host='localhost',
    user='root',
    passwd='lishenzhi1214',
    db='test',
    port=3306,
    charset='utf8',
    cursorclass = pymysql.cursors.DictCursor)


records = pyexcel.get_records(file_name="ImportTemplate.xlsx",name_columns_by_row=0)

for record in records:
    if(record['考点代码']):
        # 有的行会是空的，将其跳过
        data = (int(record['考点代码']), record['考生姓名'], mapping_sex[record['性别']], record['出生日期'], int(record['证件类型']), record['证件号'], int(record['民族']), int(record['职业']), int(record['文化程度']), int(record['培训类型']), int(record['考试科目代码']), record['邮编'], record['地址'], record['电子邮件'], record['联系电话'], record['备注'])
        with connection.cursor() as cursor:
            sql = "INSERT INTO `data` (`exam_site_code`, `name`,`sex`, `birthday`, `id_type`, `id_number`, `nationality`, `career`, `degree_of_education`, `training_type`, `subject_code`, `post_code`, `address`, `email`, `phone`, `remark`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            data_test = (410084, '试一试试一试', 'male', '19810419', 1, '440100197907057371', 1, 30, 1, 1, 29, '', '', '', '13298309816', '水利201315502')
            print(data_test)
            print(data)
            cursor.execute(sql, data)
            connection.commit()


connection.close()