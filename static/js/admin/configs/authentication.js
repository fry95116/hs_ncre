/**
 * Created by tastycarb on 2017/2/20.
 */
$(document).ready(function(){

    var $root = $('#authentication');

    $('.form-horizontal',$root).ajaxForm({
        beforeSubmit:function(arr, $form, options){
            var formData = _.reduce(arr,function(memo,item){
                memo[item.name] = item;
                return memo;
            },{});
            if(!(formData.old_password && formData.old_password.value !== '')){
                showMsg($('.message',$root),'danger','旧密码不能为空');
            }
            else if(!(formData.password && formData.password.value !== '')){
                showMsg($('.message',$root),'danger','新密码不能为空');
            }
            else if(!(formData.repeat_password && formData.repeat_password.value !== '')){
                showMsg($('.message',$root),'danger','重复密码不能为空');
            }
            else if(formData.password.value != formData.repeat_password.value){
                showMsg($('.message',$root),'danger','新密码与重复密码不一致');
            }
            else{
                return true;
            }
            return false;
        },
        clearForm:true,
        success:function(msg){
            showMsg($('.message',$root),'success','添加成功：' + msg);
        },
        error:function(xhr){
            showMsg($('.message',$root),'danger','Error：' + xhr.responseText);
        }
    });
});