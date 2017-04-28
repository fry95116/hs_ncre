/**
 * Created by tastycarb on 2017/4/20.
 */
$(document).ready(function(){
    var $root = $('#examPlan');

    //考点 & 科目设置
    var cache_examSites = [];                 //数据对象
    var currentExamSite = null;     //当前选择的考点
    
    var $examSiteTable = $('.examSites table',$root);
    var $subjectTable = $('.subjects table',$root);

    var formatter_text = function(val,col,index){
        var url = '/admin/testArrange/examPlan/examSites/' + col.code + '/' + this.field;
        return '<a class="edit" data-url="' + url + '" ' +
                'data-type="text" ' +
                'data-pk = "' + col.code + '" ' +
                'data-name = "' + this.field + '" ' +
                'data-type="text" ' +
                'data-value="' + val + '"></a>';
    };


    $examSiteTable.bootstrapTable({
        cardView:true,
        onCheck:function(row, $el){
            refresh_subjectTable(row.code);
        },
        columns: [{
            radio:true
        },{
            field: 'code',
            title: '考点代码',
            formatter:formatter_text
        }, {
            field: 'name',
            title: '考点名称',
            formatter:formatter_text

        }, {
            formatter: function(value, row, index){
                return '<a href="javascript:void(0)" class="delete" key="' + row.code + '">删除</a>';
            }
        }]
    });
    $subjectTable.bootstrapTable({
        columns: [{
            field: 'code',
            sortable:true,
            title: '考点代码'
        }, {
            field: 'name',
            title: '考点名称'
        }, {
            field: 'duration',
            title: '考试时间(分钟)'
        }, {
            formatter: function(value, row, index){
                return '<a href="javascript:void(0)" class="delete" key="' + row.code + '">删除</a>';
            }
        }]
    });

    /* 刷新考点列表 */
    function refresh_ExamSiteTable(){
        $examSiteTable.bootstrapTable('load',_.map(cache_examSites,function(e){
            return _.pick(e,['code','name']);
        }));
        //删除按钮
        $examSiteTable.find('a.delete').click(function(){
            var key = $(this).attr('key');
            myDialog.confirm('确认删除？',function(res){
                if(res.state === 'ok') $.ajax({
                    url:'/admin/testArrange/examPlan/examSites/' + key,
                    type:'delete',
                    success:function(){
                        updateCache();
                        myDialog.alert('删除成功');
                    }
                });
            })
        });
        //编辑框
        $examSiteTable.find('a.edit').on('save', function(e, params) {
            updateCache();
        }).editable({
            ajaxOptions: {
                type: 'PUT'
            }
        });
    }

    /* 刷新科目列表 */
    function refresh_subjectTable(exam_site_code){
        var examSiteInfo = _.find(cache_examSites,function(e){
            return e.code == exam_site_code;
        });
        if((!_.isUndefined(examSiteInfo)) && (!_.isUndefined(examSiteInfo.subjects))){
            currentExamSite = exam_site_code;
            $subjectTable.bootstrapTable('load',examSiteInfo.subjects);
            //删除按钮
            $subjectTable.find('a.delete').click(function(){
                var key = $(this).attr('key');
                myDialog.confirm('确认删除？',function(res){
                    if(res.state === 'ok') $.ajax({
                        url:'/admin/testArrange/examPlan/examSites/' + currentExamSite + '/subjects/' + key,

                        type:'delete',
                        success:function(){
                            updateCache();
                            myDialog.alert('删除成功');
                        }
                    });
                })
            });
        }
        else{
            $subjectTable.bootstrapTable('removeAll');
        }
    }

    /* 更新缓存，刷新UI */
    function updateCache(){
        $.getJSON('/admin/testArrange/examPlan/examSites',function(data){
            cache_examSites = data;
            refresh_ExamSiteTable();
            refresh_subjectTable(currentExamSite);
        });
    }



    //初始化
    updateCache();


    /* 添加考点对话框 */
    var template_addSite =
        '<form>' +
            '<div class="form-group msg"></div>'+
            '<div class="form-group">' +
                '<label>考点代码：</label>' +
                '<input name="code" type="text" class="form-control" placeholder="考点代码" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>名称：</label>' +
                '<input name="name" type="text" class="form-control" placeholder="名称" required>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary">添加</button>' +
        '</form>';

    $('.addSite').click(function(){
        myDialog.dialog({
            title:'添加考点',
            okBtn:false,
            cancelBtn:false,
            msg:template_addSite,
            init:function($modal,re){
                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/examPlan/examSites',
                    type:'post',
                    success:function(){
                        currentExamSite = null;
                        updateCache();
                        $modal.modal('hide');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.msg'),'danger',xhr.responseText);
                    }
                });
            }
        });
    });

    /* 添加科目对话框 */
    var template_addSubject =
        '<form>' +
            '<div class="form-group"><div class="msg"></div></div>' +
            '<div class="form-group">' +
                '<label>代码：</label>' +
                '<input name="code" type="text" class="form-control" placeholder="代码" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>名称：</label>' +
                '<input name="name" type="text" class="form-control" placeholder="名称" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>考试时间：</label>' +
                '<input name="duration" type="text" class="form-control" placeholder="考试时间" required>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary">添加</button>' +
        '</form>';

    $('.addSubject').click(function(){
        myDialog.dialog({
            title:'添加科目',
            okBtn:false,
            cancelBtn:false,
            msg:template_addSubject,
            init:function($modal,re){
                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/examPlan/examSites/' + currentExamSite + '/subjects',
                    type:'post',
                    beforeSubmit:function(){
                        if(_.isNull(currentExamSite)){
                            showMsg($modal.find('.msg'),'danger','请先选择考点');
                            return false;
                        }
                        return true;
                    },
                    success:function(){
                        updateCache();
                        $modal.modal('hide');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.msg'),'danger',xhr.responseText);
                    }
                });
            }
        });
    });
});