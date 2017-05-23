/**
 * Created by tastycarb on 2017/5/9.
 */
$(document).ready(function(){

    $root = $('#templateManage');

    var $editor = $('.templateEditor',$root);
    $editor.summernote({
        lang:'zh-CN',
        toolbar: [
            ['misc', ['undo', 'redo', 'codeview']],
            ['insert', ['link', 'table', 'hr']],
            ['font',['fontname', 'fontsize']],
            ['fontStyle', ['color','bold', 'italic','underline', 'strikethrough']],
            ['fontStyle2',['superscript', 'subscript', 'clear']],
            ['para', ['style', 'ol', 'ul', 'paragraph', 'height']]
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                if($editor.data('changed') === false) $editor.data('changed',true);
            }
        }
    });

    //加载数据
    function loadTemplateContent(text,value){
        $.get('/admin/configs/templateManage/' + value,function(data){
            $('.current_templateName',$root).text(text);          //修改下拉菜单的名字
            $editor.data('editing_text',text);                    //当前编辑的模板名
            $editor.data('editing_value',value);                  //当前编辑的模板
            $('.templateEditor',$root).summernote('code',data);
            $editor.data('changed',false);
        });
    }
    //下拉菜单
    $('.templateName li>a',$root).click(function(){

        var text = $(this).text();
        var value = $(this).attr('value');

        if($editor.data('changed') === true) myDialog.confirm('是否放弃对模板 ' + $editor.data('editing_text') + ' 的更改',function(re){
            if(re.state === 'ok') loadTemplateContent(text,value);
        });
        else loadTemplateContent(text,value);
    });



    //iframe自适应高度
    $('.previewWindow',$root).load(function () {
        $(this).height($(this).contents().find("body").height() + 30);
    });

    //重新加载按钮
    $('.reload',$root).click(function(){
        var text = $editor.data('editing_text');
        var value = $editor.data('editing_value');
        if(_.isString(text) && _.isString(value)){
            if($editor.data('changed') === true) myDialog.confirm('是否放弃对模板 ' + text + ' 的更改',function(re){
                if(re.state === 'ok') loadTemplateContent(text,value);
            });
            else loadTemplateContent(text,value);
        }
    });

    //预览按钮
    $('.preview',$root).click(function(){
        if(_.isUndefined($editor.data('editing_value'))) return;
        $.ajax({
            url:'/admin/configs/templateManage/preview/' + $editor.data('editing_value'),
            type:'post',
            data:{content:$('.templateEditor',$root).summernote('code')},
            success:function(data){
                $('.previewWindow',$root).attr('srcdoc',data);

            },
            error:function(){
                showMsg($('.message',$root),'danger','无法预览');
            }
        });
    });

    //保存按钮
    $('.save',$root).click(function(){
        if(_.isUndefined($editor.data('editing_value'))) return;
        $.ajax({
            url:'/admin/configs/templateManage/' + $editor.data('editing_value'),
            type:'put',
            data:{content:$('.templateEditor',$root).summernote('code')},
            success:function(data){
                $editor.data('changed',false);
                showMsg($('.message',$root),'success','保存成功');
            },
            error:function(){
                showMsg($('.message',$root),'danger','保存失败');
            }
        });
    });
});