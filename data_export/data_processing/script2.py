file = open('班级信息未整理格式1.html', 'r', encoding='utf-8')
lines = file.readlines()
results1 = []
for line in lines:
    department = line[19:21]
    class_number = line[27:34]
    class_info = line[27:][:-10]
    results.append((department, class_number, class_info))
file.close()

file = open('班级信息未整理格式2.html', 'r', encoding='utf-8')
lines = file.readlines()
results2 = []
for line in lines:
    department = line[19:21]
    class_number = line[-17:-10]
    class_info = line[27:][:-10]
    results.append((department, class_number, class_info))
file.close()

# results 是一个元组的列表
# 格式为 [ ('07', '2014209', '2014209会计学'),('07', '2014210', '2014210会计学')]
results = results1 + results2

for result in results:
    print('<option department="' + result[0] + '" value="' + result[1] + '">' + result[2] + '</option>')
# 输出格式为 <option department="08" value="2013157">2013157计算机</option>
