/**
 * Created by tastycarb on 2017/2/21.
 */
$(document).ready(function(){

    var $root = $('#dbBackup');

    /******************* 备份计划设置 ********************/
    //表单提交
    $('form',$root).ajaxForm({
        url:'/admin/configs/dbBackup/schedule',
        type:'put',
        success:function(msg){
            showMsg($('.message-schedule',$root),'success',msg);
            loadData();
        },
        error:function(xhr){
            showMsg($('.message-schedule',$root),'danger','Error：' + xhr.responseText);
        }
    });

    function loadData(){
        $.getJSON('/admin/configs/dbBackup/schedule', function(data){
            $('form input[name="schedule"]',$root).val(data.schedule);
        });
    }

    loadData();
    /**************** crontab表达式生成器 *****************/
    var $crontabGenerator = $('#crontabGenerator');
    //tab
    $('.nav li',$crontabGenerator).click(function(){
        var $this = $(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        var focus = $this.attr('segment');

        $('.' + focus,$crontabGenerator).show().siblings('.content').hide();
    });
    //计算crontab表达式
    $('.calculate',$crontabGenerator).click(function(){

        var exp = 'minutes hours days mouths weeks';        //表达式
        //计算过程
        $('.content',$crontabGenerator).each(function(){
            var $content = $(this);                                                     //当前content
            var segment = $content.attr('segment');
            var $checked_type = $content.find('input[type="radio"]:checked').parent();   //选中的方式
            var type = $checked_type.attr('mode');
            //每天
            if(type === 'each') exp = exp.replace(segment,'*');
            //间隔n天
            else if(type === 'interval') {
                exp = exp.replace(segment,'*/' + $content.find('select').val());
            }
            //固定n日
            else if(type === 'stable'){
                exp = exp.replace(segment,$content.find('select').val());
            }
            //从m日至n日
            else if(type === 'contain'){
                var from = $content.find('select:eq(0)').val();
                var to = $content.find('select:eq(1)').val();
                if(from > to){
                    exp = '错误（' + segment + '）:开始时间必须小于结束时间.'
                    return false;
                }
                else{
                    exp = exp.replace(segment,from + '-' +to);
                }
            }
            else if(type === 'none') exp = exp.replace(segment,'?');
            return true;
        });
        $('.result',$crontabGenerator).val(exp);    //显示结果
    });

    /****************** 备份管理 & 还原 *******************/



    var $dumpList = $('table.dumpList',$root);
    $dumpList.bootstrapTable({
        url:'/admin/configs/dbBackup/dumpList',     //数据URL
        idField:'id',
        /* 翻页 */
        pagination:true,
        sidePagination:'server',
        search:true,
        showRefresh:true,
        showToggle:true,
        buttonsClass:'primary',
        toolbar:'#dbBackup .toolbar',
        onPostBody:function(){
            //删除按钮
            $dumpList.find('.restore').click(function(){
                var url = $(this).attr('url');
                myDialog.confirm('确认还原到这个时间点?',function(re){
                    if(re.state === 'ok'){
                        $.ajax({
                            url:url,
                            type:'put',
                            success:function(){
                                showMsg($('.message-dumplist',$root),'success','还原成功');
                                $dumpList.bootstrapTable('refresh');
                            },
                            error:function(XHR){
                                showMsg($('.message-dumplist',$root),'danger','还原失败:' + XHR.responseText);
                            }
                        });
                    }
                });

            });
        },
        columns: [{
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle'
        }, {
            field:'atime',
            title:'备份时间',
            formatter:function(val,col,index){
                return '<div class="cell">' + new Date(val).toLocaleString() + '</div>';
            }
        },{
            field:'operator',
            title:'操作',
            formatter:function(val,col,index){
                return '<a class="restore" href="javascript:void(0)" url="/admin/configs/dbBackup/dumpList/' + col.id + '">还原</a>';
            }
        }]
    });

    var $toolbar = $('.toolbar',$root);


    //删除按钮
    $toolbar.find('.dump').click(function(){
        $.ajax({
            url:'/admin/configs/dbBackup/dumpList',
            type:'post',
            success:function(){
                showMsg($('.message-dumplist',$root),'success','删除成功');
                $dumpList.bootstrapTable('refresh');
            },
            error:function(XHR){
                showMsg($('.message-dumplist',$root),'danger','删除失败:' + XHR.responseText);
            }
        });
    });
    //删除按钮
    $toolbar.find('.delete').click(function(){

        var data_del = $dumpList.bootstrapTable('getSelections'); //要删除的数据
        if(data_del.length != 0){
            if(!confirm('确定删除所选信息?')) return;
            //并行删除
            var succeed = 0;
            _.each(data_del,function(row){
                $.ajax({
                    url:'/admin/configs/dbBackup/dumpList/' + row.id,
                    type:'delete',
                    success:function(){
                        succeed++;
                        if(succeed = data_del.length) {
                            showMsg($('.message-dumplist',$root),'success','删除成功');
                            $dumpList.bootstrapTable('refresh');
                        }
                    },
                    error:function(){
                        console.log('删除失败:' + row.id);
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
            url:'/admin/configs/dbBackup/dumpList',
            type:'delete',
            success:function(){
                showMsg($('.message-dumplist',$root),'success','删除成功');
                $dumpList.bootstrapTable('refresh');
            },
            error:function(){
                console.log('删除失败:' + row.id_number);
                $dumpList.bootstrapTable('refresh');
            }
        });
    });


});