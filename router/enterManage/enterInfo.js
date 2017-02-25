/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        dbo = require('../../dbo'),
        _ = require('lodash'),
        blackList = require('../../blackList');

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
     * */
    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res, next) {
        if (req.body.force == 'true') {
            //强制添加
            //前期检查
            dbo.check(req.body)
                .then(_.partial(dbo.repeatCheck, req.body.id_number))
                .then(_.partial(blackList.check, req.body.id_number))
                //添加过程
                .then(_.partial(dbo.insertInfo, req.body))
                .then(function () {
                    //日志
                    res.send('添加成功。');
                })
                .catch(function (err) {
                    //日志
                    console.log(err.toString());
                    //无效的提交数据
                    if (err instanceof ERR.InvalidDataError) {
                        res.status(400).send('无效的提交数据:' + err.message);
                    }
                    //重复提交
                    else if (err instanceof ERR.RepeatInfoError) {
                        res.status(400).send('证件号重复。');
                    }
                    //未知错误
                    else {
                        res.status(400).send('未知错误:' + err.message);
                    }
                });
        }
        else {
            //正常添加
            //前期检查
            dbo.check(req.body)
                .then(_.partial(dbo.repeatCheck, req.body.id_number))
                .then(_.partial(blackList.check, req.body.id_number))
                .then(dbo.getStatistics)
                .then(dbo.checkCount)
                //添加过程
                .then(dbo.begin)
                .then(_.partial(dbo.insertInfo, req.body))
                .then(dbo.getStatistics)
                .then(_.partial(dbo.checkCount, _, true))
                .then(dbo.commit)
                .then(function () {
                    //日志
                    res.send('添加成功。');
                })
                .catch(function (err) {
                    dbo.rollback()
                        .then(function () {
                            //日志
                            console.log(err.toString());
                            //无效的提交数据
                            if (err instanceof ERR.InvalidDataError) {
                                res.status(400).send('无效的提交数据:' + err.message);
                            }
                            //重复提交
                            else if (err instanceof ERR.RepeatInfoError) {
                                res.status(400).send('证件号重复。');
                            }
                            //人数超出
                            else if (err instanceof ERR.CountOverFlowError) {
                                res.status(400).send('人数超出:' + err.message);
                            }
                            //在黑名单中
                            else if (err instanceof ERR.BlacklistError) {
                                res.status(400).send('此人在黑名单中。');
                            }
                            //未知错误
                            else {
                                res.status(400).send('未知错误:' + err.message);
                            }
                        })
                        .catch(function (err) {
                            //日志
                            console.error(err.toString());
                            //未知错误
                            res.status(400).send('未知错误:' + err.message);
                        });
                });
        }
    });


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
