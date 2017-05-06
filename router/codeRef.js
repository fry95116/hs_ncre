/**
 * Created by tomtoo on 2015/12/7.
 * Description ：前台系统的路由，这部分主要是指暴露给报名者的
 */

(function () {
    var router = require('express').Router(),
        _ = require('lodash'),

        translate = require('./../tr'),        //各类映射
        codeRef = translate.codeRef,        //职业,民族,学历等项目的 名称-代码 映射

        user_config = require('./../user_config'),    //用户设置
        sites_info = user_config.exam_sites,       //考点，科目信息
        test_rooms = user_config.test_rooms;       //考场，批次信息

    router.get('/:field',function(req,res,next){
        var field = req.params.field;
        if(field in codeRef){
            var re = _.map(codeRef[field],function(val){
                return {
                    value:val.code,
                    text:val.name + '(' + val.code + ')'
                };
            });
            res.setHeader('Content-type','application/json');
            res.send(re);
        }

        //考点代码与科目代码
        else if(field === 'exam_site_code'){
            var re = _.map(sites_info,function(val){
                return {
                    value:val.code,
                    text:val.name + '(' + val.code + ')'
                };
            });
            res.setHeader('Content-type','application/json');
            res.send(re);
        }
        else if(field === 'subject_code'){
            var re = _.map(sites_info,function(val){
                return {
                    text:val.name + '(' + val.code + ')',
                    children:_.map(val.subjects,function(val){
                        return {
                            value:val.code,
                            text:val.name + '(' + val.code + ')'
                        };
                    })
                };
            });
            res.setHeader('Content-type','application/json');
            res.send(re);
        }

        //考场号与批次号
        else if(field === 'testRoom_number'){
            var re = _.map(test_rooms,function(val){
                return {
                    value:val.code,
                    text:val.location + '(' + val.code + ')'
                };
            });
            res.setHeader('Content-type','application/json');
            res.send(re);
        }
        else if(field === 'batch_number'){
            var re = _.map(test_rooms,function(val){
                return {
                    text:val.location + '(' + val.code + ')',
                    children:_.map(val.batchs,function(val){
                        return {
                            value:val.code,
                            text:val.code
                        };
                    })
                };
            });
            res.setHeader('Content-type','application/json');
            res.send(re);
        }

        else next();
    });


    module.exports = router;
})();