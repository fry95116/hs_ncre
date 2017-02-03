/**
 * Created by tomtoo on 2015/12/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        uuid = require('node-uuid'),
        redis = require('redis'),
        redis_config = require('./../config/LocalConfig.json').redis_config,
        redis_client = redis.createClient(redis_config),

        admin_passport = require('./../user_config').admin_passport,
        dbo = require('./../dbo');

    redis_client.on("error", function (err) {
        console.log("redis error: " + err);
    });

    router.post(['/','/enterInfo'], bodyParser.urlencoded({extended: true}));
    router.put('/enterInfo/:id_number/:field',bodyParser.urlencoded({extended: true}));

    /** 界面 */
    router.get('/',function(req,res){
        //session存在，返回主界面
        if(req.session.adminLogin === true){
            res.render('admin/admin',{username:admin_passport.username});
        }
        //session不存在，检查cookie.token
        else if(req.cookies && req.cookies.token){
            redis_client.exists('token:' + req.cookies.token,function(err,reply){
                if(err) console.log(err);
                //如果token有效，设置session，返回主界面
                else if(reply === 1){
                    res.render('admin/admin',{username:admin_passport.username});
                }
                //否则返回登陆界面
                else res.render('admin/login',{error:'离上次登录时间过长，请重新登陆。',passed:false});
            });

        }
        //session和cookies.token都不存在，返回登陆界面
        else res.render('admin/login',{error:null,passed:false});
    });

    /**
     * 登陆验证逻辑
     * @method POST
     * @param {string} nsername 用户名
     * @param {string} password 密码
     * @param {bool} keepLogin 是否保持登陆
     * @param {string} captcha 验证码
     * */
    router.post('/',function(req,res){
        if(req.body){
            if(!(req.session && req.session.captcha && req.session.captcha.toString() === req.body.captcha)){
                res.render('admin/login',{error:'验证码错误',passed:false});
            }
            else if(req.body.username === admin_passport.username && req.body.password === admin_passport.password){
                req.session.adminLogin = true;
                if(req.body.keepLogin === 'true'){
                    //保持登陆
                    var token = req.body.username + uuid.v4().replace(/-/g,'');
                    redis_client.setex('token:' + token,10800,'true'); //3小时
                    res.cookie('token',token);
                }
                res.render('admin/login',{error:null,passed:true});
            }
            else{
                res.render('admin/login',{error:'用户名或者密码不正确',passed:false});
            }
        }
    });

    /**
     * 注销
     * @method GET
     * */
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

    /** api的身份验证 */
    router.use('/*',function(req,res,next){
        if(req.session.adminLogin === true) next();
        //session不存在，检查cookie.token
        else if(req.cookies && req.cookies.token){
            redis_client.exists('token:' + req.cookies.token,function(err,reply){
                if(err) console.log(err);
                //如果token有效
                else if(reply === 1) next();
                else res.status(401).send('validate failed');
            });

        }
        else res.status(401).send('validate failed');
    });

    /**
     * 浏览报名信息
     * @method GET
     * @param {string} searchBy 搜索项
     * @param {string} searchText 搜索内容
     * @param {bool} strictMode 严格搜索模式
     * @param {string} 排序依据
     * @param {bool} desc 是否按降序排列
     * @param {number} offset 偏移
     * @param {number} limit 限制 */
    router.get('/enterInfo',function(req,res,next){
        dbo.selectInfo(req.query)
            .then(function(result){
                res.send(result);
            })
            .catch(function(err){
                console.log(err);
                res.status(400).send(err);
            });

    });
    /**
     * 添加报名信息
     * @method POST
     * @param {Array|Object} enterInfo 需要添加的报名信息
     * @param {bool} force 强制添加
     * */
    /*router.post('/enterInfo',function(req,res,next){

    });*/


    /**
     * 更新报名信息
     * @method PUT
     * @param {string} value 新的数据
     * */

    router.put('/enterInfo/:id_number/:field',function(req,res,next){
        if(req.body && req.body.value){
            var newData = {};
            newData[req.params.field] = req.body.value;
            dbo.updateInfo(req.params.id_number,newData)
                .then(function(){
                    res.send('success');
                })
                .catch(function(err){
                    console.log(err);
                    res.status(400).send('修改失败：' + err.message);
                });
        }
        else{
            res.status(400).send('no data');
        }
    });

    /**
     * 删除报名信息
     * @method DELETE
     * */
    router.delete('/enterInfo/:id_number',function(req,res,next){
        dbo.deleteInfo(req.params.id_number)
            .then(function(){
                res.send('succeed');
            })
            .catch(function(err){
                console.log(err);
                res.status(400).send('修改失败：' + err.message);
            })
    });

    /**
     * 浏览黑名单 */
    module.exports = router;
})();
