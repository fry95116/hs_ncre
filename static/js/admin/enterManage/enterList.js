/**
 * Created by tom smith on 2017/2/2.
 */
$(document).ready(function(){

    //命名空间
    var $root = $('#enterList');

    //message
    function showMsg(status,info){
        var template = '<div class="alert alert-' + status + ' alert-dismissible" role="alert">'+
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            info +
        '</div>';
        $('.message',$root).html(template);
    }
    //搜索条件按钮
    var btn_searchBy = $('.searchBy',$root);
    btn_searchBy.find("a").click(function(){
        btn_searchBy.find('.btn-text').text($(this).text());
        $('[name=searchBy]',$root).val($(this).attr('value'));
    });

    //报名信息列表
    var $toolbar = $('.toolbar',$root);
    var $enterTable = $('.enterTable',$root);

    //选择器
    var formatter_select = function(val,col,index){
        var url = '/admin/enterInfo/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;

        return  '<div class="cell">' +
                    '<a data-url="' + url + '" data-pk = "' + col.id_number + '" data-type="select" data-source="' + source + '" data-value="' + val + '"></a>' +
                '</div>';
    };

    //文本框
    var formatter_text = function(val,col,index){
        var url = '/admin/enterInfo/' + col.id_number + '/' + this.field;
        var source = '/codeRef/' + this.field;
        return  '<div class="cell">' +
                    '<a data-url="' + url + '" data-pk = "' + col.id_number + '" data-type="text" data-source="' + source + '" data-value="' + val + '"></a>' +
                '</div>';
    };

    //文本
    var formatter_disable = function(val,col,index){
        return  '<div class="cell">' + val + '</div>';
    };

    $enterTable.bootstrapTable({
        url:'/admin/enterInfo',     //数据URL
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
            $enterTable.find('a').editable({
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
            field:'exam_site_code',
            title:'考点代码',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'subject_code',
            title:'学科代码',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'sex',
            title:'性别',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'birthday',
            title:'出生日期',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'id_type',
            title:'证件类型',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'nationality',
            title:'民族',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'career',
            title:'职业',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'degree_of_education',
            title:'文化程度',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'training_type',
            title:'培训类型',
            sortable:true,
            formatter:formatter_select
        }, {
            field:'post_code',
            title:'邮编',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'address',
            title:'地址',
            sortable:true,
            formatter:formatter_text
        }, {
            field:'email',
            title:'电子邮箱',
            sortable:true,
            formatter:formatter_text
        },{
            field:'phone',
            title:'联系电话',
            sortable:true,
            formatter:formatter_text
        },{
            field:'remark',
            title:'备注',
            sortable:true,
            formatter:formatter_text
        }]
    });

    //刷新按钮
    $toolbar.find('.refresh').click(function(){
        $enterTable.bootstrapTable('refresh');
    });

    //toggle按钮
    $toolbar.find('.toggle').click(function(){
        $enterTable.bootstrapTable('toggleView');
    });

    //搜索按钮
    $toolbar.find('.search').click(function(){
        $enterTable.bootstrapTable('refresh');
    });

    //删除按钮
    $toolbar.find('.delete').click(function(){
        var data_del = $enterTable.bootstrapTable('getSelections'); //要删除的数据
        //并行删除
        var succeed = 0;
        _.each(data_del,function(row){
            $.ajax({
                url:'/admin/enterInfo/' + row.id_number,
                type:'delete',
                success:function(){
                    succeed++;
                    if(succeed = data_del.length) {
                        showMsg('success','删除成功');
                    }
                    $enterTable.bootstrapTable('refresh');
                },
                error:function(){
                    console.log('删除失败:' + row.id_number);
                }
            });
        });
    });
});