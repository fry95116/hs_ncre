/**
 * Created by tomtoo on 2015/12/7.
 */
(function () {
    var router = require('express').Router(),
        uuid = require('node-uuid'),
	    Captchapng = require('captchapng'),             //验证码模块
        bodyParser = require('body-parser'),

        redis = require('redis'),
        redis_config = require('./../config/LocalConfig.json').redis_config,
        redis_client = redis.createClient(redis_config),
        log = require('../Logger'),

        admin_passport = require('./../user_config').admin_passport;

    redis_client.on("error", function (err) {
        log.info("redis error: " + err);
    });


    /** 界面 */
    router.get('/', function (req, res) {
        //session存在，返回主界面
        if (req.session.adminLogin === true) {
            res.render('admin/admin', {username: admin_passport.username});
        }
        //session不存在，检查cookie.token
        else if (req.cookies && req.cookies.token) {
            redis_client.exists('token:' + req.cookies.token, function (err, reply) {
                if (err) req.log.info(err);
                //如果token有效，设置session，返回主界面
                else if (reply === 1) {
                    res.render('admin/admin', {username: admin_passport.username});
                }
                //否则返回登陆界面
                else res.render('admin/login', {error: '离上次登录时间过长，请重新登陆。', passed: false});
            });

        }
        //session和cookies.token都不存在，返回登陆界面
        else res.render('admin/login', {error: null, passed: false});
    });

    /* 获取验证码图片 */
	router.get('/captcha', function (req, res) {

		//六位随机数验证码

		var num_captcha = parseInt(Math.random() * 900000 + 100000);
		req.session.captcha = num_captcha;
		var captcha = new Captchapng(158, 37, num_captcha);
		captcha.color(255, 255, 255, 255);  // First color: background (red, green, blue, alpha)
		captcha.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

		res.writeHead(200, {
			'Content-Type': 'image/png'
		});
		res.end(new Buffer(captcha.getBase64(), 'base64'));

	});

    /**
     * 登陆验证逻辑
     * @method POST
     * @param {string} nsername 用户名
     * @param {string} password 密码
     * @param {bool} keepLogin 是否保持登陆
     * @param {string} captcha 验证码
     * */
    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res, next) {
        if (req.body) {
            if (!(req.session && req.session.captcha && req.session.captcha.toString() === req.body.captcha)) {
                res.render('admin/login', {error: '验证码错误', passed: false});
            }
            else if (req.body.username === admin_passport.username && req.body.password === admin_passport.password) {
                req.session.adminLogin = true;
                if (req.body.keepLogin === 'true') {
                    //保持登陆
                    var token = req.body.username + uuid.v4().replace(/-/g, '');
                    redis_client.setex('token:' + token, 10800, 'true'); //3小时
                    res.cookie('token', token);
                }
                res.render('admin/login', {error: null, passed: true});
            }
            else {
                res.render('admin/login', {error: '用户名或者密码不正确', passed: false});
            }
        }
    });

    /**
     * 注销
     * @method GET
     * */
    router.get('/logout', function (req, res) {
        if (req.session && typeof req.session.adminLogin != 'undefined') {
            delete req.session.adminLogin;
        }
        if (req.cookies && typeof req.cookies.token != 'undefined') {
            redis_client.del('token:' + req.cookies.token);
            res.clearCookie('token');
        }
        res.redirect('/admin');
    });

    /*api*/

    /** api的身份验证 */
    router.use('/*', function (req, res, next) {
        if (req.session.adminLogin === true) next();
        //session不存在，检查cookie.token
        else if (req.cookies && req.cookies.token) {
            var key = 'token:' + req.cookies.token;
            redis_client.exists(key, function (err, reply) {
                if (err) req.log.info(err);
                //如果token有效,重设过期时间
                else if (reply === 1) {
                    redis_client.expire(key,10800,function(err){
                        if(err) req.log.info(err);
                        else next();
                    });
                }
                else res.status(401).send('validate failed');
            });

        }
        else res.status(401).send('validate failed');
    });

    router.use('/enterManage/enterInfo',require('./enterManage/enterInfo'));
    router.use('/enterManage/blackList',require('./enterManage/blackList'));

    router.use('/configs/authentication',require('./configs/authentication'));
    router.use('/configs/dbBackup',require('./configs/dbBackup'));
    module.exports = router;
})();
