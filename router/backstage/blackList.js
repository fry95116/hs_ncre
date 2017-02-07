/**
 * Created by tom smith on 2017/2/7.
 */
(function(){
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        multer = require('multer'),
        diskStore = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './tempData/import');
            },
            filename: function (req, file, cb) {
                cb(null,'tempData');
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
        blackList = require('../../blackList');


    /**
     * 浏览黑名单
     * @method GET*/
    router.get('/', function (req, res) {
        blackList.get()
            .then(function (result) {
                res.send(result);
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
            blackList.import(req.file.suffix)(req.file.path)
                .then(function(){
                    res.send('succeed');
                })
                .catch(function(err){
                    res.status(400).send(err.message);
                });
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
                res.send('succeed');
            })
            .catch(function (err) {
                res.status(400).send(err.message);
            });
    });

    /**
     * 删除黑名单项
     * @method DELETE
     * */
    router.delete('/:id_number', function (req, res) {
        blackList.delete(req.params.id_number)
            .then(function () {
                res.send('succeed');
            }).catch(function (err) {
            res.status(400).send('Error:' + err.message);
        });
    });

    module.exports = router;
})();