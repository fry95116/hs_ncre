(function () { 
    var router = require('express').Router();
    router.get('/', function (req, res) { 
        res.render('conf_guide/start');
    });

    router.param('step', function (req, res, next, id) {
        if (/^step\d$/.test(id)) req.my_step = id;
        next();
    });
    
    router.get('/:step', function (req, res) {
        if(req.my_step) res.render('conf_guide/' + req.my_step);
    });

    module.exports = router;
})();