/**
 * Created by tom smith on 2017/2/3.
 */
$(document).ready(function(){
    var $root = $('#blackList');

    //添加对话框

    //导入对话框
    $('.import .nav-tabs>li',$root).click(function(){
        var $this = $(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');
        $('.import img',$root).attr('src','/img/blackList_example_' + $this.attr('value') + '.jpg');
    });

    $('.import input[type="file"]',$root).change(function(v,a,b,c){
        $('.import input[type="text"]',$root).val($(this).val());
    });

    //添加\导入表单
    $('.addItem form',$root).ajaxForm({
        url:'/admin/enterManage/blackList',
        type:'post',
        success:function(msg){
            showMsg($('.addItem .message',$root),'success','添加成功：' + msg);
            $('table',$root).bootstrapTable('refresh');
        },
        error:function(xhr){
            showMsg($('.addItem .message',$root),'danger','Error：' + xhr.responseText);
            $('table',$root).bootstrapTable('refresh');
        }
    });


    $('.import form',$root).ajaxForm({
        url:'/admin/enterManage/blackList',
        type:'post',
        success:function(msg){
            showMsg($('.import .message',$root),'success','添加成功：' + msg);
            $('table',$root).bootstrapTable('refresh');
        },
        error:function(xhr){
            showMsg($('.import .message',$root),'danger','Error：' + xhr.responseText);
            $('table',$root).bootstrapTable('refresh');
        }
    });


    //删除按钮
    $('.delete',$root).click(function(){
        var data_del = $('table',$root).bootstrapTable('getSelections'); //要删除的数据
        //并行删除
        var succeed = 0;
        _.each(data_del,function(row){
            $.ajax({
                url:'/admin/enterManage/blackList/' + row.id_number,
                type:'delete',
                success:function(){
                    succeed++;
                    if(succeed = data_del.length) {
                        showMsg($('.message:eq(0)',$root),'success','删除成功');
                    }
                    $('table',$root).bootstrapTable('refresh');
                },
                error:function(){
                    console.log('删除失败:' + row.id_number);
                }
            });
        });
    });

    $('table',$root).bootstrapTable({
        url:'/admin/enterManage/blackList',     //数据URL
        idField:'id_number',
        /* 翻页 */
        pagination:true,
        sidePagination:'client',
        search:true,
        showRefresh:true,
        showToggle:true,
        buttonsClass:'primary',
        toolbar:'#blackList .toolbar',
        columns: [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
        }, {
            field:'id_number',
            title:'证件号',
            sortable:true
        }, {
            field:'name',
            title:'姓名',
            sortable:true
        }]
    });
});

