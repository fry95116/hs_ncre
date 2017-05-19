/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),

        bodyparser = require('body-parser'),            //解析post请求用
        multer = require('multer'),
        imageUploader = multer({
            storage: multer.memoryStorage(),
            fileFilter:function(req,file,cb){
                //文件过滤

                var suffix = file.originalname.match(/.+\.([^\.]+)$/);
                suffix = suffix ? suffix[1].toLowerCase() : '';

                var acceptType = {'jpg':'', 'png':'', 'gif':''};
                file.suffix = suffix;

                cb(null,suffix in acceptType);
            },
            limits:{fileSize:1024*1024}
        }),

        updateID = require('../../updateID'),

        dbo_enterInfo = require('../../model/EnterInfo'),            //提供各类数据操作
        dbo_photo = require('../../model/Photo'),            //提供各类数据操作
        data_schema = require('../../data_schema'),
        translate = require('../../tr'),                   //各类映射
        codeRef = translate.codeRef,                    //职业,民族,学历等项目的 名称-代码 映射
        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../../user_config'),        //用户设置
        sites_info = user_config.exam_sites,            //考点，科目信息

        ERR = require('../../ApplicationError');


    /******************************************* 报名 *******************************************/
    /* 考生信息填报界面 */
    router.get('/enter', function (req, res) {
        res.render('frontStage/enter', {
            tr: codeRef,
            sites_info: sites_info,
            error_info: '',
            formData:''
        });
    });

    /* 重复检查 */
    router.get('/repeatcheck', function (req, res, next) {
        if (req.query.id_number != '') {
            dbo_enterInfo.repeatCheck(req.query.id_number)
                .then(function(){
                    res.send(true);
                })
                .catch(function(err){
                    res.send(false);
                })
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
                error_info: '{"captcha":"非法的数据"}',
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
        dbo_enterInfo.addInfo(req.body)
            .then(function () {
                //日志
                req.log.info('报名信息_添加_成功',{id_number:req.body.id_number});
                res.render('frontStage/op_res',{isPreview:false,content:'enter/success'});
            })
            .catch(function (err) {
                //日志
                req.log.error('报名信息_添加_失败',{id_number:req.body.id_number,err:err});
                //无效的提交数据
                if (err instanceof ERR.InvalidDataError)
                    res.render('frontStage/enter', {
                        tr: codeRef,
                        sites_info: sites_info,
                        error_info: err.message,
                        formData: JSON.stringify(req.body)
                    });
                //重复提交
                else if (err instanceof ERR.RepeatInfoError) res.render('frontStage/op_res',{isPreview:false,content:'enter/repeat'});
                //人数超出
                else if (err instanceof ERR.CountOverFlowError) res.render('frontStage/op_res',{isPreview:false,content:'enter/overflow'});
                //在黑名单中
                else if (err instanceof ERR.BlacklistError) res.render('frontStage/op_res',{isPreview:false,content:'enter/blacklist'});
                //未知错误
                else res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
            });
    });


    /******************************************* 报名信息查询 *******************************************/

    /* 考生信息查询界面 */
    router.get('/getEnterInfo', function (req, res, next) {
        if (req.query.id_number) {
            dbo_enterInfo.selectInfo({searchBy:'id_number',searchText:req.query.id_number,strictMode:true})
                .then(function(result){
                    //查询为空
                    if(result.total === 0) {
                        res.render('frontStage/op_res',{isPreview:false,content:'getEnterInfo/noExist'});
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
                            info: out,
                            id_number: result.id_number
                        });
                    }

                })
                .catch(function(err){
                    req.log.error('报名信息_查询_失败',{err:err});
                    res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                });
        } else {
            res.render('frontStage/op_res',{isPreview:true,content:'请输入证件号'});
        }
    });

    /* 获取考生信息更新链接 */
    router.get('/requestUpdateEnterInfo',function(req,res,next){
        if(_.isUndefined(req.query.id_number)) next();
        else{
            dbo_enterInfo.selectInfo({searchBy:'id_number',searchText:req.query.id_number,strictMode:true})
            .then(function(result){
                if(result.total === 0)
                    res.render('frontStage/op_res',{isPreview:false,content:'updateEnterInfo/noExist'});
                else
                    updateID.create(req.query.id_number)
                        .then(function(req_id){
                            //发送邮件
                            // var email = result.rows[0].email;
                            // res.render('frontStage/op_res',{isPreview:false,content:'updateEnterInfo/mailSended'});

                            //测试用
                            res.render('frontStage/op_res', {
                                isPreview:true,
                                content:'测试用：<a href="/updateEnterInfo?id_number=' + req.query.id_number + '&req_id=' + req_id + '">修改链接</a>'
                            });

                        })
                        .catch(function(err){
                            req.log.error('报名信息_获取链接_失败',{err:err});
                            res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                        });
            })
            .catch(function(err){
                req.log.error('报名信息_获取链接_失败',{err:err});
                res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
            });
        }
    });

    /* 考生信息更新界面 */
    router.get('/updateEnterInfo', function (req, res, next) {
        if(_.isUndefined(req.query.id_number) ||_.isUndefined(req.query.req_id)) next();
        else{
            updateID.check(req.query.req_id,req.query.id_number)
                .then(_.partial(dbo_enterInfo.selectInfo,{searchBy:'id_number',searchText:req.query.id_number,strictMode:true}))
                .then(function(result){
                    if(result.total === 0)
                        res.render('frontStage/op_res',{isPreview:false,content:'updateEnterInfo/noExist'});
                    else{
                        result = result.rows[0];

                        //组装报名信息对象
                        var examSite = _.find(sites_info,function(el){return el.code == result.exam_site_code;});
                        if(_.isNil(examSite)){
                            result['exam_site_code'] = '未知(' + result['exam_site_code'] + ')';
                            result['subject_code'] = '未知(' + result['subject_code'] + ')';
                        }
                        else if(_.isNil(examSite.subjects)){
                            result['subject_code'] = '未知(' + result['subject_code'] + ')';
                        }else{
                            result['exam_site_code'] = '(' + examSite.code + ')' + examSite.name;
                            var subject = _.find(examSite.subjects,function(el){return el.code == result.subject_code;});
                            if(_.isNil(subject)) result['subject_code'] = '未知(' + result['subject_code'] + ')';

                            else result['subject_code'] = '(' + subject.code + ')' + subject.name;
                        }

                        res.render('frontStage/updateEnterInfo', {
                            tr: codeRef,
                            sites_info: sites_info,
                            error_info: '',
                            formData:result,
                            req_id:req.query.req_id
                        });
                    }
                })
                .catch(function(err){
                    if(err.message === '无效的updateID')
                        next();
                    else{
                        req.log.error('报名信息_获取修改页面_失败',{err:err});
                        res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                    }
                });
        }
    });

    /* 处理提交的考生记录更新 */
    router.post('/updateEnterInfo',bodyparser.urlencoded({extended: true}),function (req, res) {
        if(_.isUndefined(req.query.id_number) ||_.isUndefined(req.query.req_id)) next();
        else{
            //把证件号放入请求体，用于回传界面的渲染
            req.body.id_number = req.query.id_number;
            //检查req_id
            updateID.check(req.query.req_id,req.query.id_number)
                .then(new Promise(function(resolve,reject){
                    //验证验证码
                    if (!req.session || req.session.captcha != req.body.captcha.toUpperCase()) {
                        res.render('frontStage/enter', {
                            tr: codeRef,
                            sites_info: sites_info,
                            error_info: '{"captcha":"非法的数据"}',
                            formData: JSON.stringify(req.body),
                            req_id: req.query.req_id
                        });
                        return;
                    }
                    //清空session
                    req.session.captcha = '';
                    //生成备注
                    if (req.body.is_our_school)
                        req.body.remark = '' + codeRef.department.findName(req.body.department) + req.body.student_number;
                    else
                        req.body.remark = req.body.school == '01' ? req.body.school_name : codeRef.school.findName(req.body.school);
                    //修改
                    dbo_enterInfo.updateInfo(req.query.id_number,req.body,false)
                        .then(resolve)
                        .catch(reject);
                }))
                .then(_.partial(updateID.remove,req.query.req_id))
                .then(function(){
                    //日志
                    req.log.info('报名信息_修改_成功',{id_number:req.body.id_number});
                    res.render('frontStage/op_res',{isPreview:false,content:'updateEnterInfo/updated'});
                })
                .catch(function(err){
                    //日志
                    req.log.error('报名信息_修改_失败',{id_number:req.body.id_number,err:err});
                    //无效的提交数据
                    if (err instanceof ERR.InvalidDataError)
                        res.render('frontStage/updateEnterInfo', {
                            tr: codeRef,
                            sites_info: sites_info,
                            error_info: err.message,
                            formData: JSON.stringify(req.body),
                            req_id:req.query.req_id
                        });
                    //req_id无效
                    else if(err.message === '无效的updateID')
                        next();
                    else{
                        req.log.error('报名信息_修改_失败',{err:err});
                        res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                    }
                });
        }
    });


    /******************************************* 照片上传 *******************************************/
    /** 获取照片上传链接 */
    router.get('/requestUploadPhoto',function(req,res,next){
        if(_.isUndefined(req.query.id_number)) next();
        else{
            dbo_enterInfo.selectInfo({searchBy:'id_number',searchText:req.query.id_number,strictMode:true})
                .then(function(result){
                    if(result.total === 0)
                        res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/noExist'});
                    else
                        updateID.create(req.query.id_number)
                            .then(function(req_id){
                                //发送邮件
                                // var email = result.rows[0].email;
                                // res.render('frontStage/op_res',{isPreview:false,content:'updateEnterInfo/mailSended'});

                                //测试用
                                res.render('frontStage/op_res', {
                                    isPreview:true,
                                    content:'测试用：<a href="/uploadPhoto?id_number=' + req.query.id_number + '&req_id=' + req_id + '">修改链接</a>'
                                });

                            })
                            .catch(function(err){
                                req.log.error('上传照片_获取链接_失败',{err:err});
                                res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                            });
                })
                .catch(function(err){
                    req.log.error('上传照片_获取链接_失败',{err:err});
                    res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                });
        }
    });

    /** 获取照片 */
    router.get('/getPhoto', function (req, res, next) {
        if(_.isUndefined(req.query.id_number) ||_.isUndefined(req.query.req_id)) next();
        else{
            updateID.check(req.query.req_id,req.query.id_number)
                .then(new Promise(function(resolve,reject){
                    dbo_photo.selectPhotoInfo(req.query.id_number)
                        .then(function(result){
                            //如果存在照片信息
                            if(result) dbo_photo.getPhoto(result.file_name)
                                .then(function(buf){
                                    var suffix = result.file_name.match(/.+\.([^\.]+)$/);
                                    suffix = suffix ? suffix[1].toLowerCase() : '';

                                    res.setHeader('Content-type','image/' + suffix);
                                    res.send(buf);

                                    resolve();
                                })
                                .catch(reject);
                            else res.status(404).send('找不到相应文件');

                        })
                        .catch(reject);
                }))
                .catch(function(err){
                    if(err.message === '无效的updateID')
                        next();
                    else{
                        res.status(404).send('找不到相应文件');
                    }
                });
        }
    });
    /** 照片上传界面 */
    router.get('/uploadPhoto', function (req, res, next) {
        if(_.isUndefined(req.query.id_number) ||_.isUndefined(req.query.req_id)) next();
        else{
            updateID.check(req.query.req_id,req.query.id_number)
                .then(function(){
                    res.render('frontStage/uploadPhoto',{id_number:req.query.id_number,req_id:req.query.req_id});
                })
                .catch(function(err){
                    if(err.message === '无效的updateID')
                        next();
                    else{
                        req.log.error('上传照片_获取页面_失败',{err:err});
                        res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                    }
                });
        }
    });

    /** 上传照片 */
    router.post('/uploadPhoto',
        function(req,res,next){
            imageUploader.single('file')(req,res,function(err){
                if(err){
                    req.log.error('照片_添加_失败',{err:err});
                    if(err.code === 'LIMIT_FILE_SIZE')
                        res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/oversized'});
                    else
                        res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                }
                else next();
            })
        },
        bodyparser.urlencoded({extended: true}),
        function (req, res, next) {
            if(_.isUndefined(req.file)){
                //不支持的文件格式
                res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/invalidFormat'});
            }
            else if(_.isUndefined(req.query.id_number) ||_.isUndefined(req.query.req_id)) next();
            else{
                updateID.check(req.query.req_id,req.query.id_number)
                    .then(new Promise(function(resolve,reject){
                        //检查报名信息是否存在
                        dbo_enterInfo.exists(req.query.id_number)
                        //检查照片是否存在
                            .then(_.partial(dbo_photo.exists,req.query.id_number))
                            .then(function(){
                                //修改逻辑
                                dbo_photo.updatePhoto(req.query.id_number,req.file.buffer,req.file.suffix)
                                    .then(function () {
                                        req.log.info('照片_修改_成功',{id_number:req.query.id_number});
                                        res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/updated'});
                                        resolve();
                                    })
                                    .catch(reject);
                            })
                            .catch(function(err){
                                //添加逻辑
                                if(err.message === '照片不存在') {
                                    dbo_photo.addPhoto(req.query.id_number,req.file.buffer,req.file.suffix)
                                        .then(function () {
                                            req.log.info('照片_添加_成功',{id_number:req.query.id_number});
                                            res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/added'});
                                            resolve();
                                        })
                                        .catch(reject);
                                }
                                else reject(err);

                            });
                    }))
                    .then(_.partial(updateID.remove,req.query.req_id))
                    //成功信息已经在上面处理了
                    .catch(function (err) {
                        req.log.error('照片_添加&修改_失败',{err:err});

                        if(err.message === '照片比例错误')
                            res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/invalidRatio'});
                        else if(err.message === '照片分辨率过小')
                            res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/tooSmall'});
                        else if(err.message == '报名信息不存在')
                            res.render('frontStage/op_res',{isPreview:false,content:'uploadPhoto/noExist'});
                        else
                            res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                    });

            }
    });

    module.exports = router;
})();