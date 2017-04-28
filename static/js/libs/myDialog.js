/**
 * Created by tastycarb on 2017/4/21.
 */

    // the base DOM structure needed to create a modal
(function(){

    var exports = {};


    var templates = {
        dialog: "<div class='modal myDialog' tabindex='-1' role='dialog'>" +
        "<div class='modal-dialog'>" +
        "<div class='modal-content'>" +
        "<div class='modal-body'></div>" +
        "</div>" +
        "</div>" +
        "</div>",
        header: function (title, closeBtn) {
            if(title === '') return '';
            var re = '<div class="modal-header">';
            if (closeBtn === true) re += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            if (title) re += '<h4 class="modal-title">' + title + '</h4>';
            re += '</div>';
            return re;
        },
        footer: function (ok, cancel) {
            var re = '<div class="modal-footer">';
            if (ok === true) re += '<button type="button" class="btn btn-primary ok">确定</button>';
            if (cancel === true) re += '<button type="button" class="btn btn-default cancel">取消</button>';
            re += '</div>';
            return re;
        }
    };

    exports.dialog = function(option){
        var opt = {
            //msg & $body  required
            title:'',
            closeBtn:true,
            size:'middle',
            okBtn:true,
            cancelBtn:true,
            backdrop:'static',
            keyboard:true,
            show:true
            //init => ($modal,re)
            //onShown => ($modal,re)
            //onHide => ($modal,re)
            //response => (re)
        };


        if($('body').find('.myDialog').length != 0){
            console.warn('dialog already shown');
            return;
        }
        if(typeof option.msg === 'undefined' && typeof option.$body === 'undefined'){
            console.warn('msg & $body required');
            return;
        }
        $.extend(opt,option);

        var $el = $(templates.dialog);
        var $body = $el.find('.modal-body');
        var re = {};
        //组装头尾
        $body.before($(templates.header(opt.title,opt.closeBtn)))
            .after($(templates.footer(opt.okBtn,opt.cancelBtn)));
        //添加主体
        if(opt.msg) $body.html(opt.msg);
        else if(opt.$body) $body.append(opt.$body);
        else $body.append(opt.init(re));

        //初始化
        if(opt.init){
            opt.init($el,re);
        }

        //添加响应回调

        $el.find('.ok').click(function(){
            if(opt.response) $el.on('hidden.bs.modal',function(){
                re.state = 'ok';
                opt.response(re);
            });
            $el.modal('hide');
        });
        $el.find('.cancel').click(function(){
            if(opt.response) $el.on('hidden.bs.modal',function(){
                re.state = 'cancel';
                opt.response(re);
            });
            $el.modal('hide');
        });

        if(opt.onShown) $el.on('shown.bs.modal',function(){
            opt.onShown($el,re);
        });
        if(opt.onHide) $el.on('hide.bs.modal',function(){
            return opt.onHide($el,re);
        });

        $el.on('hidden.bs.modal',function(){
            $('.myDialog').remove();
        });

        //加入DOM并显示
        $('body').append($el);
        $el.modal(opt);
    };

    exports.alert = function(msg,onRespone){
        exports.dialog({
            msg:msg,
            closeBtn:false,
            cancelBtn:false,
            response:onRespone
        });
    };

    exports.confirm = function(msg,onRespone){
        exports.dialog({
            msg:msg,
            closeBtn:false,
            response:onRespone
        });
    };

    if(typeof window !== 'undefined') window.myDialog = exports;

})();
