/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        dbo = require('../../dbo');

    /**
     * 浏览报名信息
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
                console.log(err);
                res.status(400).send(err);
            });
    });
    /**
     * 添加报名信息
     * @method POST
     * @param {Array|Object} enterInfo 需要添加的报名信息
     * @param {bool} force 强制添加
     * */
    /*router.post('/',bodyParser.urlencoded({extended: true}),function(req,res,next){

     });*/


    /**
     * 更新报名信息
     * @method PUT
     * @param {string} value 新的数据
     * */

    router.put('/:id_number/:field', bodyParser.urlencoded({extended: true}), function (req, res, next) {
        if (req.body && req.body.value) {
            var newData = {};
            newData[req.params.field] = req.body.value;
            dbo.updateInfo(req.params.id_number, newData)
                .then(function () {
                    res.send('success');
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(400).send('修改失败：' + err.message);
                });
        }
        else {
            res.status(400).send('no data');
        }
    });

    /**
     * 删除报名信息
     * @method DELETE
     * */
    router.delete('/:id_number', function (req, res, next) {
        dbo.deleteInfo(req.params.id_number)
            .then(function () {
                res.send('succeed');
            })
            .catch(function (err) {
                console.log(err);
                res.status(400).send('修改失败：' + err.message);
            })
    });

    module.exports = router;

})();
