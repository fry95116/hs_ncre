/**
 * Created by tastycarb on 2017/2/22.
 */
$(document).ready(function(){
    $('#get_id_number').hide();
    $('#get_info').click(function(){
        $('button').fadeOut('fast',function(){$('#get_id_number').fadeIn('fast');});
    });


});