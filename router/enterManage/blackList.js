/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
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
                    'csv':'',
                    'xls':'',
                    'xlsx':'',
                    'json':'',
                    'xml':''
                };
                file.suffix = suffix;
                cb(null,suffix in acceptType);
            }
        }),
        blackList = require('../../model/blackList');


    /**
     * 浏览黑名单
     * @method GET*/
    router.get('/', function (req, res) {
        blackList.get()
            .then(function (result) {res.send(result);})
            .catch(function (err){
                req.log.error("黑名单获取失败",{err:err});
            });
    });


    /**
     * 导入黑名单
     * @method POST
     * @param {Object} file 文件对象
     */

    router.post('/', upload.single('file'), function (req, res, next) {
        //文件导入
        if (req.file) {
            var read = blackList.import(req.file.suffix);
            if(read){
                read(req.file.path)
                    .then(function(){
                        req.log.info('黑名单_导入_成功');
                        res.send('导入成功');
                    })
                    .catch(function(err){
                        req.log.error('黑名单_导入_失败',{err:err});
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
     * 添加黑名单
     * @method POST
     * @param {string} name 名称
     * @param {string} id_number 证件号 */

    router.post('/', upload.single('file'), bodyParser.urlencoded({extended: true}), function (req, res) {

        if(req.file)  res.send('不受支持的文件类型');
        //直接添加
        else blackList.add(req.body)
            .then(function () {
                req.log.info('黑名单_添加_成功',{id_number:req.body.id_number});
                res.send('添加成功');
            })
            .catch(function (err) {
                req.log.error('黑名单_添加_失败',{err:err});
                res.status(400).send('添加失败:' +err.message);
            });
    });

    /**
     * 删除黑名单项
     * @method DELETE
     * */
    router.delete('/:id_number', function (req, res) {
        blackList.delete(req.params.id_number)
            .then(function () {
                req.log.info('黑名单_删除_成功',{id:req.params.id_number});
                res.send('删除成功');
            }).catch(function (err) {
            req.log.error('黑名单_删除_失败',{err:err});
                res.status(400).send('删除失败:' + err.message);
            });
    });

    module.exports = router;
})();