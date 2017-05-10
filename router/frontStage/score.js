/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),
        Promise = require('bluebird'),

        dbo = require('../../model/Score'),

        translate = require('../../tr'),                   //各类映射
        codeRef = translate.codeRef,                    //职业,民族,学历等项目的 名称-代码 映射
        tr = translate.tr,                              //翻译函数， 用于将数据表字段名翻译为实际名称(原tr.js)
        user_config = require('../../user_config');        //用户设置


    /* 考试信息查询界面 */
    router.get('/getScoreInfo', function (req, res) {
        if (req.query.id_number) {
            var opt_select = {searchBy:'id_number',searchText:req.query.id_number,strictMode:true};
            dbo.selectScore(opt_select)
                .then(function(result){
                    if(result.total === 0) {
                        res.render('frontStage/getScoreInfo', {info: null});
                    }
                    else{

                        var scoreInfo = result.rows[0];

                        var out = {};

                        for (var key in scoreInfo) {
                            // out[tr(key)] = codeRef[key] ? codeRef[key].findName(result[key]) : result[key];
                            if(!_.isNil(codeRef[key]))
                                out[tr(key)] =  '(' + scoreInfo[key] + ')' + codeRef[key].findName(scoreInfo[key]);
                            else
                                out[tr(key)] = scoreInfo[key] ;
                        }

                        res.render('frontStage/getScoreInfo', {
                            info: out
                        });


                    }
                })
                .catch(function(err){
                    req.log.error('考试信息_查询_失败',{err:err});
                    res.render('frontStage/op_res',{isPreview:false,content:'unknown'});
                });
        } else {
            res.render('frontStage/op_res',{isPreview:true,content:'请输入证件号'});
        }
    });

    
    
    module.exports = router;
})();