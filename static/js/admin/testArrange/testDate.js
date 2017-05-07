/**
 * Created by tastycarb on 2017/4/28.
 */

$(document).ready(function(){
    var $root = $('#testDate');

    $('input.Mydate',$root).datetimepicker({
        format:'YYYY-MM-DDTHH:mm:ssZZ',
        showTodayButton:true
    });

    $.getJSON('/admin/configs/')

});