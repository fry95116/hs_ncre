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
mapping_school = {
    '01': '其他学校或工作单位',
    '02': '郑州大学',
    '03': '河南工业大学',
    '04': '河南农业大学',
    '05': '河南财经政法大学',
    '06': '铁道警察学院',
    '07': '郑州轻工业学院',
    '08': '中原工学院',
    '09': '河南牧业经济学院',
    '10': '河南中医学院',
    '11': '郑州航空工业管理学院',
    '12': '河南工程学院',
    '13': '河南警察学院',
    '14': '黄河科技学院',
    '15': '郑州科技学院',
    '16': '郑州华信学院',
    '17': '郑州师范学院',
    '18': '郑州成功财经学院',
    '19': '郑州升达经贸管理学院',
    '20': '河南财政税务高等专科学校',
    '21': '郑州电力高等专科学校',
    '22': '郑州幼儿师范高等专科学校',
    '23': '河南医学高等专科学校',
    '24': '郑州澍青医学高等专科学校',
    '25': '河南职业技术学院',
    '26': '郑州铁路职业技术学院',
    '27': '中州大学',
    '28': '河南水利与环境职业学院',
    '29': '河南信息统计职业学院',
    '30': '郑州电力职业技术学院',
    '31': '河南建筑职业技术学院',
    '32': '郑州城市职业学院',
    '33': '郑州理工职业学院',
    '34': '郑州信息工程职业学院',
    '35': '河南艺术职业学院',
    '37': '河南机电职业学院',
    '38': '郑州商贸旅游职业学院',
    '39': '郑州黄河护理职业学院',
    '40': '郑州财税金融职业学院',
    '41': '河南司法警官职业学院',
    '42': '郑州经贸职业学院',
    '43': '郑州交通职业学院',
    '44': '河南检察职业学院',
    '45': '郑州信息科技职业学院',
    '46': '郑州电子信息职业技术学院',
    '47': '嵩山少林武术职业学院',
    '48': '郑州工业安全职业学院',
    '49': '河南经贸职业学院',
    '50': '河南交通职业技术学院',
    '51': '河南农业职业学院',
    '52': '郑州旅游职业学院',
    '53': '郑州职业技术学院',
    '54': '河南工业贸易职业学院'
 }
# 遍历所有数据并写入 xlsx 文件
row = 0
for result in results:
    exam_site_code = result['exam_site_code']   #必填
    name = result['name']   #必填
    sex = mapping_sex[result['sex']]    # 必填
    birthday = result['birthday']   # 必填
    id_type = result['id_type'] # 必填
    id_number = result['id_number'] # 必填
    nationality = result['nationality'] # 必填
    career = result['career']   # 必填
    degree_of_education = result['degree_of_education'] # 必填
    training_type = result['training_type'] # 必填
    subject_code = result['subject_code']   # 必填
    phone = result['phone'] # 必填

    address = result['address']
    post_code = result['post_code']
    email = result['email']
    # remark
    if('is_our_school' in result.keys()):
        remark = result['department'] + '-' + result['class'] + '-' + result['student_number']
    else:
        remark = mapping_school[result['school']]
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
