/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        dbo = require('../../model/EnterInfo'),
        _ = require('lodash'),
        blackList = require('../../model/BlackList');

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
                req.log.error('报名信息_获取_失败',{err:err});
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
                //添加过程
                .then(_.partial(dbo.insertInfo, req.body))
                .then(function () {
                    //日志
                    req.log.info('报名信息_强制添加_成功',{id_number:req.body.id_number});
                    res.send('添加成功。');
                })
                .catch(function (err) {
                    //日志
                    req.log.error('报名信息_强制添加_失败',{id_number:req.body.id_number,err:err});
                    //无效的提交数据
                    if (err instanceof ERR.InvalidDataError) {

                        res.status(400).send('无效的提交数据:' +
                            _.map(_.toPairs(JSON.parse(err.message)),function(pair){
                                return pair.join('=');
                            }).join('&'));
                    }
                    //重复提交
                    else if (err instanceof ERR.RepeatInfoError) {
                        res.status(400).send(err.message);
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
                    req.log.info('报名信息_添加_成功',{id_number:req.body.id_number});
                    res.send('添加成功。');
                })
                .catch(function (err) {
                    dbo.rollback()
                        .then(function () {
                            //日志
                            req.log.error('报名信息_添加_失败',{id_number:req.body.id_number,err:err});
                            //无效的提交数据
                            if (err instanceof ERR.InvalidDataError) {
                                res.status(400).send('无效的提交数据:' +
                                    _.map(_.toPairs(JSON.parse(err.message)),function(pair){
                                        return pair.join('=');
                                    }).join('&'));
                            }
                            //重复提交
                            else if (err instanceof ERR.RepeatInfoError) {
                                res.status(400).send(err.message);
                            }
                            //人数超出
                            else if (err instanceof ERR.CountOverFlowError) {
                                res.status(400).send('人数超出:' + JSON.parse(err.message).desc);
                            }
                            //在黑名单中
                            else if (err instanceof ERR.BlacklistError) {
                                res.status(400).send(err.message);
                            }
                            //未知错误
                            else {
                                res.status(400).send('未知错误:' + err.message);
                            }
                        })
                        .catch(function (err) {
                            //日志
                            req.log.error(err);
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
                    req.log.info('报名信息_修改_成功',{id_number:req.params.id_number});
                    res.send('修改成功');
                })
                .catch(function (err) {
                    req.log.error('报名信息_修改_失败',{err:err,id_number:req.params.id_number});
                    res.status(400).send('修改失败：' + err.message);
                });
        }
        else {
            res.status(400).send('no data');
        }
    });

    /**
     * 删除所有报名信息
     * @method DELETE
     * */
    router.delete('/', function (req, res, next) {
        dbo.deleteAllInfo()
            .then(function () {
                req.log.info('报名信息_清空_成功');
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('报名信息_清空_失败',{err:err});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    router.delete('/:id_number', function (req, res, next) {
        dbo.deleteInfo(req.params.id_number)
            .then(function () {
                req.log.info('报名信息_删除_成功',{id_number:req.params.id_number});
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('报名信息_删除_失败',{err:err,id_number:req.params.id_number});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    module.exports = router;

})();
