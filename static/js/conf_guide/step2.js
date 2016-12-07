$(document).ready(function () {
    var subjects = {};

    t1 = $('.exam_site').TS_DataGrid([
        { key: 'code', title: '考点代码', type: 'num' },
        { key: 'name', title: '考点名称', type: 'text' }
    ]);
    
    t2 = $('.subject').TS_DataGrid([
        { key: 'code', title: '科目代码', type: 'num' },
        { key: 'name', title: '科目名称', type: 'text' }
    ]);
    
    //添加与删除行的按钮
    $('.newline:eq(0)').click(function () {t1.append();});
    $('.delline:eq(0)').click(function () { 
        t1.delete($('.exam_site').find('.focus').index() - 1);
    });

    $('.newline:eq(1)').click(function () {t2.append();});
    $('.delline:eq(1)').click(function () {
        t2.delete($('.subject').find('.focus').index() - 1);
    });
    
    //t1,t2的联动
    t1.onRowBlur = function ($el_row, row) {
        var id = $el_row.attr('tsdg_id');
        if (typeof subjects[id] != 'undefined') {
            subjects[id] = t2.getData();
        }
    };
    t1.onRowFocus = function ($el_row, row) {
        var id = $el_row.attr('tsdg_id');
        if (typeof subjects[id] != 'undefined') {
            t2.setData(subjects[id]);
        }
    };
    t1.onRowAppend = function ($el_row, row) {
        var id = $el_row.attr('tsdg_id');
        subjects[id] = [];
    };
    t1.onRowDeleted = function ($el_row, row) {
        var id = $el_row.attr('tsdg_id');
        delete subjects[id];
    };

    //提交操作
    $('input[type=submit]').click(function() {
        var exam_sites = t1.getData();
        for (var index in exam_sites) {
            exam_sites[index].subjects = subjects[exam_sites[index].__id__];
            for (var index2 in exam_sites[index].subjects) { 
                delete exam_sites[index].subjects[index2].__id__;
            }
            delete exam_sites[index].__id__;
        }
        console.log(exam_sites);
    });
    
});