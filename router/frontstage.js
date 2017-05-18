/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        fs = require('fs'),
        Captchapng = require('captchapng'),

        AdimissionTicker = require('../model/AdmissionTicket'),
        translate = require('../tr'),                   //各类映射
        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../user_config');        //用户设置
        // sites_info = user_config.exam_sites,            //考点，科目信息
        // limit_rules = user_config.limit_rules;          //人数限制规则

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
            reg_info: {},
            functionControl:user_config.functionControl
        });
    });

    router.get('/export',function(req,res){
        AdimissionTicker.export(res);
    });

    /* 考生须知 */
    router.get('/instructions',function(req,res){
        res.render('frontStage/instructions',{isPreview:false,content:'instructions'});
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

    /** 报名阶段的路由 */
    router.all(['/getEnterInfo','/repeatcheck','/enter','/uploadPhoto'],function(req,res,next){
        if(user_config.functionControl.enter === true)
            next();
        else
            res.render('frontStage/op_res',{isPreview:true,content:'报名尚未开始或已结束'});
    },require('./frontStage/enter'));

    /** 考场信息查询 & 准考证打印阶段的路由 */
    router.all(['/getTestInfo','/AdmissionTicket.pdf'],function(req,res,next){
        if(user_config.functionControl.print === true)
            next();
        else
            res.render('frontStage/op_res',{isPreview:true,content:'考试信息查询 & 准考证打印尚未开始或已结束'});
    },require('./frontStage/print'));

    /** 分数查询阶段的路由 */
    router.all(['/getScoreInfo'],function(req,res,next){
        if(user_config.functionControl.query === true)
            next();
        else
            res.render('frontStage/op_res',{isPreview:true,content:'分数查询尚未开始或已结束'});
    },require('./frontStage/score'));

    module.exports = router;
})();