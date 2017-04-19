/**
 * Created by tastycarb on 2017/4/14.
 */
(function(){
    var router = require('express').Router(),
        winston = require('../../Logger').getInstance(),
        _ = require('lodash');

    router.get('/',function(req,res){

        var from = new Date(req.query.from);
        if(!from) from = new Date(_.now() - 22 * 60 * 60 * 1000);

        var until = new Date(req.query.until);
        if(!until) until =  new Date();

        winston.query(_.defaults({
            from: from,
            until: until,
            limit: req.query.limit || 10,
            start: 0,
            order: 'desc'
        }),function(err,result){
            if(err) console.error(err);
            res.send(JSON.stringify(result.file));
        });
    });

    module.exports = router;
})();