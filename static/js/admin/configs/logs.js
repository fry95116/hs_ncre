/**
 * Created by tastycarb on 2017/4/20.
 */
$(document).ready(function(){
    var $root = $('#logs');
    var $logs = $('.logs', $root);

    var formatter_date = function(val,col,index){
        return new Date(val).toLocaleString();
    };

    //参数列表
    var $form = $('.form-inline',$root);

    var $from = $form.find('input[name="from"]',$root);
    var $until = $form.find('input[name="until"]',$root);
    var $limit = $form.find('input[name="limit"]',$root);

    $from.datetimepicker({
        format:'YYYY-MM-DDTHH:mm:ssZZ',
        showTodayButton:true,
        defaultDate: new Date(_.now() - 24 * 3600 * 1000)
    }).on('dp.change',function(e){
        if(e.date.toDate() > $until.data('DateTimePicker').date().toDate()){
            $until.data('DateTimePicker').date(e.date.toDate());
        }
        else if(e.date.toDate() > new Date()){
            $from.data('DateTimePicker').date(new Date());
        }
    });

    $until.datetimepicker({
        format:'YYYY-MM-DDTHH:mm:ssZZ',
        showTodayButton:true,
        defaultDate: new Date()
    }).on('dp.change',function(e){
        if($from.data('DateTimePicker').date().toDate() > e.date.toDate()){
            $from.data('DateTimePicker').date(e.date.toDate());
        }
        else if(e.date.toDate() > new Date()){
            $until.data('DateTimePicker').date(new Date());
        }
    });


    $logs.bootstrapTable({
        url:'/admin/configs/logs',     //数据URL
        classes:'table table-no-bordered table-condensed',
        /* 组装查询参数 */
        queryParams:function(params){

            return {
                from:$from.val(),
                until:$until.val(),
                limit:$limit.val()
            }
        },
        rowStyle:function(row,index){
            switch(row.level){
                case 'warn': return {classes:'warning text-nowrap'};
                case 'error': return {classes:'danger text-nowrap'};
            }
            return {classes:'text-nowrap'};
        },
        columns: [{
            field: 'level',
            title: '级别'
        }, {
            field: 'timestamp',
            title: '时间',
            formatter:formatter_date
        }, {
            field: 'remoteAddress',
            title: '请求IP'
        }, {
            field: 'method',
            title: '请求类型'
        }, {
            field: 'url',
            title: 'URL'
        },  {
            field: 'message',
            title: '信息'
        }]
    });

    $form.find('button').click(function(){
        $logs.bootstrapTable('refresh');
    });



});
