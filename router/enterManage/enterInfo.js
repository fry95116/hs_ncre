/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        dbo = require('../../model/EnterInfo'),
        _ = require('lodash'),
        blackList = require('../../model/BlackList'),
        ERR =require('../../ApplicationError'),
        multer = require('multer'),
        diskStore = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './tempData');
            },
            filename: function (req, file, cb) {
                cb(null,'import');
            }
        }),
        upload = multer({
            storage: diskStore,
            fileFilter:function(req,file,cb){
                //文件过滤
                var suffix = file.originalname.match(/.+\.([^\.]+)$/);
                suffix = suffix ? suffix[1].toLowerCase() : '';
                var acceptType = {
                    'xls':'',
                    'xlsx':''
                };
                file.suffix = suffix;
                cb(null,suffix in acceptType);
            }
        });

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
        dbo.getConnection().then(function(con){
            //获取过程
            dbo.selectInfo(con,req.query)
                .then(function(result){
                    res.send(result);
                })
                .catch(function (err) {
                    req.log.error('报名信息_获取_失败',{err:err});
                    res.status(400).send(err);
                })
                .finally(_.partial(dbo.release,con));

        }).catch(function(err){
            req.log.error('报名信息_获取连接_失败',{err:err});
            res.status(400).send('未知错误:' + err.message);
        });
    });

    /**
     * 导入报名信息
     * @method POST
     * @param {Object} file 文件对象
     */

    router.post('/', upload.single('file'),function (req, res, next) {
        //文件导入
        if (req.file) {
            var reader = dbo.importInfo(req.file.suffix);
            if(reader){
                reader(req.file.path)
                    .then(function(){
                        req.log.info('报名信息_导入_成功');
                        res.send('导入成功');
                    })
                    .catch(function(err){
                        req.log.error('报名信息_导入_失败',{err:err});
                        res.status(400).send('导入失败:' + err.message);
                    });
            }
            else{
                res.status(400).send('不受支持的文件类型');
            }
        }
        else next();
    });


    /**
     * 添加报名信息
     * @method POST
     * */
    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res, next) {
        if(!_.isUndefined(req.body.file))  res.status(400).send('不受支持的文件类型');
        else if (req.body.force == 'true') {
            //强制添加
            dbo.getConnection().then(function(con){
                //前期检查
                dbo.check(req.body)
                    .then(_.partial(dbo.repeatCheck, con, req.body.id_number))
                    //添加过程
                    .then(_.partial(dbo.insertInfo, con, req.body))
                    .then(function () {
                        //日志
                        req.log.info('报名信息_强制添加_成功',{id_number:req.body.id_number});
                        res.send('添加成功。');
                    })
                    .catch(function (err) {
                        //日志
                        req.log.error('报名信息_强制添加_失败',{id_number:req.body.id_number,err:err});
                        //无效的提交数据
                        if (err instanceof ERR.InvalidDataError) res.status(400).send('无效的提交数据:' +
                            _.map(_.toPairs(JSON.parse(err.message)),function(pair){
                                return pair.join('=');
                            }).join('&')
                        );
                        //重复提交
                        else if (err instanceof ERR.RepeatInfoError) res.status(400).send(err.message);
                        //未知错误
                        else res.status(400).send('未知错误:' + err.message);
                    })
                    .finally(_.partial(dbo.release,con));


            }).catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
            });

        }
        else {
            //正常添加
            dbo.getConnection().then(function(con){
                //前期检查
                dbo.check(req.body)
                    .then(_.partial(dbo.repeatCheck, con, req.body.id_number))
                    .then(_.partial(blackList.check, con, req.body.id_number))
                    .then(_.partial(dbo.getStatistics, con))
                    .then(dbo.checkCount)
                    //添加过程
                    .then(_.partial(dbo.begin, con))
                    .then(_.partial(dbo.insertInfo, con, req.body))
                    .then(_.partial(dbo.getStatistics, con))
                    .then(_.partial(dbo.checkCount, _, true))
                    .then(_.partial(dbo.commit, con))
                    .then(function () {
                        //日志
                        req.log.info('报名信息_添加_成功',{id_number:req.body.id_number});
                        res.send('添加成功。');
                    })
                    .catch(function (err) {
                        dbo.rollback(con)
                            .then(function () {
                                //日志
                                req.log.error('报名信息_添加_失败',{id_number:req.body.id_number,err:err});
                                //无效的提交数据
                                if (err instanceof ERR.InvalidDataError) res.status(400).send('无效的提交数据:' +
                                    _.map(_.toPairs(JSON.parse(err.message)),function(pair){
                                        return pair.join('=');
                                    }).join('&')
                                );
                                //重复提交
                                else if (err instanceof ERR.RepeatInfoError) res.status(400).send(err.message);
                                //人数超出
                                else if (err instanceof ERR.CountOverFlowError) res.status(400).send('人数超出:' + JSON.parse(err.message).desc);
                                //在黑名单中
                                else if (err instanceof ERR.BlacklistError) res.status(400).send(err.message);
                                //未知错误
                                else res.status(400).send('未知错误:' + err.message);
                            })
                            .catch(function (err) {
                                //日志
                                req.log.error(err);
                                //未知错误
                                res.status(400).send('未知错误:' + err.message);
                            })
                    })
                    //释放连接
                    .finally(_.partial(dbo.release,con));
            }).catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
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

            dbo.getConnection().then(function(con){
                //更新过程
                dbo.updateInfo(con, req.params.id_number, newData)
                    .then(function () {
                        req.log.info('报名信息_修改_成功',{id_number:req.params.id_number});
                        res.send('修改成功');
                    })
                    .catch(function (err) {
                        req.log.error('报名信息_修改_失败',{err:err,id_number:req.params.id_number});
                        res.status(400).send('修改失败：' + err.message);
                    })
                    //释放连接
                    .finally(_.partial(dbo.release,con));

            }).catch(function(err){
                req.log.error('报名信息_获取连接_失败',{err:err});
                res.status(400).send('未知错误:' + err.message);
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
        dbo.getConnection().then(function(con){
            //获取过程
            dbo.deleteAllInfo(con)
                .then(function () {
                    req.log.info('报名信息_清空_成功');
                    res.send('删除成功');
                })
                .catch(function (err) {
                    req.log.error('报名信息_清空_失败',{err:err});
                    res.status(400).send('删除失败：' + err.message);
                })
                .finally(_.partial(dbo.release,con));

        }).catch(function(err){
            req.log.error('报名信息_获取连接_失败',{err:err});
            res.status(400).send('未知错误:' + err.message);
        });


    });

    router.delete('/:id_number', function (req, res, next) {
        dbo.getConnection().then(function(con){
            //获取过程
            dbo.deleteInfo(con,req.params.id_number)
                .then(function () {
                    req.log.info('报名信息_删除_成功',{id_number:req.params.id_number});
                    res.send('删除成功');
                })
                .catch(function (err) {
                    req.log.error('报名信息_删除_失败',{err:err,id_number:req.params.id_number});
                    res.status(400).send('删除失败：' + err.message);
                })
                .finally(_.partial(dbo.release,con));

        }).catch(function(err){
            req.log.error('报名信息_获取连接_失败',{err:err});
            res.status(400).send('未知错误:' + err.message);
        });

    });

    module.exports = router;

})();
