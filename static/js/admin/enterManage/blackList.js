/**
 * Created by tom smith on 2017/2/3.
 */
$(document).ready(function(){
    var $root = $('#blackList');

    //添加对话框
    var template_add = '' +
        '<form> ' +
            '<div class="form-group message"> ' +
            '</div> ' +
            '<div class="form-group"> ' +
                '<label>姓名：</label> ' +
                '<input name="name" type="text" class="form-control" placeholder="姓名" required> ' +
            '</div> ' +
            '<div class="form-group"> ' +
                '<label>证件号：</label> ' +
                '<input name="id_number" type="text" class="form-control" placeholder="证件号" required> ' +
            '</div> ' +
            '<div class="form-group"> ' +
                '<button type="submit" class="btn btn-primary">提交</button> ' +
            '</div> ' +
        '</form>';


    $('.add',$root).click(function(){
        myDialog.dialog({
            title:'添加黑名单项',
            okBtn:false,
            cancelBtn:false,
            msg:template_add,
            init:function($modal,re){
                $modal.find('form').ajaxForm({
                    url:'/admin/enterManage/blackList',
                    type:'post',
                    success:function(msg){
                        showMsg($modal.find('.message'),'success','添加成功：' + msg);
                        $('table',$root).bootstrapTable('refresh');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.message'),'danger','添加失败：' + xhr.responseText);
                        $('table',$root).bootstrapTable('refresh');
                    }
                });
            }
        });


    });


    //导入对话框

    var template_import = '' +
    '<form> ' +
        '<div class="form-group message"> ' +
        '</div> ' +
        '<div class="form-group"> ' +
            '<label>文件：</label> ' +
            '<div class="input-group"> ' +
                '<input type="text" class="form-control" placeholder="File Name" disabled> ' +
                '<span class="input-group-btn"> ' +
                    '<label for="file_blackList" class="btn btn-primary">选择文件</label> ' +
                    '<input id="file_blackList" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);"> ' +
                '</span> ' +
            '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
            '<button type="submit" class="btn btn-primary btn-block">提交</button> ' +
        '</div> ' +
        '<div class="form-group"> ' +
            '<label>数据示例：</label> ' +
            '<ul class="nav nav-tabs"> ' +
                '<li role="presentation" class="active" value="csv"><a>CSV</a></li> ' +
                '<li role="presentation" value="xlsx"><a>XLSX</a></li> ' +
                '<li role="presentation" value="json"><a>JSON</a></li> ' +
                '<li role="presentation" value="xml"><a>XML</a></li> ' +
            '</ul> ' +
        '</div> ' +
        '<div class="form-group"> ' +
            '<div class="thumbnail"> ' +
            '<img src="/img/blackList_example_csv.jpg" /> ' +
            '</div> ' +
        '</div> ' +
    '</form>';
    $('.import',$root).click(function(){
        myDialog.dialog({
            title:'导入黑名单项',
            okBtn:false,
            cancelBtn:false,
            msg:template_import,
            init:function($modal,re){
                $modal.find('.nav-tabs>li').click(function(){
                    var $this = $(this);
                    $this.siblings().removeClass('active');
                    $this.addClass('active');
                    $('.import img',$root).attr('src','/img/blackList_example_' + $this.attr('value') + '.jpg');
                });

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]').val($(this).val());
                });

                //表单
                $modal.find('form').ajaxForm({
                    url:'/admin/enterManage/blackList',
                    type:'post',
                    success:function(msg){
                        showMsg($modal.find('.message'),'success','添加成功：' + msg);
                        $('table',$root).bootstrapTable('refresh');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.message'),'danger','添加失败：' + xhr.responseText);
                        $('table',$root).bootstrapTable('refresh');
                    }
                });
            }
        });
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

