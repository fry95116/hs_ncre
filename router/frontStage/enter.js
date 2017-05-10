/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),

        bodyparser = require('body-parser'),            //解析post请求用

        dbo = require('../../model/EnterInfo'),            //提供各类数据操作
        data_schema = require('../../data_schema'),
        translate = require('../../tr'),                   //各类映射
        codeRef = translate.codeRef,                    //职业,民族,学历等项目的 名称-代码 映射
        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../../user_config'),        //用户设置
        sites_info = user_config.exam_sites,            //考点，科目信息

        blackList = require('../../model/BlackList'),
        ERR = require('../../ApplicationError');

    /* 考生信息填报界面 */
    router.get('/enter', function (req, res) {
        res.render('frontStage/enter', {
            tr: codeRef,
            sites_info: sites_info,
            error_info: '',
            formData:''
        });
    });


    /* 考生信息查询界面 */
    router.get('/getEnterInfo', function (req, res) {
        if (req.query.id_number) {
            dbo.getConnection()
                .then(function(con){
                    dbo.selectInfo(con,{searchBy:'id_number',searchText:req.query.id_number,strictMode:true})
                        .then(function(result){
                            //查询为空
                            if(result.total === 0) {
                                res.render('frontStage/getEnterInfo', {info: null});
                            }
                            else{
                                var out = {};
                                result = _.pick(result.rows[0],_.keys(data_schema));

                                //组装报名信息对象
                                var examSite = _.find(sites_info,function(el){return el.code == result.exam_site_code;});
                                if(_.isNil(examSite)){
                                    out[tr('exam_site_code')] = '未知';
                                    out[tr('subject_code')] = '未知'
                                }
                                else if(_.isNil(examSite.subjects)){
                                    out[tr('subject_code')] = '未知';
                                }else{
                                    out[tr('exam_site_code')] = '(' + examSite.code + ')' + examSite.name;
                                    var subject = _.find(examSite.subjects,function(el){return el.code == result.subject_code;});
                                    if(_.isNil(subject)) out[tr('subject_code')] = '未知';
                                    else out[tr('subject_code')] = '(' + subject.code + ')' + subject.name;
                                }

                                //其他信息
                                result = _.omit(result, ['exam_site_code', 'subject_code']);

                                for (var key in result) {
                                    // out[tr(key)] = codeRef[key] ? codeRef[key].findName(result[key]) : result[key];
                                    if(!_.isNil(codeRef[key]))
                                        out[tr(key)] =  '(' + result[key] + ')' + codeRef[key].findName(result[key]);
                                    else
                                        out[tr(key)] = result[key] ;
                                }

                                res.render('frontStage/getEnterInfo', {
                                    info: out
                                });
                            }

                        })
                        .catch(function(err){
                            req.log.error('报名信息_查询_失败',{err:err});
                            res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                        })
                        //释放连接
                        .finally(_.partial(dbo.release,con));
                })
                .catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
            });
        } else {
            res.render('frontStage/op_res',{isPreview:true,content:'请输入证件号'});
        }
    });


    /* 重复检查 */
    router.get('/repeatcheck', function (req, res, next) {
        if (req.query.id_number != '') {

            dbo.getConnection().then(function(con){
                //前期检查
                dbo.repeatCheck(con,req.query.id_number)
                    .then(function(){
                        res.send(true);
                    })
                    .catch(function(err){
                        res.send(false);
                    })
                    //释放连接
                    .finally(function(){
                        dbo.release(con);
                    });
            }).catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
            });


        }
        else{
            res.send(false);
        }
    });

    /* 处理提交的考生记录 */
    router.post('/enter',bodyparser.urlencoded({extended: true}),function (req, res) {

        //验证验证码
        if (!req.session || req.session.captcha != req.body.captcha.toUpperCase()) {
            res.render('frontStage/enter', {
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

        //正常添加
        dbo.getConnection().then(function(con){
            //前期检查
            dbo.check(req.body)
                .then(_.partial(dbo.repeatCheck, con, req.body.id_number))
                .then(_.partial(blackList.check, con, req.body.id_number))
                .then(_.partial(dbo.getStatistics, con))
                .then(_.partial(dbo.checkCount,req.body, _, false))
                //添加过程
                .then(_.partial(dbo.begin, con))
                .then(_.partial(dbo.insertInfo, con, req.body))
                .then(_.partial(dbo.getStatistics, con))
                .then(_.partial(dbo.checkCount,req.body, _, true))
                .then(_.partial(dbo.commit, con))
                .then(function () {
                    //日志
                    req.log.info('报名信息_添加_成功',{id_number:req.body.id_number});
                    res.render('frontStage/op_res',{isPreview:false,content:'success'});
                })
                .catch(function (err) {
                    dbo.rollback(con)
                        .then(function () {
                            //日志
                            req.log.error('报名信息_添加_失败',{id_number:req.body.id_number,err:err});
                            //无效的提交数据
                            if (err instanceof ERR.InvalidDataError)
                                res.send('无效的提交数据');
                            //重复提交
                            else if (err instanceof ERR.RepeatInfoError)
                                res.render('frontStage/op_res',{isPreview:false,content:'repeat'});
                            //人数超出
                            else if (err instanceof ERR.CountOverFlowError)
                                res.render('frontStage/op_res',{isPreview:false,content:'overflow'});
                            //在黑名单中
                            else if (err instanceof ERR.BlacklistError)
                                res.render('frontStage/op_res',{isPreview:false,content:'blacklist'});
                            //未知错误
                            else
                                res.render('frontStage/op_res',{isPreview:false,content:'unknown'});

                        })
                        .catch(function (err) {
                            //日志
                            req.log.error(err);
                            //未知错误
                            res.render('frontStage/templates',{isPreview:false,content:'unknown'});
                        })
                })
                //释放连接
                .finally(_.partial(dbo.release,con));
        }).catch(function(err){
            req.log.error('报名信息_获取连接_失败',{err:err});
            res.status(400).send('未知错误:' + err.message);
        });

    });
    module.exports = router;
})();