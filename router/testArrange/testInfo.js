/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        dbo = require('../../model/TestInfo'),
        _ = require('lodash'),
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
        dbo.selectTestInfo(req.query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                req.log.error('考试信息_获取_失败',{err:err});
                res.status(400).send(err);
            });
    });

    /**
     * 导入分数信息
     * @method POST
     * @param {Object} file 文件对象
     */

    router.post('/', upload.single('file'), function (req, res, next) {
        //文件导入
        if (req.file) {
            var reader = dbo.importTestInfo(req.file.suffix);
            if(reader){
                reader(req.file.path)
                    .then(function(){
                        req.log.info('考试信息_导入_成功');
                        res.send('导入成功');
                    })
                    .catch(function(err){
                        req.log.error('考试信息_导入_失败',{err:err});
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
     * 添加分数信息
     * @method POST
     * */
    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res, next) {

    });

    /**
     * 更新分数信息
     * @method PUT
     * @param {string} value 新的数据
     * */

    router.put('/:id_number/:field', bodyParser.urlencoded({extended: true}), function (req, res, next) {
        if (req.body && req.body.value) {
            var newData = {};
            newData[req.params.field] = req.body.value;
            dbo.updateTestInfo(req.params.id_number, newData)
                .then(function () {
                    req.log.info('考试信息_修改_成功',{id_number:req.params.id_number});
                    res.send('修改成功');
                })
                .catch(function (err) {
                    req.log.error('考试信息_修改_失败',{err:err,id_number:req.params.id_number});
                    res.status(400).send('修改失败：' + err.message);
                });
        }
        else {
            res.status(400).send('该证件号不存在');
        }
    });

    /**
     * 删除所有分数
     * @method DELETE
     * */
    router.delete('/', function (req, res, next) {
        dbo.deleteAllTestInfo()
            .then(function () {
                req.log.info('考试信息_清空_成功');
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('考试信息_清空_失败',{err:err});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    router.delete('/:id_number', function (req, res, next) {
        dbo.deleteTestInfo(req.params.id_number)
            .then(function () {
                req.log.info('考试信息_删除_成功',{id_number:req.params.id_number});
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('考试信息_删除_失败',{err:err,id_number:req.params.id_number});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    module.exports = router;

})();
