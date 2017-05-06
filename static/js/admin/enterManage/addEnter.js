/**
 * Created by tastycarb on 2017/4/8.
 */
$(document).ready(function () {
    var $root = $('#addEnter');


    /** 导入缓冲区 */
    //选择器
    var formatter_select = function (val, col, index) {
        var source = '/codeRef/' + this.field;

            return '<div class="cell">' +
                '<a ' +
                'data-pk = "' + index + '"' +
                'data-field = "' + this.field + '"' +
                'data-type = "select"' +
                'data-source = "' + source + '"' +
                'data-value = "' + val + '"' +
                'data-emptyText="未知代码(' + val + ')"></a>' +
                '</div>';
        };
    //文本框
    var formatter_text = function (val, col, index) {
        return '<div class="cell">' +
            '<a ' +
            'data-pk = "' + index + '"' +
            'data-field = "' + this.field + '"' +
            'data-type = "text"' +
            'data-value = "' + val + '"></a>' +
            '</div>';
    };

    var $importBuffer = $('.importBuffer', $root);
    $importBuffer.bootstrapTable({
        idField: 'tid',
        /* 翻页 */
        pagination: true,

        /* x-editable */
        onPostBody: function (data) {
            $importBuffer.find('a').editable({mode: 'inline'})
                .on('save',function(e,newVal){
                    var params = {};
                    params.index = $(this).attr('data-pk');
                    params.row = {};
                    params.row[$(this).attr('data-field')] = newVal.newValue;
                    $importBuffer.bootstrapTable('updateRow', params);
            });
        },
        columns: [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
        }, {
            field: 'id_number',
            title: '证件号',
            formatter: formatter_text
        }, {
            field: 'name',
            title: '姓名',
            formatter: formatter_text
        }, {
            field: 'exam_site_code',
            title: '考点名称(代码)',
            formatter: formatter_select
        }, {
            field: 'subject_code',
            title: '学科名称(代码)',
            formatter: formatter_select
        }, {
            field: 'sex',
            title: '性别(代码)',
            formatter: formatter_select
        }, {
            field: 'birthday',
            title: '出生日期',
            formatter: formatter_text
        }, {
            field: 'id_type',
            title: '证件类型(代码)',
            formatter: formatter_select
        }, {
            field: 'nationality',
            title: '民族(代码)',
            formatter: formatter_select
        }, {
            field: 'career',
            title: '职业(代码)',
            formatter: formatter_select
        }, {
            field: 'degree_of_education',
            title: '文化程度(代码)',
            formatter: formatter_select
        }, {
            field: 'training_type',
            title: '培训类型(代码)',
            formatter: formatter_select
        }, {
            field: 'post_code',
            title: '邮编',
            formatter: formatter_text
        }, {
            field: 'address',
            title: '地址',
            formatter: formatter_text
        }, {
            field: 'email',
            title: '电子邮箱',
            formatter: formatter_text
        }, {
            field: 'phone',
            title: '联系电话',
            formatter: formatter_text
        }, {
            field: 'remark',
            title: '备注',
            formatter: formatter_text
        }]
    });

    //删除所选
    $('.delete', $root).click(function () {
        $importBuffer.bootstrapTable('remove', {
            field: 'tid',
            values: _.pluck($importBuffer.bootstrapTable('getAllSelections'), 'tid')
        });
    });
    //删除全部
    $('.deleteAll', $root).click(function () {
        $importBuffer.bootstrapTable('removeAll');
    });
    //切换显示
    $('.toggle', $root).click(function () {
        $importBuffer.bootstrapTable('toggleView');
    });

    /** 手动添加 */
    var $form = $('form.manuallyAdd', $root);
    //装填select
    $form.find('select').each(function(){
        (function($el) {
            var source = $el.attr('data-source');
            if (source == '') return;
            $.ajax({
                url: source,
                timeout: 1000,
                dataType: 'json',
                success: function (data) {
                    $el.siblings('span.select_err_msg').remove();
                    $.each(data, function (index, item) {
                        //[{text,children:[{value,text}]}]
                        if (item.children) {
                            var $group = $('<optgroup label="' + item.text + '"></optgroup>');
                            $.each(item.children, function (index, sub_item) {
                                $group.append('<option value="' + sub_item.value + '">' + sub_item.text + '</option>');
                            })
                            $el.append($group);
                        }
                        //[{value,text}]
                        else {
                            $el.append('<option value="' + item.value + '">' + item.text + '</option>');
                        }
                    })
                },
                error: function () {
                    $el.parent().append('<span class="select_err_msg">无法获取信息</span>');
                }
            });
        })($(this));

    });

    /** 添加信息 */
    //主键生成
    var getID = (function(){
            var i = 0;
            return function(){
                return i++;
            }
        })();

    function appendData(data){
        $importBuffer.bootstrapTable('append', _.map(data,function(row){
            row.tid = getID();
            return row;
        }));
        $importBuffer.bootstrapTable('scrollTo', 'bottom');
    }

    window.appendData = appendData;

    //添加入缓冲区
    $form.submit(function () {
        var data = _.reduce($form.serializeArray(), function (memo, iter) {
            memo[iter.name] = iter.value;
            return memo;
        }, {});
        appendData([data]);
        return false;
    });






    /** 导入缓冲区 */

    var template_import = '' +
        '<form>' +
            '<div class="form-group message"></div>' +
            '<div class="form-group"> ' +
                '<h5>文件：</h5> ' +
                '<hr> ' +
                '<div class="input-group"> ' +
                    '<input type="text" class="form-control" placeholder="File Name" disabled> ' +
                    '<span class="input-group-btn"> ' +
                        '<label for="file_addEnter" class="btn btn-primary">选择文件</label> ' +
                        '<input id="file_addEnter" name="file" type="file" style="position:absolute;clip:rect(0 0 0 0);"> ' +
                    '</span> ' +
                '</div> ' +
            '</div> ' +
            '<div class="form-group">' +
                '<button type="submit" class="btn btn-primary btn-lg btn-block">提交</button>' +
            '</div>' +
            '<div class="form-group"> ' +
                '<h5>导入说明</h5> ' +
                '<hr> ' +

                '<h6><b>支持的文件类型:</b></h6> ' +
                '<p>xls,xlsx </p> ' +

                '<h6><b>各个数据项对应的表头名称:</b></h6> ' +
                '<table class="table table-bordered table-striped table-condensed"> ' +
                    '<tr> <th>列名</th> <th>数据说明</th> </tr> ' +
                    '<tr> <td>exam_site_code</td> <td>考点(代码)</td> </tr> ' +
                    '<tr> <td>subject_code</td> <td>考试科目(代码)</td> </tr> ' +
                    '<tr> <td>name</td> <td>姓名</td> </tr> ' +
                    '<tr> <td>sex</td> <td>性别(代码)</td> </tr> ' +
                    '<tr> <td>birthday</td> <td>出生日期</td> </tr> ' +
                    '<tr> <td>id_type</td> <td>证件类型(代码)</td> </tr> ' +
                    '<tr> <td>id_number</td> <td>证件号码</td> </tr> ' +
                    '<tr> <td>nationality</td> <td>民族(代码)</td> </tr> ' +
                    '<tr> <td>career</td> <td>职业(代码)</td> </tr> ' +
                    '<tr> <td>degree_of_education</td> <td>文化程度(代码)</td> </tr> ' +
                    '<tr> <td>training_type</td> <td>培训类型(代码)</td> </tr> ' +
                    '<tr> <td>post_code</td> <td>邮政编码</td> </tr> ' +
                    '<tr> <td>address</td> <td>地址</td> </tr> ' +
                    '<tr> <td>email</td> <td>电子邮箱</td> </tr> ' +
                    '<tr> <td>phone</td> <td>联系电话</td> </tr> ' +
                    '<tr> <td>remark</td> <td>备注</td> </tr> ' +
                '</table> ' +
            '</div>' +
        '</form>';
    $('.import',$root).click(function(){

        myDialog.dialog({
            title:'导入报名信息',
            msg:template_import,
            init:function($modal,re){

                $modal.find('input[type="file"]').change(function(){
                    $modal.find('input[type="text"]',$root).val($(this).val());
                });

                $modal.find('form').ajaxForm({
                    url:'/admin/enterManage/enterInfo',
                    type:'post',
                    beforeSubmit:function(){
                        if($modal.find('input[type="file"]').val() == '') return false;
                        else showMsg($modal.find('.message'),'info','<div class="loader"></div> 添加中...');
                    },
                    success:function(msg){
                        showMsg($modal.find('.message'),'success','导入成功：' + msg);
                        $('#enterList .enterTable').bootstrapTable('refresh');
                    },
                    error:function(xhr){
                        showMsg($modal.find('.message'),'danger','Error：' + xhr.responseText);
                    }
                });
            },
            okBtn:false
        });
    });

    // $('#file_addEnter').change(function(e){
    //     var files = e.target.files;
    //     if(files.length === 0)return;
    //     //读取第一个文件
    //     var file = files[0];
    //     var reader = new FileReader();
    //     reader.onload = function(e) {
    //         var data = e.target.result;
    //         var workbook = XLSX.read(data, {type: 'binary'});           //工作簿
    //         var worksheet = workbook.Sheets[workbook.SheetNames[0]];    //工作表
    //         /*console.log(XLSX.utils.sheet_to_json(worksheet));*/
    //
    //         var IDs = [
    //             'exam_site_code', 'name', 'sex', 'birthday',
    //             'id_type', 'id_number', 'nationality', 'career',
    //             'degree_of_education', 'training_type', 'subject_code',
    //             'post_code', 'address', 'email', 'phone', 'remark'
    //         ];
    //         appendData(_.map(XLSX.utils.sheet_to_json(worksheet),function(row){
    //             return _.defaults(_.pick(row,IDs),{
    //                 'post_code':'',
    //                 'address':'',
    //                 'phone':'',
    //                 'remark':''
    //             });
    //         }));
    //
    //     };
    //     reader.readAsBinaryString(file);
    // });

    /** 数据提交 */
    $('.add',$root).click(function(){
        if(confirm('确定添加？'))
            Upload(false,$importBuffer,$('.err_msg',$root));
    });
    $('.forceAdd',$root).click(function(){
        if(confirm('确定添加？'))
            Upload(true,$importBuffer,$('.err_msg',$root));
    });

    /** 提交表单
     * force            是否强制提交
     * $importBuffer    输入缓冲区（Jquery对象）
     * $progress        进度条（JQuery对象）
     * */
    function Upload(force,$importBuffer,$processContent){

        var data = $importBuffer.bootstrapTable('getData');
        var cur = 0;
        var sum = data.length;

        /*** 组装进度面板 ***/
        //进度条
        $processContent.append(
            '<div class="panel panel-default">' +
                '<div class="panel-body">' +
                    '<label>添加进度：</label>' +
                    '<span class="cur_rate">0/' + sum + '</span>' +
                    '<div class="progress">' +
                        '<div class="progress-bar progress-bar-success"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );


        /*** 添加 ***/
        submitData(force);

        function submitData(force,temp){
            var data = $importBuffer.bootstrapTable('getData');
            if(data.length == 0) {
                //提交完成
                $processContent.empty().append(
                    '<div class="alert alert-success alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert">' +
                            '<span>&times;</span>' +
                        '</button> ' +
                        '<strong>成功!</strong> ' + sum + ' 数据添加完成。' +
                    '</div>'
                );
            }else{
                $.ajax({
                    type: "POST",
                    url: "/admin/enterManage/enterInfo",
                    data: _.extend(_.first(data),{force:force?'true':'false'}),
                    dataType: "text",
                    success: function(resText){
                        //删除已提交的行
                        $importBuffer.bootstrapTable('remove', {
                            field: 'tid',
                            values: [_.first(data).tid]
                        });
                        //更新进度条状态
                        cur++;
                        $processContent.find('.cur_rate').text('' + cur + '/' + sum);
                        $processContent.find('.progress-bar').css('width', Math.floor(cur / sum * 100) + '%');
                        //删除下一行
                        if(temp) submitData(!force);
                        else submitData(force);
                    },
                    error:function(XHR, textStatus, errorThrown){
                        //显示模态框
                        myDialog.dialog({
                            title:'传输中断',
                            okBtn:false,
                            cancelBtn:false,
                            closeBtn:false,
                            msg:'' +
                            '<p> ' +
                            '<label>错误信息：</label>' + XHR.responseText + '<br> ' +
                            '<b>接下来怎么做？</b> ' +
                            '</p> ' +
                            '<div style="text-align: right; line-height: 3em;"> ' +
                            '<button type="button" class="action btn btn-primary" value="interrupt">1.中断传输，回去修改</button><br> ' +
                            '<button type="button" class="action btn btn-primary" value="forceCurrent">2.强制添加当前项，不改变后面的添加方式</button><br> ' +
                            '<button type="button" class="action btn btn-primary" value="keepforce">3.强制添加当前项与之后的数据项</button> ' +
                            '</div>',
                            init:function($modal,re){
                                $modal.find('.action').click(function(){
                                    re.msg = $(this).attr('value');
                                    $modal.modal('hide');
                                });
                            },
                            response:function(re){
                                switch(re.msg) {
                                    case 'interrupt':     //1.中断传输，回去修改
                                        $processContent.empty();
                                        break;
                                    case 'forceCurrent':     //2.强制添加当前项，不改变后面的添加方式
                                        submitData(true,true);
                                        break;
                                    case 'keepforce':     //3.强制添加当前项与之后的数据项
                                        submitData(true);
                                        break;
                                }
                            }
                        });
                    }
                });
            }

        }
    }
});