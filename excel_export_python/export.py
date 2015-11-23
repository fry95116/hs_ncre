import pymysql.cursors


connection = pymysql.connect(
    host='localhost',
    user='root',
    passwd='lishenzhi1214',
    db='test',
    port=3306,
    charset='utf8',
    cursorclass = pymysql.cursors.DictCursor)

with connection.cursor() as cursor:
    sql = "SELECT * FROM `data`"
    cursor.execute(sql)
    results = cursor.fetchall()


    import xlsxwriter

    workbook = xlsxwriter.Workbook('export_test_1.xlsx')
    worksheet = workbook.add_worksheet()
    mapping_sex = {
        'male': '男',
        'famale': '女'
    }

    # 遍历所有数据并写入 xlsx 文件
    row = 0
    for result in results:
        exam_site_code = str(result['exam_site_code'])  #必填
        name = result['name']   #必填
        sex = mapping_sex[result['sex']]    # 必填
        birthday = result['birthday']   # 必填
        id_type = str(result['id_type']) # 必填
        id_number = result['id_number'] # 必填
        nationality = str(result['nationality']) # 必填
        career = str(result['career'])   # 必填
        degree_of_education = str(result['degree_of_education']) # 必填
        training_type = str(result['training_type']) # 必填
        subject_code = str(result['subject_code'])   # 必填
        phone = result['phone'] # 必填
        remark = result['remark']   # 必填，数据库中的remark就是最终需要的

        address = result['address'] # 非必填
        post_code = result['post_code'] # 非必填
        email = result['email'] # 非必填

        # 对每一行 row 写入当前的 result 对象的值
        worksheet.write_string(row, 0, exam_site_code) # --------------------
        worksheet.write_string(row, 3, name)
        worksheet.write_string(row, 4, sex)
        worksheet.write_string(row, 5, birthday)
        worksheet.write_string(row, 6, id_type)
        worksheet.write_string(row, 7, id_number)
        worksheet.write_string(row, 8, nationality)
        worksheet.write_string(row, 9, career)
        worksheet.write_string(row, 10, degree_of_education)
        worksheet.write_string(row, 11, training_type)
        worksheet.write_string(row, 12, subject_code)
        worksheet.write_string(row, 17, phone)
        worksheet.write_string(row, 19, remark)

        # 非必填项
        if(address):
            worksheet.write_string(row, 15, address)
        if(post_code):
            worksheet.write_string(row, 14, post_code)
        if(email):
            worksheet.write_string(row, 16, email)


        row = row + 1

    workbook.close()
