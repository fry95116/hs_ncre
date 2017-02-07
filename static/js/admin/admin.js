/**
 * Created by tom smith on 2017/2/2.
 */
$(document).ready(function() {
    //注销按钮
    var btn_quit = $('.btn-quit');
    var hyperlink = btn_quit.children('a');

    hyperlink.mousedown(function() {
        btn_quit.addClass('active');
    }).mouseup(function() {
        btn_quit.removeClass('active');
    });

    //主页按钮
    var btn_main = $('.btn-main');

    btn_main.mousedown(function() {
        btn_main.addClass('active');
    }).mouseup(function() {
        btn_main.removeClass('active');
    });

    //路由
    var showFuncView = function(id){
        var $el = $('nav .navbar-nav:eq(0) a[href="#' + id + '"]').parent();
        $el.addClass('active').siblings().removeClass('active');
        //
        var view = $('#' + id);
        view.siblings('.funcContent').hide();
        view.show();
    }

    var showSubFuncView = function(id,subid){
        //
        if(!$('#' + id).is(':visible')) showFuncView(id);
        //
        var $el = $('#' + id).find('.subFuncList ' + '[value=' + subid + ']');
        $el.addClass('active').siblings().removeClass('active');
        $el.parents('.funcContent').find('.breadcrumb a:eq(1)').text($el.text());
        //
        var subView = $('#' + id).find('#' + subid);
        subView.siblings('.subFuncContent').hide();
        subView.show();
    }

    var routes={
        'enterManage':function(){showFuncView('enterManage')},
        'enterManage/addEnter':function(){showSubFuncView('enterManage','addEnter')},
        'enterManage/blackList':function(){showSubFuncView('enterManage','blackList')},
        'enterManage/enterList':function(){showSubFuncView('enterManage','enterList')},
        'systemState':function(){showFuncView('systemState')},
        'configs':function(){showFuncView('configs')},
        'testRoomArrange':function(){showFuncView('testRoomArrange')}
    };

    var router = Router(routes);
    router.init();


});