/**
 * Created by tom smith on 2017/2/2.
 */
$(document).ready(function(){

    //命名空间
    var $root = $('#scoreManage');

    //搜索条件按钮
    var btn_searchBy = $('.searchBy',$root);
    btn_searchBy.find("a").click(function(){
        btn_searchBy.find('.btn-text').text($(this).text());
        $('[name=searchBy]',$root).val($(this).attr('value'));
    });

    //报名信息列表
    var $toolbar = $('.toolbar',$root);
    var $scoreTable = $('.scoreTable',$root);

    //选择器
    var formatter_select = function(val,col,index){
        var url = '/admin/testArrange/score/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;

        return '<div class="cell">' +
            '<a ' +
            'data-url="' + url + '" ' +
            'data-pk = "' + col.id_number + '" ' +
            'data-type="select" ' +
            'data-source="' + source + '" ' +
            'data-sourceCache="false" ' +
            'data-value="' + val + '"></a>' +
            '</div>';
    };

    //文本框
    var formatter_text = function(val,col,index){
        var url = '/admin/testArrange/score/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;
        return  '<div class="cell">' +
            '<a data-url="' + url + '" data-pk = "' + col.id_number + '" data-type="text" data-source="' + source + '" data-value="' + val + '"></a>' +
            '</div>';
    };

    //文本
    var formatter_disable = function(val,col,index){
        return  '<div class="cell">' + val + '</div>';
    };

    $scoreTable.bootstrapTable({
        url:'/admin/testArrange/score',     //数据URL
        idField:'id_number',
        /* 翻页 */
        pagination:true,
        sidePagination:'server',
        /* 组装查询参数 */
        queryParams:function(params){

            var searchText = $('input[name="searchText"]',$toolbar).val();
            var searchBy = $('input[name="searchBy"]',$toolbar).val();
            var strictMode = $('input[name="strictMode"]',$toolbar).is(':checked');
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
            $scoreTable.find('a').editable({
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
            field:'examinee_number',
            title:'准考证号',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'enter_number',
            title:'报名号',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'score',
            title:'成绩',
            sortable:true,
            formatter:formatter_text
        },{
            field:'rank',
            title:'等第',
            sortable:true,
            formatter:formatter_select
        },{
            field:'certificate_number',
            title:'证书编号',
            sortable:true,
            formatter:formatter_text
        }]
    });

    //刷新按钮
    $toolbar.find('.refresh').click(function(){
        $scoreTable.bootstrapTable('refresh');
    });


    //搜索按钮
    $toolbar.find('.search').click(function(){
        $scoreTable.bootstrapTable('refresh');
    });

    //删除按钮
    $toolbar.find('.delete').click(function(){

        var data_del = $scoreTable.bootstrapTable('getSelections'); //要删除的数据
        if(data_del.length != 0){
            if(!confirm('确定删除所选信息?')) return;
            //并行删除
            var succeed = 0;
            _.each(data_del,function(row){
                $.ajax({
                    url:'/admin/testArrange/score/' + row.id_number,
                    type:'delete',
                    success:function(){
                        succeed++;
                        if(succeed = data_del.length) {
                            showMsg($('.message',$root),'success','删除成功');
                            $scoreTable.bootstrapTable('refresh');
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
            url:'/admin/testArrange/score',
            type:'delete',
            success:function(){
                showMsg($('.message',$root),'success','删除成功');
                $scoreTable.bootstrapTable('refresh');
            },
            error:function(){
                console.log('删除失败:');
                $scoreTable.bootstrapTable('refresh');
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
                        '<label for="file_scoreManage" class="btn btn-primary">选择文件</label>' +
                        '<input id="file_scoreManage" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);">' +
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
                        '<td>examinee_number</td>' +
                        '<td>ZKZH</td>'+
                        '<td>准考证号</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>enter_number</td>' +
                        '<td>BMH</td>'+
                        '<td>报名号</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>score</td>' +
                        '<td>CJ</td>'+
                        '<td>成绩</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>rank</td>' +
                        '<td>DD</td>'+
                        '<td>等第</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>certificate_number</td>' +
                        '<td>ZSBH</td>'+
                        '<td>证书编号</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
        '</form>';
    //导入按钮
    $toolbar.find('.import').click(function(){

        myDialog.dialog({
            title:'导入分数信息',
            msg:template_import,
            init:function($modal,re){

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]',$root).val($(this).val());
                });

                $modal.find('form').ajaxForm({
                    url:'/admin/testArrange/score',
                    type:'post',
                    success:function(msg){
                        showMsg($modal.find('.message'),'success','添加成功：' + msg);
                        $scoreTable.bootstrapTable('refresh');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.message'),'danger','Error：' + xhr.responseText);
                        $scoreTable.bootstrapTable('refresh');
                    }
                });
            },
            okBtn:false
        });
    });


});