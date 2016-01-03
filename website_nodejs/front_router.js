/**
 * Created by tomtoo on 2015/12/7.
 */


//前端控制器
(function () {
    var router = require('express').Router(),
        _ = require('underscore'),
        async = require('async'),

        bodyparser = require('body-parser'), //解析post请求用
        cookieParser = require('cookie-parser'),
        session = require('express-session'), //session

        dbc = require('./dbc'),
        translate = require('./tr'),
        codeRef = translate.codeRef,
        tr = translate.tr,

        user_config = require('./user_config'),
        sites_info = user_config.sites_info,
        limit_rules = user_config.limit_rules,
        op_res_text = user_config.op_res_text,

        util = require('util'),
        Captchapng = require('captchapng');//验证码模块

    //中间件
    //noinspection JSUnresolvedFunction
    router.use('/submit', bodyparser.urlencoded({
        extended: true
    })); //提交请求

    //session
    router.use(cookieParser());
    router.use(session({
        name:'SESSIONID',
        secret: 'hsjszx2015',
        resave:true,
        saveUninitialized:false,
        unset:'destroy'
    }));

    function getRegInfo(callback) {
        dbc.getStatistics(function (err, res) {
            if (err) {
                callback(err);
                return;
            }
            //noinspection JSUnresolvedVariable
            var re = {};
            //get count by limit_rules
            for (var i = 0; i < limit_rules.length; ++i) {
                //for each rule
                var limit_rule = limit_rules[i];
                if (!limit_rule) {
                    callback(new Error('invalid limit_rule'));
                    return;
                }
                var count = 0;
                for (var j in limit_rule['limit_obj']) {
                    //add all limit_obj refered count
                    var limit_obj = limit_rule['limit_obj'][j];
                    //某考点某科目人数 or 考点总人数
                    count += limit_obj.subject_code ? res.subjectCount[limit_obj.exam_site_code][limit_obj.subject_code] : res.sitesCount[limit_obj.exam_site_code];
                }
                re[limit_rule.desc] = {limit: limit_rule.limitNum, count: count};
            }
            callback(null, re);
        });
    }

//主页
    router.get('/', function (req, res) {
        getRegInfo(function (err, reginfo) {
            if (err) throw err;
            res.render('welcome', {
                reg_info: reginfo
            });
        });
    });

//考生信息查询界面
    router.get('/getinfo', function (req, res) {
        if (req.query.id_number) {
            dbc.getInfo(req.query.id_number, function (err, result) {
                if (err) {
                    //console.log(err);
                    if (err === 'empty') res.render('getinfo', {
                        info: null
                    });
                } else {
                    var out = {};
                    result = result[0];
                    //组装报名信息对象
                    out[tr('exam_site_code')] = sites_info.findName(result.exam_site_code);
                    out[tr('subject_code')] = sites_info.findName(result.exam_site_code, result.subject_code);

                    result = _.omit(result, ['exam_site_code', 'subject_code']);

                    for (var key in result) {
                        out[tr(key)] = codeRef[key] ? codeRef[key].findName(result[key]) : result[key];
                    }

                    //console.log(out);
                    res.render('getinfo', {
                        info: out
                    });
                }
            });
        } else {
            res.render('op_res', {
                res: '查询格式错误',
                info: {}
            });
        }
    });

//获取验证码图片
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

//验证码检测
    router.get('/captchatest', function (req, res) {
        res.send(req.session.captcha == req.param('test').toUpperCase());
    });

//考生信息填报界面
    router.get('/fillout', function (req, res) {
        res.render('fillout', {tr: codeRef, sites_info: sites_info, error_info: ''});
    });

//重复检查
    router.get('/repeatcheck', function (req, res) {
        if (req.query.id_number) {
            dbc.repeatCheck(req.query.id_number, function (err, result) {
                if (err) res.send(err);
                else res.send(result);
            });
        }
    });

//处理提交的考生记录
    router.post('/submit', function (req, res) {

        // 对于每一次请求都做一次日志记录
        var now = Date.now();
        console.log(now.toString() + '  【【请求】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】:' + util.inspect(req.body).replace(/\n/g, ''))


        if (req.body) {
            //验证验证码
            if (!req.session || req.session.captcha != req.body.captcha.toUpperCase()) {
                res.render('op_res', {
                    res: '验证码错误',
                    info: {}
                });
                return;
            }
            //清空session
            req.session.captcha = '';


            // 将身份证中可能出现的x变成大写字母
            if (req.body.id_type == 1) {
                req.body.id_number = req.body.id_number.toUpperCase();
            }
            //生成备注
            if (req.body.is_our_school) {
                req.body.remark = '' + codeRef.department.findName(req.body.department) + req.body.student_number;
            } else {
                req.body.remark = req.body.school == '01' ? req.body.school_name : codeRef.school.findName(req.body.school);
            }
            //插入数据
            dbc.insertInfo(req.body, function (err) {
                if (err) {

                    // “数据错误”、“已存在”、“考点报滿”、“科目报滿” 而提交失败的日志记录
                    var now = Date.now();
                    console.log(now.toString() + '【【提交失败】】' + '  【错误类型】：' + err.error_type + '  【错误原因】' + util.inspect(err.err_info).replace(/\n/g, '') + util.inspect(err) + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】：' + util.inspect(req.body).replace(/\n/g, ''))

                    if (err.error_type == 'exist') {
                        res.render('op_res', {
                            res: op_res_text.exist,
                            info: {}
                        });
                    } else if (err.error_type == 'overflow') {
                        res.render('op_res', {
                            res: op_res_text.overflow,
                            info: {}
                        });
                    } else {
                        res.render('op_res', {
                            res: op_res_text.other_err,
                            data_schema_convert: tr.data_schema_convert,
                            info: err.err_info
                        });
                    }
                } else {
                    // 提交成功

                    // 提交成功的日志记录
                    var now = Date.now();
                    console.log(now.toString() + '【【提交成功】】' + '  【IP来源】:' + req.connection.remoteAddress.toString() + '  【提交的报名信息】' + util.inspect(req.body).replace(/\n/g, ''))

                    res.render('op_res', {
                        res: op_res_text.succeed,
                        info: {}
                    });
                }
            });
        }
    });
    module.exports = router;
})();