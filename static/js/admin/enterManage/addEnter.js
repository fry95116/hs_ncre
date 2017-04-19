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
                'data-pk = "' + index + '" ' +
                'data-field = "' + this.field + '"' +
                'data-type = "select" ' +
                'data-source = "' + source + '" ' +
                'data-value = "' + val + '"></a>' +
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

    /** 删除所选 */
    $('.delete', $root).click(function () {
        $importBuffer.bootstrapTable('remove', {
            field: 'tid',
            values: _.pluck($importBuffer.bootstrapTable('getAllSelections'), 'tid')
        });
    });
    /** 删除全部 */
    $('.deleteAll', $root).click(function () {
        $importBuffer.bootstrapTable('removeAll');
    });
    /** 切换显示 */
    $('.toggle', $root).click(function () {
        $importBuffer.bootstrapTable('toggleView');
    });

    /** 手动添加 */
    var $form = $('form.manuallyAdd', $root);
    /** 装填select */
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
    //添加数据
    function appendData(data){
        //装入list
        $importBuffer.bootstrapTable('append', _.map(data,function(row){
            row.tid = getID();
            return row;
        }));
        $importBuffer.bootstrapTable('scrollTo', 'bottom');
    }

    /** 添加入缓冲区 */
    $form.submit(function () {
        var data = _.reduce($form.serializeArray(), function (memo, iter) {
            memo[iter.name] = iter.value;
            return memo;
        }, {});

        appendData(data);

        return false;
    });
    /** 导入缓冲区 */
    $('#file_addEnter').change(function(e){
        var files = e.target.files;
        if(files.length === 0)return;
        //读取第一个文件
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {type: 'binary'});           //工作簿
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];    //工作表
            /*console.log(XLSX.utils.sheet_to_json(worksheet));*/

            var IDs = [
                'exam_site_code', 'name', 'sex', 'birthday',
                'id_type', 'id_number', 'nationality', 'career',
                'degree_of_education', 'training_type', 'subject_code',
                'post_code', 'address', 'email', 'phone', 'remark'
            ];
            appendData(_.map(XLSX.utils.sheet_to_json(worksheet),function(row){
                return _.defaults(_.pick(row,IDs),{
                    'post_code':'',
                    'address':'',
                    'phone':'',
                    'remark':''
                });
            }));

        };
        reader.readAsBinaryString(file);
    });

    /** 数据提交 */
    $('.add',$root).click(function(){
        if(confirm('确定添加？'))
            Upload(false,$importBuffer,$('.err_msg',$root));
    });

    $('.forceAdd',$root).click(function(){
        if(confirm('确定添加？'))
            Upload(true,$importBuffer,$('.err_msg',$root));
    });

    /** 中断处理对话框 */
    var showInterruptHandler = (function(){
        var self = this;
        var dialog = null;
        function init(){
            dialog = $('.addEnter-interruptHandle',$root);
            dialog.find('.action1').click(function(){
                self.msg = 1;
                dialog.modal('hide');
            });
            dialog.find('.action2').click(function(){
                //2.强制添加当前项，不改变后面的添加方式
                self.msg = 2;
                dialog.modal('hide');
            });
            dialog.find('.action3').click(function(){
                //3.强制添加当前项与之后的数据项
                self.msg = 3;
                dialog.modal('hide');
            });
            dialog.on('hidden.bs.modal',function(){
                if(typeof self.onHidden === 'function') self.onHidden(self.msg);
            });
        }

        return function(msg,onHidden){
            if(!dialog) init();
            dialog.find('.msg').text(msg);
            self.onHidden = onHidden;
            dialog.modal({
                backdrop:'static',
                keyboard:false
            });
        }
    })();

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
                        showInterruptHandler(XHR.responseText,function(msg){
                            switch(msg) {
                                case 1:     //1.中断传输，回去修改
                                    $processContent.empty();
                                    break;
                                case 2:     //2.强制添加当前项，不改变后面的添加方式
                                    submitData(true,true);
                                    break;
                                case 3:     //3.强制添加当前项与之后的数据项
                                    submitData(true);
                                    break;
                            }
                        });
                    }
                });
            }

        }
    }

    /*$('.forceAdd',$root).click(function(){
     $form.find('input[name="force"]').val('true');
     });
     $('.add',$root).click(function(){
     $form.find('input[name="force"]').val('false');
     });
     $form.ajaxForm({
     success:function(data){
     showMsg($('.err_msg',$root),'success',data);
     },
     error:function(xhr){
     showMsg($('.err_msg',$root),'danger',xhr.responseText);
     },
     resetForm:true
     });*/
});