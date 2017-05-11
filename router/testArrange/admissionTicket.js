/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        _ = require('lodash')

        dbo = require('../../model/AdmissionTicket');

    /**
     * 浏览分数信息
     * @method GET
     * @param {string} searchBy 搜索项
     * @param {string} searchText 搜索内容
     * @param {bool} strictMode 严格搜索模式
     * @param {string} 排序依据
     * @param {bool} desc 是否按降序排列
     * @param {number} offset 偏移
     * @param {number} limit 限制 */
    router.get('/', function (req, res, next) {
        dbo.selectInfo(req.query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                req.log.error('准考证信息_获取_失败',{err:err});
                res.status(400).send(err);
            });
    });

    router.get('/export.pdf',function(req,res,next){
        res.setHeader('Content-type','application/octet-stream');
        dbo.export(res)
            .catch(function(err){
                res.status(400).send(err.message)
            });
    });

    router.get('/:id_number',function(req,res,next){
        dbo.check(req.params.id_number)
            .then(function(){
                res.send('数据完整,可以导出');
            }).catch(function(err){
                res.status(400).send(err.message);
        });
    });


    module.exports = router;

})();
