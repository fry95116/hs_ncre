var _ = require('lodash');
var child_process = require('child_process');

var user_config = require('./user_config');
var db_config = user_config.db_config;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');



var opt = _.clone(db_config);
opt.fullName_mysqldump = path.join(user_config.paths.mysqldump,'mysqldump.exe');
opt.fullName_dumpFile = path.join(user_config.paths.dump,new Date().toLocaleString().replace(/\s/g,'_').replace(/[:\.]/g,'-') + '.sql');

fs.accessAsync(opt.fullName_mysqldump).then(function(){
    return new Promise(function(resolve,reject){
        var cmd = '"<%= fullName_mysqldump %>" -u <%= user %> -p<%= password %> <%= database %> > "<%= fullName_dumpFile %>"';
        cmd = _.template(cmd)(opt);
        child_process.exec(cmd,function(err,stdout,stderr){
            if(stderr != '') reject(new Error(stderr));
            else resolve();
        });
    });
}).catch(function(err){
    console.error(err);
});