var config = require('./user_config');
var _ = require('lodash');
_.each(config,function(v,k){
    console.log(k);
    if(/.+_operator/.test(k))
        _.each(v,function(v,k){
            console.log('\t' + k + '()');
        });
});
