/**
 * Created by tastycarb on 2017/5/8.
 */
var Promise = require('bluebird'),
    _ = require('lodash'),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path'),
    child_process = require('child_process'),
    user_config = require('../user_config'),
    db_config = user_config.db_config;

_.templateSettings.interpolate = /\{\{(.+?)\}\}/g;


function selectDumps(opt){

    var offset = parseInt(opt.offset);
    var limit = parseInt(opt.limit);

    return fs.readdirAsync(user_config.paths.dump)
        .filter(function(fileName){
            return path.parse(fileName).ext === '.sql';
        })
        .map(function(fileName){
            return fs.statAsync(path.join(user_config.paths.dump,fileName))
                .then(function(stats){
                    return new Promise(function(resolve){
                        resolve({
                            //编码
                            id:new Buffer(path.parse(fileName).name).toString('base64').replace(/=/g,'_').replace(/\//g,'-'),
                            atime:stats.atime.getTime()
                        });
                    });
                })
        })
        .then(function(files){
            return new Promise(function(resolve){
                files = _.sortBy(files,function(el){return el.atime;}).reverse();

                var re = {total:files.length, rows:files};

                if(_.isInteger(offset) && _.isInteger(limit)) re.rows = _.slice(files,offset,offset + limit);
                else if(_.isInteger(offset)) re.rows = _.slice(files,offset);
                resolve(re);
            });
        });
}

/** 备份 */
function addDumpFile(fileName){
    fileName = fileName || new Date().toLocaleString().replace(/\s/g,'_').replace(/[:\.]/g,'-');
    return new Promise(function(resolve,reject){
        var opt = _.clone(db_config);
        opt.fullName_mysqldump = path.join(user_config.paths.mysql,'mysqldump.exe');
        opt.fullName_dumpFile = path.join(user_config.paths.dump, fileName + '.sql');

        fs.accessAsync(opt.fullName_mysqldump)
            .then(function(){
                return fs.accessAsync(user_config.paths.dump);
            })
            .then(function(){
                return new Promise(function(resolve,reject){
                    var cmd = '"{{fullName_mysqldump}}" -u {{user}} -p{{password}} {{database}} > "{{fullName_dumpFile}}"';
                    cmd = _.template(cmd)(opt);
                    child_process.exec(cmd,function(err,stdout,stderr){
                        if(stderr != '') reject(new Error(stderr));
                        else resolve();
                    });
                });
            })
            .then(resolve)
            .catch(function(err){
                if(err.code === 'ENOENT') reject(new Error('文件或目录不存在'));
                else reject(err);
            });

    });
}

/** 还原 */
function restore(id){
    return new Promise(function(resolve,reject){
        var fileName = new Buffer(id.replace(/_/g,'=').replace(/-/g,'/'),'base64').toString() + '.sql';
        var opt = _.clone(db_config);
        opt.fullName_mysql = path.join(user_config.paths.mysql,'mysql.exe');
        opt.fullName_dumpFile = path.join(user_config.paths.dump, fileName);

        fs.accessAsync(opt.fullName_mysql)
            .then(function(){
                return fs.accessAsync(opt.fullName_dumpFile);
            })
            .then(function(){
                return new Promise(function(resolve,reject){
                    var cmd = '"{{fullName_mysql}}" -u {{user}} -p{{password}} {{database}} < "{{fullName_dumpFile}}"';
                    cmd = _.template(cmd)(opt);
                    child_process.exec(cmd,function(err,stdout,stderr){
                        if(stderr != '') reject(new Error(stderr));
                        else resolve();
                    });
                });
            })
            .then(resolve)
            .catch(function(err){
                if(err.code === 'ENOENT') reject(new Error('文件不存在'));
                else reject(err);
            });

    });
}


/** 删除备份文件 */
function deleteDumpFile(fileName){
    return new Promise(function(resolve,reject){
        fs.unlinkAsync(path.join(user_config.paths.dump,fileName))
            .then(resolve)
            .catch(function(err){
                if(err.code === 'ENOENT') resolve();
                else reject(err);
            });
    });

}

/** 删除备份 */
function deleteDump(id){
    //解码
    var fileName = new Buffer(id.replace(/_/g,'=').replace(/-/g,'/'),'base64').toString() + '.sql';
    return deleteDumpFile(fileName);
}

/** 删除所有备份 */
function deleteAllDumps(){
    return fs.readdirAsync(user_config.paths.dump)
        .filter(function(fileName){
            return path.parse(fileName).ext.toLowerCase() === '.sql';
        })
        .map(deleteDumpFile);
}


exports.selectDumps = selectDumps;
exports.dump = addDumpFile;
exports.restore = restore;
exports.deleteDump = deleteDump;
exports.deleteAllDumps = deleteAllDumps;

