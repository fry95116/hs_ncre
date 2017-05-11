/**
 * Created by tom smith on 2017/2/2.
 */
$(document).ready(function(){

    //命名空间
    var $root = $('#admissionTicket');
    /*********************************数据检查**************************************/
    $('button.check',$root).click(function(){
        var id_number = $('input[name="searchText"]',$root).val();
        if (id_number == "") return;
        $.ajax({
            url:'/admin/testArrange/admissionTicket/' + id_number,
            type:'get',
            success:function(data){
                showMsg($('.check .message',$root),'success',data);
            },
            error:function(XHR){
                showMsg($('.check .message',$root),'danger','检查不通过:' + XHR.responseText);
            }
        });
    });


    /*******************************报名信息列表*************************************/
    //搜索条件按钮
    var btn_searchBy = $('.searchBy',$root);
    btn_searchBy.find("a").click(function(){
        btn_searchBy.find('.btn-text').text($(this).text());
        $('[name=searchBy]',$root).val($(this).attr('value'));
    });

    var $toolbar = $('.toolbar',$root);
    var $admissionTicketTable = $('.admissionTicketTable',$root);

    //选择器
    var formatter_select = function(val,col,index){
        var url = '/admin/enterManage/enterInfo/' + col.id_number + '/' + this.field;
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

    $admissionTicketTable.bootstrapTable({
        url:'/admin/testArrange/admissionTicket',     //数据URL
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

        t:['photoFileName'],
        columns: [{
            field:'id_number',
            title:'证件号',
            sortable:true
        }, {
            field:'examinee_number',
            title:'准考证号',
            sortable:true
        }, {
            field:'enter_number',
            title:'报名号',
            sortable:true
        }, {
            field:'name',
            title:'姓名',
            sortable:true
        }, {
            field:'exam_site_code',
            title:'考点代码',
            sortable:true
        }, {
            field:'subject_code',
            title:'学科代码',
            sortable:true
        }, {
            field:'testRoom_number',
            title:'考场号',
            sortable:true
        }, {
            field:'batch_number',
            title:'批次号',
            sortable:true
        }]
    });

    //刷新按钮
    $toolbar.find('.refresh').click(function(){
        $admissionTicketTable.bootstrapTable('refresh');
    });

    //toggle按钮
    $toolbar.find('.toggle').click(function(){
        $admissionTicketTable.bootstrapTable('toggleView');
    });

    //搜索按钮
    $toolbar.find('.search').click(function(){
        $admissionTicketTable.bootstrapTable('refresh');
    });

});