$(document).ready(function () {
    var data = JSON.parse($('#exam_sites').text());
    //exam_site
    var exam_sites = [{ val: '', text: '所有考点' }];
    var subjects = {'':'<option>所有科目</option>'};

    for (var i in data) {
        var t = data[i]
        exam_sites.push({ val: t.code, text: t.name });
        subjects[t.code] = '<option>所有科目</option>';
        for (var j in t.subjects) { 
            subjects[t.code] += '<option value="' + t.subjects[j].code + '">' + t.subjects[j].name + '</option>';
        }

    }

    t1 = $('.limit_roles').TS_DataGrid([
        { key: 'name', title: '名称', type: 'text' },
        {
            key: 'exam_site', 
            title: '考点限制', 
            type: 'sel', 
            condidate: exam_sites
        },
        {
            key: 'subject', 
            title: '科目限制', 
            type: 'sel' , 
            condidate: [{ text: '所有科目' }]
        },
        { key: 'exam_site', title: '限报人数', type: 'num' }
    ]);
    
    t1.onCeilChanged = function ($ceil, row, col) {
        if (col == 1) { 
            t1.getCeil(row, 2).children('select').html(subjects[$ceil.children('select').val()]);
        }
    }

    //添加与删除行的按钮
    $('.newline:eq(0)').click(function () { t1.append(); });
    $('.delline:eq(0)').click(function () {
        t1.delete($('.limit_roles').find('.focus').index() - 1);
    });
    
});