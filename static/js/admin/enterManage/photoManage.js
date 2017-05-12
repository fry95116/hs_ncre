/**
 * Created by tom smith on 2017/2/2.
 */
$(document).ready(function(){

    //命名空间
    var $root = $('#photoManage');

    //报名信息列表
    var $toolbar = $('.toolbar',$root);
    var photoTable = $('.photoTable',$root);


    photoTable.bootstrapTable({
        url:'/admin/enterManage/photo',     //数据URL
        idField:'id_number',
        /* 翻页 */
        clickToSelect:true,
        pageSize:25,
        cardView:true,
        pagination:true,
        sidePagination:'server',
        // rowStyle:function rowStyle(row, index) {
        //     return {
        //         classes: 'thumbnail'
        //     };
        // },
        /* 组装查询参数 */
        queryParams:function(params){

            var searchText = $('input[name="searchText"]',$toolbar).val();
            var strictMode = $('input[name="strictMode"]',$toolbar).is(':checked');

            if(searchText === '') return params;
            else{
                params.searchText = searchText;
                params.strictMode = strictMode;
                return params;
            }
        },
        columns: [{
            field: 'state',
            checkbox: true
        },{
            field:'id_number',
            formatter:function(val,col,index){
                return '' +
                    '<div class="thumbnail"> ' +
                        '<img src="/admin/enterManage/photo/' + col.file_name + '" alt="照片"> ' +
                        '<div class="caption"> ' +
                        '<div>证件号:<br>' + val + '</div> ' +
                        '</div> ' +
                    '</div>';
            }
        }]
    });

    //刷新按钮
    $toolbar.find('.refresh').click(function(){
        photoTable.bootstrapTable('refresh');
    });
    //搜索按钮
    $toolbar.find('.search').click(function(){
        photoTable.bootstrapTable('refresh');
    });
    //删除按钮
    $toolbar.find('.delete').click(function(){

        var data_del = photoTable.bootstrapTable('getSelections'); //要删除的数据
        if(data_del.length != 0){
            if(!confirm('确定删除所选信息?')) return;
            //并行删除
            var succeed = 0;
            _.each(data_del,function(row){
                $.ajax({
                    url:'/admin/enterManage/photo/' + row.id_number,
                    type:'delete',
                    success:function(){
                        succeed++;
                        if(succeed = data_del.length) {
                            showMsg($('.message',$root),'success','删除成功');
                            photoTable.bootstrapTable('refresh');
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
            url:'/admin/enterManage/photo/',
            type:'delete',
            success:function(){
                showMsg($('.message',$root),'success','删除成功');
                photoTable.bootstrapTable('refresh');
            },
            error:function(){
                console.log('删除失败:' + row.id_number);
                photoTable.bootstrapTable('refresh');
            }
        });
    });

    /** 添加对话框 */
    var template_add = '' +
            '<form> ' +
            '<div class="form-group message"> ' +
            '</div> ' +
            '<div class="form-group"> ' +
            '<label>证件号：</label> ' +
            '<input name="id_number" type="text" class="form-control" placeholder="证件号" required> ' +
            '</div> ' +
            '<div class="form-group"> ' +
            '<label>文件：</label> ' +
            '<div class="input-group"> ' +
            '<input type="text" class="form-control" placeholder="File Name" disabled> ' +
            '<span class="input-group-btn"> ' +
            '<label for="file_photoManage" class="btn btn-primary">选择文件</label> ' +
            '<input id="file_photoManage" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);"> ' +
            '</span> ' +
            '</div> ' +
            '</div> ' +
            '<div class="form-group"> ' +
            '<button type="submit" class="btn btn-primary">提交</button> ' +
            '</div> ' +
            '<div class="form-group">' +
            '<h5>文件说明</h5> ' +
            '<hr> ' +

            '<h6><b>支持的文件类型:</b></h6> ' +
            '<p>jpg,png,gif</p> ' +
            '<h6><b>文件大小:</b></h6> ' +
            '<p>1M以下</p> ' +
            '<h6><b>照片大小:</b></h6> ' +
            '<p>' +
            '比例3:4<br>' +
            '建议分辨率:220px * 165px<br>' +
            '最小分辨率:192px * 144px<br>' +
            '</p> ' +
            '</div>' +
            '</form>';


    $('.add',$root).click(function(){
        myDialog.dialog({
            title:'添加黑名单项',
            okBtn:false,
            cancelBtn:false,
            msg:template_add,
            init:function($modal,re){

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]:eq(1)',$root).val($(this).val());
                });


                $modal.find('form').ajaxForm({
                    url:'/admin/enterManage/photo',
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

    /** 导入对话框 */
    var template_import = '' +
        '<form> ' +
            '<div class="form-group message"> ' +
            '</div> ' +
            '<div class="form-group"> ' +
                '<label>文件：</label> ' +
                '<div class="input-group"> ' +
                    '<input type="text" class="form-control" placeholder="File Name" disabled> ' +
                    '<span class="input-group-btn"> ' +
                        '<label for="file_photoManage" class="btn btn-primary">选择文件</label> ' +
                        '<input id="file_photoManage" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);"> ' +
                    '</span> ' +
                '</div> ' +
            '</div> ' +
            '<div class="form-group"> ' +
                '<button type="submit" class="btn btn-primary btn-block">提交</button> ' +
            '</div> ' +
            '<div class="form-group">' +
                '<h5>文件说明</h5> ' +
                '<hr> ' +
                '<h6><b>支持的文件类型:</b></h6> ' +
                    '<p>zip</p> ' +
                '<h6><b>格式说明:</b></h6> ' +
                    '<p>' +
                        '照片包中的照片以证件号作为文件名<br>' +
                        '支持的照片格式:jpg,png,gif' +
                    '</p> ' +
            '</div>' +
        '</form>';


    $('.import',$root).click(function(){
        myDialog.dialog({
            title:'添加黑名单项',
            okBtn:false,
            cancelBtn:false,
            msg:template_import,
            init:function($modal,re){

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]',$root).val($(this).val());
                });


                $modal.find('form').ajaxForm({
                    url:'/admin/enterManage/photo',
                    type:'put',
                    beforeSubmit:function(){
                        if($modal.find('input[type="file"]').val() == '') return false;
                        else showMsg($modal.find('.message'),'info','<div class="loader"></div> 添加中...');
                    },
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

    $('.export',$root).click(function(){
        myDialog.confirm('是否用身份证号替换?<br>选"<b>是</b>"则使用身份证号做文件名<br>选"<b>否</b>"使用原文件名(与报名表导出的数据对应)',
            function(re){
                window.open("/admin/enterManage/photo/photoPackage.zip?replaceFileName=" + (re.state === 'ok'));
            });
    });

});