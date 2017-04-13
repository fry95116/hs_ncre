/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),
        util = require('util'),

        bodyparser = require('body-parser'),            //解析post请求用
        Captchapng = require('captchapng'),             //验证码模块

        dbo = require('../model/EnterInfo'),                      //提供各类数据操作
        translate = require('../tr'),                 //各类映射
        codeRef = translate.codeRef,                    //职业,民族,学历等项目的 名称-代码 映射
        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../user_config'),      //用户设置
        sites_info = user_config.exam_sites,            //考点，科目信息
        limit_rules = user_config.limit_rules,          //人数限制规则

        blackList = require('../model/blackList'),
        ERR = require('../ApplicationError');


    /* 组装报名人数信息，用于主页 */
    /*function getRegInfo(callback) {
        dbo.getStatistics(function (err, res) {
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
    }*/
    /* 主页 */
    router.get('/', function (req, res) {
        res.render('frontStage/welcome', {
            reg_info: {}
        });
        /*
        getRegInfo(function (err, reginfo) {
            if (err) throw err;

        });*/
    });

    /* 考生须知 */
    router.get('/instructions',function(req,res){
        res.render('frontStage/instructions');
    });

    /* 考生信息填报界面 */
    router.get('/fillout', function (req, res) {
        res.render('frontStage/fillout', {
            tr: codeRef,
            sites_info: sites_info,
            error_info: '',
            formData:''
        });
    });


    /* 考生信息查询界面 */
    router.get('frontStage/getinfo', function (req, res) {
        if (req.query.id_number) {
            dbo.getInfo(req.query.id_number, function (err, result) {
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

                    res.render('getinfo', {
                        info: out
                    });
                }
            });
        } else {
            res.status(401).send('查询格式错误');
        }
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

    /* 验证码检测 */
    router.get('/captchatest', function (req, res) {
        res.send(req.session.captcha == (req.query.test).toUpperCase());
    });


    /* 重复检查 */
    router.get('/repeatcheck', function (req, res, next) {
        if (req.query.id_number != '') {
            dbo.repeatCheck(req.query.id_number)
                .then(function(){
                    res.send(true);
                })
                .catch(function(){
                    res.send(false);
            });
        }
        else{
            res.send(false);
        }
    });

    /* 处理提交的考生记录 */
    router.post('/fillout',bodyparser.urlencoded({extended: true}),function (req, res) {

        //验证验证码
        if (!req.session || req.session.captcha != req.body.captcha.toUpperCase()) {
            res.render('frontStage/fillout', {
                tr: codeRef,
                sites_info: sites_info,
                error_info: '{"captcha":"invalid data"}',
                formData: JSON.stringify(req.body)
            });
            return;
        }
        //清空session
        req.session.captcha = '';

        //生成备注
        if (req.body.is_our_school) {
            req.body.remark = '' + codeRef.department.findName(req.body.department) + req.body.student_number;
        } else {
            req.body.remark = req.body.school == '01' ? req.body.school_name : codeRef.school.findName(req.body.school);
        }

        //前期检查
        dbo.check(req.body)
            .then(_.partial(dbo.repeatCheck,req.body.id_number))
            .then(_.partial(blackList.check,req.body.id_number))
            .then(dbo.getStatistics)
            .then(dbo.checkCount)
            //添加过程
            .then(dbo.begin)
            .then(_.partial(dbo.insertInfo,req.body))
            .then(dbo.getStatistics)
            .then(_.partial(dbo.checkCount,_,true))
            .then(dbo.commit)
            .then(function(){
                //日志
                res.render('frontStage/op_res',{type:'success'});
            })
            .catch(function(err){
                dbo.rollback()
                    .then(function(){
                        //日志
                        req.log.info(err.toString());
                        //无效的提交数据
                        if(err instanceof ERR.InvalidDataError){
                            res.render('frontStage/fillout', {
                                tr: codeRef,
                                sites_info: sites_info,
                                error_info: err.message,
                                formData: JSON.stringify(req.body)
                            });
                        }
                        //重复提交
                        else if(err instanceof ERR.RepeatInfoError){
                            res.render('frontStage/op_res',{type:'repeat'});
                        }
                        //人数超出
                        else if(err instanceof ERR.CountOverFlowError){
                            res.render('frontStage/op_res',{type:'overflow',msg:err.message});
                        }
                        //在黑名单中
                        else if(err instanceof ERR.BlacklistError){
                            res.render('frontStage/op_res',{type:'blackList'});
                        }
                        //未知错误
                        else{
                            res.render('frontStage/op_res',{type:'unknown'});
                        }
                    })
                    .catch(function(err){
                        //日志
                        req.log.error(err.toString());
                        //未知错误
                        res.render('frontStage/op_res',{type:'unknown'});
                    });
            });
    });
    module.exports = router;
})();