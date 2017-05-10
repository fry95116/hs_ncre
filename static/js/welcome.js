/**
 * Created by tastycarb on 2017/2/22.
 */
$(document).ready(function(){
    $('#get_id_number').hide();

    // var lis = $('#functionList li').hide();
    // (function showLis(i,length){
    //     return function(){
    //         if(i >= length) return;
    //         lis.eq(i).fadeIn(300,showLis(i+1,length));
    //     }
    // })(0,lis.length)();

    $('a.func').click(function(e){
        e.preventDefault();
        var href = $(this).attr('href');
        var method =  $(this).attr('method') || 'get';
        $('#get_id_number').attr({
            action:href,
            method:method
        });
        $('#functionList').fadeOut('fast',function(){$('#get_id_number').fadeIn('fast');});
    });

    $('#back').click(function(e){
        e.preventDefault();
        $('#get_id_number').fadeOut('fast',function(){$('#functionList').fadeIn('fast');});
    });


});