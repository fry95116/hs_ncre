/**
 * Created by tastycarb on 2017/5/7.
 */
/**
 * Created by tom smith on 2017/2/7.
 */
(function () {
    var router = require('express').Router(),
        bodyParser = require('body-parser'),
        user_config = require('../../user_config'),
        _ = require('lodash');

    router.get('/',function(req,res,next){
        res.setHeader('Content-type','application/json');
        res.send(user_config.functionControl);
    });

    router.post('/', bodyParser.urlencoded({extended: true}), function (req, res) {
        var data_in = {};
        _.each(['enter','print','query'],function(value){
            data_in[value] = req.body[value] === 'on';
        });
        user_config.functionControl = data_in;
        res.send('设置成功')
    });

    module.exports = router;

})();
