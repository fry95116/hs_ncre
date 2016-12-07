#文档类型为两列，一列键，一列值，中间以制表符分隔
import sys

file_path = sys.argv[1]
with open( path, 'r', encoding='utf-8') as data:

    lines = data.readlines()

    results = []
    for line in lines:
        results.append(line.replace('\n', '').split('\t'))

    # 从 result中生成需要的数据格式
    for result in results:
        print('<option value="' + result[0] + '">' + result[1] + '</option>')
