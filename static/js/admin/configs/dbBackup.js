/**
 * Created by tastycarb on 2017/2/21.
 */
$(document).ready(function(){

    var $root = $('#dbBackup');

    //表单提交
    $('form',$root).ajaxForm({
        success:function(msg){
            showMsg($('.message',$root),'success',msg);
            loadData();
        },
        error:function(xhr){
            showMsg($('.message',$root),'danger','Error：' + xhr.responseText);
            loadData();
        }
    });

    function loadData(){
        $.get('/admin/configs/dbBackup', function(data){
            $('form input[name="schedule"]',$root).val(data.schedule);
        });
    }

    $('form .refresh',$root).click(function(){
        loadData();
    });
    loadData();

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
});