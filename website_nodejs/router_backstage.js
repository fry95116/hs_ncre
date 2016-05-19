/**
 * Created by tomtoo on 2015/12/7.
 */
(function(){
    var router = require('express').Router(),
        cookieParser = require('cookie-parser'),
        session = require('express-session'),
        admin_passport = require('./user_config').admin_passport; //session

    //session
    router.use(cookieParser());
    router.use(session({
        name:'access-token',
        secret:'hsjszx2015',
        saveUninitialized:false,
        resave:false,
        unset:'destroy'
    }));

    /*view*/
    router.get('/',function(req,res){
        res.redirect('./login');
    });

    //登陆界面
    router.get('/login',function(req, res){
        res.render('admin/login');
    });

    //主界面
    router.get('/config',function(req,res){
        res.render('admin/mainPanel');
    });

    /*api*/

    //账户验证
    router.use('/api',function(req,res,next){

        if(req.sessionID){
            next();
        }
        else{
            if(req.param('fromBrowser') == 'true') {
                res.session = null;
                res.redirect(res.baseUrl + '/login');
            }
            else{
                res.send({err:'invalid token'});
            }
        }
    });

    router.get('/api/token',function(req,res){

        if(req.param('fromBrowser') == 'true'){
            res.session.expire = Date.now() + 30 * 60 * 1000;
            res.redirect(req.baseUrl + '/config');
        }
        else{
            res.send({
                'access-token': res.sessionID
            });

        }
    });

    module.exports = router;
})();
