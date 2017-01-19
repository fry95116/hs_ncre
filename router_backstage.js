/**
 * Created by tomtoo on 2015/12/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        uuid = require('node-uuid'),
        redis = require('redis'),
        redis_config = require('./config/LocalConfig.json').redis_config,
        redis_client = redis.createClient(redis_config);

        admin_passport = require('./user_config').admin_passport;

    redis_client.on("error", function (err) {
        console.log("redis error: " + err);
    });

    router.use('/',function(req,res,next){
        if(req.url == '/') next();
        else next();
    });

    router.post('/', bodyParser.urlencoded({
        extended: true
    })); //登陆验证

    /*view*/
    router.get('/',function(req,res){
        if(req.session.adminLogin === true){
            res.render('admin/admin',{username:admin_passport.username});
        }
        else if(req.cookies && req.cookies.token){
            redis_client.exists('token:' + req.cookies.token,function(err,reply){
                if(err) console.log(err);
                else if(reply === 1){
                    req.session.adminLogin = true;
                    res.render('admin/admin',{username:admin_passport.username});
                }
                else res.render('admin/login',{error:'离上次登录时间过长，请重新登陆。'});
            });

        }
        else res.render('admin/login',{error:null});
    });

    //登陆验证逻辑
    router.post('/',function(req,res){
        if(req.body){
            if(!(req.session && req.session.captcha.toString() === req.body.captcha)){
                res.render('admin/login',{error:'验证码错误'});
            }
            else if(req.body.username === admin_passport.username && req.body.password === admin_passport.password){
                req.session.adminLogin = true;
                if(req.body.keepLogin === 'true'){
                    //保持登陆
                    var token = req.body.username + uuid.v4().replace(/-/g,'');
                    redis_client.setex('token:' + token,10800,'true'); //3小时
                    res.cookie('token',token);
                }
                res.render('admin/admin',{username:admin_passport.username});
            }
            else{
                res.render('admin/login',{error:'用户名或者密码不正确'});
            }
        }
    });


    router.get('/logout',function(req,res){
       if(req.session && typeof req.session.adminLogin != 'undefined'){
           delete req.session.adminLogin;
       }
       if(req.cookies && typeof req.cookies.token != 'undefined'){
           redis_client.del('token:' + req.cookies.token);
           res.clearCookie('token');
       }
       res.redirect('/admin');
    });

    /*api*/

    module.exports = router;
})();
