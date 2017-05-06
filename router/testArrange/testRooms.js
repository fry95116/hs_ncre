/**
 * Created by tastycarb on 2017/5/4.
 */

/**
 * Created by tastycarb on 2017/4/19.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        user_config = require('../../user_config'),
        _ = require('lodash');

    /** 获取考场列表 */
    router.get('/',function(req,res,next){
        res.send(JSON.stringify(user_config.test_rooms));
    });

    /** 添加考场 */
    router.post('/',bodyParser.urlencoded({extended: true}),function(req,res,next){
        user_config.test_rooms_operator.addTestRoom(req.body)
            .then(function(){
                res.send('添加成功');
            })
            .catch(function(err){
                res.status(400).send('添加失败:' + err.message);
            });
    });
    /** 修改考场 */
    router.put('/:test_room_code/:attr',bodyParser.urlencoded({extended: true}),function(req,res,next){
        // req = {value}
        user_config.test_rooms_operator.updateTestRoom(req.params.test_room_code,req.params.attr,req.body.value)
            .then(function(){
                res.send('修改成功');
            }).catch(function(err){
            res.status(400).send('修改失败：' + err.message);
        });
    });

    /** 删除考场 */
    router.delete('/:test_room_code',function(req,res,next){
        user_config.test_rooms_operator.removeTestRoom(req.params.test_room_code)
            .then(function(){
                res.send('删除成功');
            })
            .catch(function(err){
                res.status(400).send('删除失败：' + err.message);

            });
    });

    /** 添加批次 */
    router.post('/:test_room_code/batchs',bodyParser.urlencoded({extended: true}),function(req,res,next){
        user_config.test_rooms_operator.addBatch(req.params.test_room_code,req.body)
            .then(function(){
                res.send('添加成功')
            })
            .catch(function(err){
                res.status(400).send('添加失败：' + err.message);
            });
    });

    /** 删除批次 */
    router.delete('/:test_room_code/batchs/:batch_code',function(req,res,next){
        user_config.test_rooms_operator.removeBatch(req.params.test_room_code,req.params.batch_code)
            .then(function(){
                res.send('删除成功');
            })
            .catch(function(err){
                res.status(400).send('删除失败：' + err.message);
            });
    });

    module.exports = router;

})();
