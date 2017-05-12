/**
 * Created by tastycarb on 2017/5/11.
 */
$(document).ready(function(){
    $('#photoFile').css({position:'absolute',clip:'rect(0 0 0 0)'});
    $('label[for="photoFile"]').addClass('btn');
    $('.fileNameShower').show();

    $('#photoFile').change(function(){
        $('.fileNameShower').val($('#photoFile').val());
    });
});
