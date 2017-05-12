/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),
        Promise = require('bluebird'),

        ConnectionPool = require('../../model/ConnectionPool'),
        dbo_enter = require('../../model/EnterInfo'),
        dbo_test = require('../../model/TestInfo'),
        dbo_admissionTicket = require('../../model/AdmissionTicket'),



        translate = require('../../tr'),                   //各类映射
        codeRef = translate.codeRef,                    //职业,民族,学历等项目的 名称-代码 映射

        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../../user_config'),        //用户设置
        sites_info = user_config.exam_sites,            //考点，科目信息
        test_rooms = user_config.test_rooms;


    /* 考试信息查询界面 */
    router.get('/getTestInfo', function (req, res) {
        if (req.query.id_number) {
            var opt_select = {searchBy:'id_number',searchText:req.query.id_number,strictMode:true};
            ConnectionPool.getConnection()
                .then(function(con){
                    Promise.props({
                        enterInfo:dbo_enter.selectInfo(con,opt_select),
                        testInfo:dbo_test.selectTestInfo(opt_select)
                    })
                        .then(function(result){
                            if(result.enterInfo.total === 0 || result.testInfo.total === 0) {
                                res.render('frontStage/getTestInfo', {info: null});
                            }
                            else{
                                var testInfo = _.assign(
                                    _.pick(result.enterInfo.rows[0],['id_number','name','exam_site_code','subject_code']),
                                    _.pick(result.testInfo.rows[0],['examinee_number','enter_number','testRoom_number','batch_number'])
                                );

                                var out = {};

                                //其他信息

                                for (var key in _.omit(testInfo, ['exam_site_code', 'subject_code','testRoom_number','batch_number'])) {
                                    // out[tr(key)] = codeRef[key] ? codeRef[key].findName(result[key]) : result[key];
                                    if(!_.isNil(codeRef[key]))
                                        out[tr(key)] =  '(' + testInfo[key] + ')' + codeRef[key].findName(testInfo[key]);
                                    else
                                        out[tr(key)] = testInfo[key] ;
                                }

                                //考点 & 科目信息
                                var examSite = _.find(sites_info,function(el){return el.code == testInfo.exam_site_code;});
                                if(_.isNil(examSite)){
                                    out[tr('exam_site_code')] = '未知';
                                    out[tr('subject_code')] = '未知'
                                }
                                else if(_.isNil(examSite.subjects)){
                                    out[tr('subject_code')] = '未知';
                                }else{
                                    out[tr('exam_site_code')] = '(' + examSite.code + ')' + examSite.name;
                                    var subject = _.find(examSite.subjects,function(el){return el.code == testInfo.subject_code;});
                                    if(_.isNil(subject)) out[tr('subject_code')] = '未知';
                                    else out[tr('subject_code')] = '(' + subject.code + ')' + subject.name ;
                                }
                                //考场 & 批次信息
                                var testRoom = _.find(test_rooms,function(el){return el.code == testInfo.testRoom_number;});
                                if(_.isNil(testRoom)){
                                    out['考场'] = '未知';
                                    out['考试时间'] = '未知'
                                }
                                else if(_.isNil(testRoom.batchs)){
                                    out['考试时间'] = '未知';
                                }
                                else {
                                    out['考场'] = '(' + testRoom.code + ')' + testRoom.location;
                                    var batch = _.find(testRoom.batchs, function (el) {
                                        return el.code == testInfo.batch_number;
                                    });
                                    if (_.isNil(batch)) out[tr('考试时间')] = '未知';
                                    else {
                                        var testTime = (new Date(batch.endTime) - new Date(batch.startTime)) / (1000 * 60);
                                        out['考试时间'] = new Date(batch.startTime).toLocaleString().replace(/:\d\d$/, '') + ' (' + testTime + '分钟)'
                                    }
                                }
                                res.render('frontStage/getTestInfo', {id_number:req.query.id_number,info: out});
                            }
                        })
                        .catch(function(err){
                            req.log.error('考试信息_查询_失败',{err:err});
                            res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                        })
                        //释放连接
                        .finally(_.partial(ConnectionPool.release,con));
                })
                .catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
            });
        } else {
            res.render('frontStage/op_res',{isPreview:true,content:'请输入证件号'});
        }
    });

    router.get('/AdmissionTicket.pdf',function(req,res){
        if (req.query.id_number) {
            res.setHeader('Content-type','application/octet-stream');
            dbo_admissionTicket.print(req.query.id_number,res).catch(function(err){
                req.log.error('准考证_导出_失败',{err:err});
                res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
            });
        } else {
            res.render('frontStage/op_res',{isPreview:true,content:'请输入证件号'});
        }
    });
    
    
    module.exports = router;
})();