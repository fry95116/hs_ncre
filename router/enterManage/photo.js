/**
 * Created by tastycarb on 2017/5/6.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        _ = require('lodash'),
        multer = require('multer'),

        dbo = require('../../model/Photo'),
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
        zipUploader = multer({
            storage: multer.memoryStorage(),
            fileFilter:function(req,file,cb){
                //文件过滤

                var suffix = file.originalname.match(/.+\.([^\.]+)$/);
                suffix = suffix ? suffix[1].toLowerCase() : '';

                var acceptType = {'zip':''};
                file.suffix = suffix;

                cb(null,suffix in acceptType);
            }
        });

    /**
     * 获取照片信息
     * @method GET
     * @param {string} searchText 搜索内容
     * @param {bool} strictMode 严格搜索模式
     * @param {bool} desc 是否按降序排列
     * @param {number} offset 偏移
     * @param {number} limit 限制 */
    router.get('/', function (req, res, next) {
        dbo.selectPhotoInfo(req.query)
            .then(function (result) {
                res.send(result);
            })
            .catch(function (err) {
                req.log.error('照片信息_获取_失败',{err:err});
                res.status(400).send(err);
            });
    });

    /** 获取照片 */
    router.get('/:fileName', function (req, res, next) {

        var fileName = req.params.fileName;

        dbo.getPhoto(fileName).then(function(buf){
            var suffix = fileName.match(/.+\.([^\.]+)$/);
            suffix = suffix ? suffix[1].toLowerCase() : '';
            res.setHeader('Content-type','image/' + suffix);
            res.send(buf);
        }).catch(function(err){
            //req.log.error('照片_获取_失败',{err:err});
            res.status(404).send('找不到相应文件');
        });
    });

    /**
     * 导入分数信息
     * @method POST
     * @param {Object} file 文件对象
     */

    router.put('/',function(req,res,next){
            zipUploader.single('file')(req,res,function(err){
                if(err){
                    req.log.error('照片_导入_失败',{err:err});
                    if(err.code === 'LIMIT_FILE_SIZE') res.status(400).send('照片文件大小过大');
                    else res.status(400).send('未知错误');
                }
                else next();
            })
        },
        bodyParser.urlencoded({extended: true}),
        function (req, res, next) {
            if(_.isUndefined(req.file)) res.status(400).send('不受支持的文件类型');
            else dbo.importPhoto(req.file.buffer)
                .then(function () {
                    req.log.info('照片_导入_成功');
                    res.send('导入成功');
                })
                .catch(function (err) {
                    req.log.error('照片_导入_失败',{err:err});
                    res.status(400).send('导入失败：' + err.message);
                });
        });

    /**
     * 添加照片
     * @method POST
     * */
    router.post('/',
        function(req,res,next){
            imageUploader.single('file')(req,res,function(err){
                if(err){
                    req.log.error('照片_添加_失败',{err:err});
                    if(err.code === 'LIMIT_FILE_SIZE') res.status(400).send('照片文件大小过大');
                    else res.status(400).send('未知错误');
                }
                else next();
            })
        },
        bodyParser.urlencoded({extended: true}),
        function (req, res, next) {
            if(_.isUndefined(req.body.id_number)) res.status(400).send('缺少身份证号');
            else if(_.isUndefined(req.file)) res.status(400).send('不受支持的文件类型');
            else{
                //文件内容:req.file.buffer
                //文件类型:req.suffix
                dbo.addPhoto(req.body.id_number,req.file.buffer,req.file.suffix)
                    .then(function () {
                        req.log.info('照片_添加_成功');
                        res.send('添加成功');
                    })
                    .catch(function (err) {
                        req.log.error('照片_添加_失败',{err:err});
                        res.status(400).send('添加失败：' + err.message);
                    })

            }
        }
    );


    /**
     * 删除所有照片
     * @method DELETE
     * */
    router.delete('/', function (req, res, next) {
        dbo.deleteAllPhoto()
            .then(function () {
                req.log.info('照片_清空_成功');
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('照片_清空_失败',{err:err});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    /**
     * 删除照片
     * @method DELETE
     * */
    router.delete('/:id_number', function (req, res, next) {
        dbo.deletePhoto(req.params.id_number)
            .then(function () {
                req.log.info('照片_删除_成功',{id_number:req.params.id_number});
                res.send('删除成功');
            })
            .catch(function (err) {
                req.log.error('照片_删除_失败',{err:err,id_number:req.params.id_number});
                res.status(400).send('删除失败：' + err.message);
            })
    });

    module.exports = router;

})();
