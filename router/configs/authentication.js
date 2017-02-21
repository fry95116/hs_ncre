/**
 * Created by tastycarb on 2017/2/19.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser');

    var admin_passport = require('../../user_config').admin_passport;


    //修改密码
    router.post('/password',bodyParser.urlencoded({extended:true}),function(req,res,next){
        if(req.body.old_password !== admin_passport.password){
            res.status(401).send('旧密码错误');
        }
        else if(req.body.password){
            admin_passport.password = req.body.password;
            res.send('修改成功');
        }
        else{
            res.status(401).send('新密码不能为空');
        }
    });
    module.exports = router;
})();