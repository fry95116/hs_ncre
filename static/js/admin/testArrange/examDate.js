/**
 * Created by tastycarb on 2017/4/28.
 */

$(document).ready(function(){
    var $root = $('#examDate');


    /** 日程管理 */
    var $form_date = $('form:eq(0)',$root);

    _.each(['enter','print','query'],function(section){

        var $from = $form_date.find('input.Mydate[name="' + section + 'Start"]');
        var $until = $form_date.find('input.Mydate[name="' + section + 'End"]');

        $from.datetimepicker({
            format:'YYYY-MM-DDTHH:mm:ssZZ',
            showTodayButton:true
        }).on('dp.change',function(e){
            var untilDate = $until.data('DateTimePicker').date();
            if(_.isNull(e.date) || _.isNull(untilDate)) return;
            else if(e.date.toDate() > untilDate.toDate())
                $until.data('DateTimePicker').date(e.date.toDate());
        });

        $until.datetimepicker({
            format:'YYYY-MM-DDTHH:mm:ssZZ',
            showTodayButton:true
        }).on('dp.change',function(e){
            var fromDate = $from.data('DateTimePicker').date();
            if(_.isNull(e.date) || _.isNull(fromDate)) return;
            else if(fromDate.toDate() > e.date.toDate())
                $from.data('DateTimePicker').date(e.date.toDate());
        });
    });

    function resetDate(){
        $.getJSON('/admin/testArrange/examDate',function(res){
            _.each(res,function(value,key){
                $form_date.find('input.Mydate[name="' + key + '"]').data("DateTimePicker").date(new Date(value));
            });
        });
    }
    $form_date.find('.reset').click(resetDate).trigger('click');

    //表单
    $form_date.ajaxForm({
        url:'/admin/testArrange/examDate',
        type:'post',
        beforeSerialize:function($form,opt){

            var dates = _.reduce($form.serializeArray(),function(memo,el){
                memo[el.name] =  Date.parse(new Date(el.value));
                return memo;
            },{});

            if(dates.enterStart > dates.printStart){
                showMsg($form_date.find('.message'),'danger','报名开始时间应早于准考证打印开始时间');
                return false
            }
            else if(dates.queryStart < Math.max(dates.enterEnd,dates.printEnd)) {
                showMsg($form_date.find('.message'), 'danger', '分数应在报名和准考证打印都结束后开始');
                return false;
            }
            else return true;
        },
        success:function(msg){
            showMsg($form_date.find('.message'),'success','设置成功：' + msg);
            resetDate();
        },
        error:function(xhr){
            showMsg($form_date.find('.message'),'danger','设置失败：' + xhr.responseText);
            resetDate();
        }
    });

    /** 功能控制 */
    var $form_function = $('form:eq(1)',$root);
    function resetFunction(){
        $.getJSON('/admin/testArrange/functionControl',function(res){
            _.each(res,function(value,key){
                if(value === true) {
                    $form_function.find('input[name="' + key + '"]').attr('checked', true).prop('checked', true);
                }
                else {
                    $form_function.find('input[name="' + key + '"]').removeAttr('checked').prop('checked', false);
                }
            });
        });
    }
    $form_function.find('.reset').click(resetFunction).trigger('click');

    //表单
    $form_function.ajaxForm({
        url:'/admin/testArrange/functionControl',
        type:'post',

        success:function(msg){
            showMsg($form_function.find('.message'),'success','设置成功：' + msg);
            resetDate();
        },
        error:function(xhr){
            showMsg($form_function.find('.message'),'danger','设置失败：' + xhr.responseText);
            resetDate();
        }
    });

});