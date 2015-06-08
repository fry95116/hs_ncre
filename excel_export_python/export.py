from pymongo import *
# 获取所有数据

#con = Connection('192.168.199.81:27017')
con = Connection()
db = con['data']
results = db.mytest.find()


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
    exam_site_code = result['exam_site_code']
    address = result['address']
    name = result['name']
    sex = mapping_sex[result['sex']]
    birthday = result['birthday']
    id_type = result['id_type']
    id_number = result['id_number']
    nationality = result['nationality']
    career = result['career']
    degree_of_education = result['degree_of_education']
    training_type = result['training_type']
    subject_code = result['subject_code']
    post_code = result['post_code']
    address = result['address']
    email = result['email']
    phone = result['phone']
    remark = result['remark']
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
    worksheet.write_string(row, 14, post_code)
    worksheet.write_string(row, 15, address)
    worksheet.write_string(row, 16, email)
    worksheet.write_string(row, 17, phone)
    worksheet.write_string(row, 19, remark)
    row = row + 1

workbook.close()
