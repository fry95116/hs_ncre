mapping_department = {
  '01': '资环',
  '02': '水利',
  '03': '土木',
  '04': '机械',
  '05': '电力',
  '06': '环工',
  '07': '管经',
  '08': '信工',
  '09': '外语',
  '10': '数信',
  '11': '法学',
  '43': '国教',
  '45': '建筑',
  '49': '软件'
}

# 直接取键值对是没有顺序的，用下面的表达式按照键的值排序，生成元祖的列表
results = sorted(mapping_department.items(), key=lambda mapping_department:mapping_department[0])

for result in results:
    print('<option value="' + result[0] + '">' + result[1] + '</option>')
