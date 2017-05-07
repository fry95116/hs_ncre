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
        clickToSelect:true,
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
            title: '科目代码'
        }, {
            field: 'name',
            title: '科目名称'
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
            $examSiteTable.bootstrapTable('check',0);
        });
    }



    //初始化
    updateCache();

    $('.examSitesAndSubjects .refresh',$root).click(updateCache);

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

    $('.addSite',$root).click(function(){
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

    $('.addSubject',$root).click(function(){
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

    /** 人数限制规则 */
    var $limitRulesTable = $('.limitRules table',$root);
    $limitRulesTable.bootstrapTable({
        url:'/admin/testArrange/examPlan/limitRules',
        detailView:true,
        detailFormatter:function(index, row, element){
            //return JSON.stringify(row);
            var template =
                '<div class="container-fluid">' +
                    '<div class="row">' +
                        '<div class="col-xs-12"><label>描述：</label><span>'+ row.desc +'</span></div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-xs-12"><label>限制人数：</label><span>小于 <b>'+ row.limitNum +'</b> 人</span></div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-xs-12">' +
                            '<label>限制科目(以下科目人数相加)：</label>' +
                            '<ul></ul>' +
                        '</div>' +
                    '</div>';

            element.html(template);

            var rulesContent = element.find('.col-xs-12:eq(2)>ul');
            _.each(row.limit_obj,function(el){
                //考点名称
                var examSite = _.find(cache_examSites,function(el2){return el2.code == el.exam_site_code;});
                var str = '' + examSite.name;
                //科目名称
                if(el.subject_code){
                    var subject = _.find(examSite.subjects,function(el2){return el2.code == el.subject_code;});
                    str += ' 的<br> ' + subject.name;
                }
                else str += ' 的<br> 所有科目';
                rulesContent.append('<li>' + str + '</li>');
            });

            return '';

        },
        onPostBody:function(data){
            $limitRulesTable.find('a.delete').click(function(){
                var key = $(this).attr('key');
                myDialog.confirm('确认删除？',function(res){
                    if(res.state === 'ok') $.ajax({
                        url:'/admin/testArrange/examPlan/limitRules/' + key,
                        type:'delete',
                        success:function(){
                            $limitRulesTable.bootstrapTable('refresh');
                            myDialog.alert('删除成功');
                        }
                    });
                })
            });
        },
        columns: [{
            field: 'desc',
            title: '规则描述'
        }, {
            field: 'limitNum',
            title: '限制人数'

        }, {
            formatter: function(value, row, index){
                return '<a href="javascript:void(0)" class="delete" key="' + index + '">删除</a>';
            }
        }]
    });

    $('.limitRules .refresh',$root).click(function(){
        $limitRulesTable.bootstrapTable('refresh')
    });


    /** 添加人数限制规则对话框 */
    var template_addLimitRule =
        '<form class="container-fluid">' +
            '<div class="row"><div class="col-xs-12 msg"></div></div>' +
            '<div class="row">' +
                '<div class="col-xs-12">' +
                    '<div class="form-group">' +
                        '<label>规则描述：</label>' +
                        '<input name="desc" type="text" class="form-control" required>' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label>限制人数：</label>' +
                        '<input name="limitNum" type="number" class="form-control" min="0" required>' +
                    '</div>' +
                    '<input name="limit_obj" type="hidden">'+
                '</div>' +
            '</div>'+

            '<div class="row">' +
                '<div class="col-xs-12 form-group">' +
                    '<label>限制科目(以下科目人数相加)：</label>' +
                    '<table></table>' +
                '</div>' +
            '</div>' +
            //添加限制科目
            '<div class="row">' +
                '<div class="col-xs-12 form-group">' +
                    '<label>添加限制科目</label>' +
                    '<div class="form-horizontal">' +
                        '<div class="form-group">' +
                            '<label for="exam_site_code" class="col-sm-2 control-label">考点</label>' +
                            '<div class="col-sm-10">' +
                                '<select class="exam_site_code form-control"></select>' +
                            '</div>'+
                        '</div>'+
                        '<div class="form-group">' +
                            '<label for="subject_code" class="col-sm-2 control-label">科目</label>' +
                            '<div class="col-sm-10">' +
                                '<select class="subject_code form-control" ></select>' +
                            '</div>'+
                        '</div>' +
                        '<div class="form-group">' +
                            '<div class="col-sm-offset-2 col-sm-10">'+
                                '<button class="addLimitObj btn btn-primary" type="button">添加限制科目</button>'+
                            '</div>' +
                        '</div>'+
                    '</div>'+
                '</div>' +
            '</div>'+

            '<button type="submit" class="btn btn-block btn-primary">添加</button>' +
        '</form>';

    $('.limitRules .addLimitRule').click(function(){
        myDialog.dialog({
            title:'添加人数限制规则',
            okBtn:false,
            cancelBtn:false,
            msg:template_addLimitRule,
            init:function($modal,re){
                //表格
                var $table = $modal.find('table');
                $table.bootstrapTable({
                    onPostBody:function(data){
                        $table.find('a.delete').click(function(){
                            var i = $(this).attr('key');
                            $table.bootstrapTable('load',_.reject($table.bootstrapTable('getData'), function(value,index){
                                return index == i;
                            }));
                        });
                    },
                    columns: [{
                        field: 'exam_site_code',
                        title: '考点',
                        formatter: function(value, row, index){
                            var examSite = _.find(cache_examSites,function(el){return el.code == value;});
                            return examSite ? examSite.name : '未知代码：' + value;
                        }
                    }, {
                        field: 'subject_code',
                        title: '科目',
                        formatter: function(value, row, index){
                            if(value == 0) return '所有科目';
                            else{
                                var examSite = _.find(cache_examSites,function(el){return el.code == row.exam_site_code;});
                                if(examSite.subjects){
                                    var subject = _.find(examSite.subjects,function(el){return el.code == value;});
                                    return subject ? subject.name : '未知代码：' + value;
                                }
                                else return '未知代码：' + value;
                            }
                        }
                    }, {
                        formatter: function(value, row, index){
                            return '<a href="javascript:void(0)" class="delete" key="' + index + '">删除</a>';
                        }
                    }]
                });

                //添加限制科目
                var $select_esc = $modal.find('select.exam_site_code');
                var $select_sc = $modal.find('select.subject_code');
                $select_esc.html(
                    _.reduce(cache_examSites,function(memo,el){
                        return memo + '<option value="' + el.code + '">' + el.name + '</option>';
                    },'')
                ).change(function(){
                    var code = $(this).val();
                    var examSite = _.find(cache_examSites,function(el){
                        return el.code == code;
                    });
                    if(examSite){
                        $select_sc.html(
                            _.reduce(examSite.subjects,function(memo,el){
                                return memo + '<option value="' + el.code + '">' + el.name + '</option>';
                            },'<option value="0">所有科目</option>')
                        );
                    }
                }).trigger('change');

                $modal.find('.addLimitObj').click(function(){
                    var data = {
                        exam_site_code:$select_esc.val(),
                        subject_code:$select_sc.val()
                    };
                    var i = _.findIndex($table.bootstrapTable('getData'),function(el){
                        return (el.exam_site_code == data.exam_site_code && el.subject_code == data.subject_code)
                            || (el.exam_site_code == data.exam_site_code && el.subject_code == 0) ;
                    });

                    if(i == -1) $table.bootstrapTable('append',data);
                });

                //提交事件
                $modal.find('.addLimitRule').click(function(){
                    $modal.find('form').submit();
                });
                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/examPlan/limitRules/',
                    type:'post',
                    beforeSerialize:function(){
                        var data = $table.bootstrapTable('getData');
                        if(data.length == 0){
                            showMsg($modal.find('.msg'),'danger','限制科目不能为空');
                            return false;
                        }
                        else{
                            $modal.find('input[name="limit_obj"]').val(JSON.stringify(_.map(data,function(el){
                                if(el.subject_code == 0) delete el.subject_code;
                                return el;
                            })));
                            return true;
                        }
                    },
                    success:function(){
                        $limitRulesTable.bootstrapTable('refresh');
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