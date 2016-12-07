#文档类型为两列，一列键，一列值，中间以制表符分隔
import sys

file_name = sys.argv[1]
with open( file_name, 'r', encoding='utf-8') as data:

    lines = data.readlines()

    results = []
    for line in lines:
        results.append(line.replace('\n', '').split('\t'))
