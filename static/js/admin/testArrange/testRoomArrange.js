/**
 * Created by tastycarb on 2017/4/20.
 */
$(document).ready(function(){
    var $root = $('#testRoomArrange');

    //考点 & 科目设置
    var cache_testRooms = [];                 //数据对象
    var currentTestRoom = null;     //当前选择的考点
    
    var $testRoomTable = $('.testRooms table',$root);
    var $batchTable = $('.batchs table',$root);


    //日期
    var formatter_date = function(val,col,index){
        return '<div class="cell">' + new Date(val).toLocaleString() + '</div>';
    };

    var formatter_text = function(val,col,index){
        var url = '/admin/testArrange/testRooms/' + col.code + '/' + this.field;
        return '<a class="edit" data-url="' + url + '" ' +
                'data-type="text" ' +
                'data-pk = "' + col.code + '" ' +
                'data-name = "' + this.field + '" ' +
                'data-type="text" ' +
                'data-value="' + val + '"></a>';
    };


    $testRoomTable.bootstrapTable({
        cardView:true,
        clickToSelect:true,
        onCheck:function(row, $el){
            refresh_batchTable(row.code);
        },
        columns: [{
            radio:true
        },{
            field: 'code',
            title: '考场号',
            formatter:formatter_text
        }, {
            field: 'location',
            title: '地点',
            formatter:formatter_text
        }, {
            formatter: function(value, row, index){
                return '<a href="javascript:void(0)" class="delete" key="' + row.code + '">删除</a>';
            }
        }]
    });
    $batchTable.bootstrapTable({
        //cardView:true,

        columns: [{
            field: 'code',
            sortable:true,
            title: '批次号'
        }, {
            field: 'startTime',
            title: '考试开始时间',
            formatter:formatter_date
        }, {
            field: 'endTime',
            title: '考试结束时间',
            formatter:formatter_date
        }, {
            formatter: function(value, row, index){
                return '<a href="javascript:void(0)" class="delete" key="' + row.code + '">删除</a>';
            }
        }]
    });

    /* 刷新考点列表 */
    function refresh_testRoomTable(){
        $testRoomTable.bootstrapTable('load',_.map(cache_testRooms,function(e){
            return _.pick(e,['code','location']);
        }));
        //删除按钮
        $testRoomTable.find('a.delete').click(function(){
            var key = $(this).attr('key');
            myDialog.confirm('确认删除？',function(res){
                if(res.state === 'ok') $.ajax({
                    url:'/admin/testArrange/testRooms/' + key,
                    type:'delete',
                    success:function(){
                        updateCache();
                        myDialog.alert('删除成功');
                    }
                });
            })
        });
        //编辑框
        $testRoomTable.find('a.edit').on('save', function(e, params) {
            updateCache();
        }).editable({
            ajaxOptions: {
                type: 'PUT'
            }
        });
    }

    /* 刷新科目列表 */
    function refresh_batchTable(testRoom_code){
        var testRoomInfo = _.find(cache_testRooms,function(e){
            return e.code == testRoom_code;
        });
        if((!_.isUndefined(testRoomInfo)) && (!_.isUndefined(testRoomInfo.batchs))){
            currentTestRoom = testRoom_code;
            $batchTable.bootstrapTable('load',testRoomInfo.batchs);
            //删除按钮
            $batchTable.find('a.delete').click(function(){
                var key = $(this).attr('key');
                myDialog.confirm('确认删除？',function(res){
                    if(res.state === 'ok') $.ajax({
                        url:'/admin/testArrange/testRooms/' + currentTestRoom + '/batchs/' + key,

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
            $batchTable.bootstrapTable('removeAll');
        }
    }

    /* 更新缓存，刷新UI */
    function updateCache(){
        $.getJSON('/admin/testArrange/testRooms',function(data){
            cache_testRooms = data;
            refresh_testRoomTable();
            refresh_batchTable(currentTestRoom);
            $testRoomTable.bootstrapTable('check',0);
        });
    }

    //初始化
    updateCache();

    $('.testRoomsAndBatchs .refresh',$root).click(updateCache);

    /* 添加考场对话框 */
    var template_addTestRoom =
        '<form>' +
            '<div class="form-group msg"></div>'+
            '<div class="form-group">' +
                '<label>考场代码：</label>' +
                '<input name="code" type="text" class="form-control" placeholder="考场代码" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>考试地点：</label>' +
                '<input name="location" type="text" class="form-control" placeholder="考试地点" required>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary">添加</button>' +
        '</form>';

    $('.addTestRoom',$root).click(function(){
        myDialog.dialog({
            title:'添加考场',
            okBtn:false,
            cancelBtn:false,
            msg:template_addTestRoom,
            init:function($modal,re){
                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/testRooms',
                    type:'post',
                    success:function(){
                        currentTestRoom = null;
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

    /* 添加批次对话框 */
    var template_addBatch =
        '<form>' +
            '<div class="form-group"><div class="msg"></div></div>' +
            '<div class="form-group">' +
                '<label>批次号：</label>' +
                '<input name="code" type="text" class="form-control" placeholder="批次号" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>考试开始时间：</label>' +
                '<input name="startTime" type="text" class="form-control" placeholder="考试开始时间" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label>考试结束时间：</label>' +
                '<input name="endTime" type="text" class="form-control" placeholder="考试开始时间" required>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary">添加</button>' +
        '</form>';

    $('.addBatch',$root).click(function(){
        myDialog.dialog({
            title:'添加科目',
            okBtn:false,
            cancelBtn:false,
            msg:template_addBatch,
            init:function($modal,re){

                //时间选择器
                var $from = $modal.find('input[name="startTime"]',$root);
                var $until = $modal.find('input[name="endTime"]',$root);

                $from.datetimepicker({
                    format:'YYYY-MM-DDTHH:mm:00ZZ',
                    showTodayButton:true,
                    defaultDate: new Date()

                }).on('dp.change',function(e){
                    if(e.date.toDate() > $until.data('DateTimePicker').date().toDate()){
                        $until.data('DateTimePicker').date(e.date.toDate());
                    }
                });

                $until.datetimepicker({
                    format:'YYYY-MM-DDTHH:mm:00ZZ',
                    showTodayButton:true,
                    defaultDate: new Date()

                }).on('dp.change',function(e){
                    if($from.data('DateTimePicker').date().toDate() > e.date.toDate()){
                        $from.data('DateTimePicker').date(e.date.toDate());
                    }
                });


                //标点
                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/testRooms/' + currentTestRoom + '/batchs',
                    type:'post',
                    beforeSubmit:function(){
                        if(_.isNull(currentTestRoom)){
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


    /** 考试信息 */

    //搜索条件按钮
    var btn_searchBy = $('.searchBy',$root);
    btn_searchBy.find("a").click(function(){
        btn_searchBy.find('.btn-text').text($(this).text());
        $('[name=searchBy]',$root).val($(this).attr('value'));
    });

    //报名信息列表
    var $toolbar = $('.toolbar',$root);
    var $testInfoTable = $('.testInfoTable',$root);

    //选择器
    var formatter_select = function(val,col,index){
        var url = '/admin/testArrange/testInfo/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;

        return '<div class="cell">' +
            '<a ' +
            'data-url="' + url + '" ' +
            'data-pk = "' + col.id_number + '" ' +
            'data-type="select" ' +
            'data-source="' + source + '" ' +
            'data-sourceCache="false" ' +
            'data-value="' + val + '"' +
            'data-emptyText="未知代码(' + val + ')"></a>' +
            '</div>';
    };

    //文本框
    var formatter_text = function(val,col,index){
        var url = '/admin/testArrange/testInfo/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;
        return  '<div class="cell">' +
            '<a data-url="' + url + '" data-pk = "' + col.id_number + '" data-type="text" data-source="' + source + '" data-value="' + val + '"></a>' +
            '</div>';
    };

    //文本
    var formatter_disable = function(val,col,index){
        return  '<div class="cell">' + val + '</div>';
    };

    $testInfoTable.bootstrapTable({
        url:'/admin/testArrange/testInfo',     //数据URL
        idField:'id_number',
        /* 翻页 */
        pagination:true,
        sidePagination:'server',
        /* 组装查询参数 */
        queryParams:function(params){

            var searchText = $('input[name="searchText"]',$toolbar).val();
            var searchBy = $('input[name="searchBy"]',$toolbar).val();
            var strictMode = false;//$('input[name="strictMode"]',$toolbar).is(':checked');
            if(searchText === '') return params;
            else{
                params.searchText = searchText;
                params.searchBy = searchBy;
                params.strictMode = strictMode;
                return params;
            }
        },
        /* x-editable */
        onPostBody:function(data){
            $testInfoTable.find('a').editable({
                mode:'inline',
                ajaxOptions: {
                    type: 'PUT'
                }
            });
        },
        columns: [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
        }, {
            field:'id_number',
            title:'证件号',
            sortable:true,
            formatter:formatter_disable
        }, {
            field:'name',
            title:'姓名',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'testRoom_number',
            title:'考试地点(考场号)',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'batch_number',
            title:'批次号',
            sortable:true,
            formatter:formatter_select
        }]
    });

    //刷新按钮
    $toolbar.find('.refresh').click(function(){
        $testInfoTable.bootstrapTable('refresh');
    });


    //搜索按钮
    $toolbar.find('.search').click(function(){
        $testInfoTable.bootstrapTable('refresh');
    });

    //删除按钮
    $toolbar.find('.delete').click(function(){

        var data_del = $testInfoTable.bootstrapTable('getSelections'); //要删除的数据
        if(data_del.length != 0){
            if(!confirm('确定删除所选信息?')) return;
            //并行删除
            var succeed = 0;
            _.each(data_del,function(row){
                $.ajax({
                    url:'/admin/testArrange/testInfo/' + row.id_number,
                    type:'delete',
                    success:function(){
                        succeed++;
                        if(succeed = data_del.length) {
                            showMsg($('.message',$root),'success','删除成功');
                            $testInfoTable.bootstrapTable('refresh');
                        }
                    },
                    error:function(){
                        console.log('删除失败:' + row.id_number);
                    }
                });
            });
        }

    });
    //删除全部按钮
    $toolbar.find('.deleteAll').click(function(){
        if(prompt('确定删除所有信息?输入"确认删除"以确认。','') !== '确认删除'){
            return;
        }
        //删除
        $.ajax({
            url:'/admin/testArrange/testInfo',
            type:'delete',
            success:function(){
                showMsg($('.message',$root),'success','删除成功');
                $testInfoTable.bootstrapTable('refresh');
            },
            error:function(){
                console.log('删除失败:');
                $testInfoTable.bootstrapTable('refresh');
            }
        });
    });

    //导入对话框模板
    var template_import = '' +
        '<form>' +
            '<div class="form-group message">' +
            '</div>' +
            '<div class="form-group">' +
                '<label>文件：</label>' +
                '<div class="input-group">' +
                    '<input type="text" class="form-control" placeholder="File Name" disabled>' +
                    '<span class="input-group-btn">' +
                        '<label for="file_testInfo" class="btn btn-primary">选择文件</label>' +
                        '<input id="file_testInfo" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);">' +
                    '</span>' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<button type="submit" class="btn btn-primary btn-lg btn-block">提交</button>' +
            '</div>' +
            '<div class="form-group">' +
                '<h5>导入说明</h5>' +
                '<hr>' +
                '<h6><b>支持的文件类型:</b></h6> ' +
                    '<p> xls,xlsx </p>' +
                '<h6><b>各个数据项对应的表头名称（注：列名与缩写都可以使用）:</b></h6>' +
                '<table class="table table-bordered table-striped table-condensed">' +
                    '<tr>' +
                        '<th>列名</th>' +
                        '<th>缩写</th>'+
                        '<th>表头名称</th>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>id_number</td>' +
                        '<td>ZJH</td>'+
                        '<td>证件号</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>name</td>' +
                        '<td>XM</td>'+
                        '<td>姓名</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>testRoom_number</td>' +
                        '<td>KCH</td>'+
                        '<td>考场号</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>batch_number</td>' +
                        '<td>PCH</td>'+
                        '<td>批次号</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
        '</form>';
    //导入按钮
    $toolbar.find('.import').click(function(){

        myDialog.dialog({
            title:'导入考试信息',
            msg:template_import,
            init:function($modal,re){

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]',$root).val($(this).val());
                });

                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/testInfo',
                    type:'post',
                    beforeSubmit:function(){
                        if($modal.find('input[type="file"]').val() == '') return false;
                        else showMsg($modal.find('.message'),'info','<div class="loader"></div> 添加中...');
                    },
                    success:function(msg){
                        showMsg($modal.find('.message'),'success','添加成功：' + msg);
                        $testInfoTable.bootstrapTable('refresh');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.message'),'danger','Error：' + xhr.responseText);
                        $testInfoTable.bootstrapTable('refresh');
                    }
                });
            },
            okBtn:false
        });
    });



});