# 生成随机字符串
import random
from random import Random
def random_str(randomlength=8):
    str = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str+=chars[random.randint(0, length)]
    return str
def random_num(randomlength=8):
    str = ''
    chars = '0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str+=chars[random.randint(0, length)]
    return str

import requests

payload = {
    'address': str(random_str(6)),
    'birthday': str(random_num(8)),
    'career': str(random.randrange(1, 99)),
    'degree_of_education': str(random.randrange(1, 8)),
    'email': str(random_str(10)),
    'exam_site_code': '1',
    'id_number': str(random_num(18)),
    'id_type': str(random.randrange(1, 5)),
    'name': str(random_str(3)),
    'nationality': str(random.randrange(1, 98)),
    'phone': str(random_num(11)),
    'post_code': str(random_num(6)),
    'remark': str(random_num(9)),
    'sex': 'male',
    'subject_code': '1',
    'submit_form': '提交',
    'training_type': '1'
 }
not_200_count = 0
for i in range(100000):
    r = requests.post('http://192.168.199.81:8080/submit', data = payload)
    print(r.text)
    if(r.status_code != 200):
        not_200_count += 1
