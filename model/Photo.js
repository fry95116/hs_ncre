/**
 * 数据合法性检查与数据库操作
 * @module dbo
 * */

(function() {
    var mysql = require('mysql'),
        _ = require('lodash'),
        Promise = require('bluebird'),
        images = require('images'),
        uuid = require('node-uuid'),
        archiver = require('archiver'),
        fs = require('fs'),
        path = require('path'),
        decompress = require('decompress'),

        user_config = require('./../user_config'),
        db_config = user_config.db_config,
        table_names = user_config.table_names,

        log = require('../Logger').getLogger();

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var con;
    //以下代码用于维持mysql的连接
    //后期可以考虑连接池
    function handleDisconnect() {

        con = mysql.createConnection(db_config); // 连接数据库

        con.connect(function(err) {
            if(err) {
                if(err.code = 'ECONNREFUSED'){
                    log.error('照片_数据库连接:无法连接到数据库，请检查数据库配置',{err:err});
                }
                else{
                    log.error('照片_数据库连接:未知错误',{err:err});
                }
            }
            else{
                log.info('照片_数据库连接_成功。');
            }
        });
        con.on('error', function(err) {
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                log.error('照片_数据库连接_中断.重连中...',{err:err});
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }
    handleDisconnect();

    /**************** 数据库操作 *******************/

    /**
     * 开始事务
     * */
    function begin() {
        return new Promise(function(resolve,reject){
            con.beginTransaction(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * 回滚事务
     * */
    function rollback() {
        return new Promise(function(resolve,reject){
            con.rollback(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * 提交事务
     * */
    function commit() {
        return new Promise(function(resolve,reject){
            con.commit(function(err){
                if(err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * 重复检查
     * @param {int} id_number 证件号
     * @return {Promise} Promise对象,resolve时传入counts */
    function repeatCheck(id_number) {
        return new Promise(function(resolve,reject){
            con.query(
                'SELECT count(1) AS \'count\' FROM ' + table_names.photo +
                ' WHERE id_number=?',
                id_number,
                function(err, res) {
                    if (err) reject(err);
                    else if (res[0].count > 0) reject(new Error('照片已经存在'));
                    else resolve();
                }
            );
        });
    }

    function exists(id_number) {
        return new Promise(function(resolve,reject){
            con.query(
                'SELECT count(1) AS \'count\' FROM ' + table_names.photo +
                ' WHERE id_number=?',
                id_number,
                function(err, res) {
                    if (err) reject(err);
                    else if (res[0].count > 0) resolve();
                    else reject(new Error('照片不存在'));
                }
            );
        });
    }


    /**
     * 查询照片信息
     * @param {Object} option 查询参数
     * @return {Promise} Promise对象,resolve时传入查询结果*/
    /**
     * 查询参数
     * @typedef {Object} SelectOption
     * @property {string} searchText 搜索内容
     * @property {bool} strictMode 严格搜索模式
     * @property {string} order 排序模式
     * @property {number} offset 截取上界
     * @property {number} limit 截取数量
     * */
    function selectPhotoInfo(option){
        return new Promise(function(resolve,reject){

            var sql = '';
            //单个查询
            if(_.isString(option)){
                sql = 'SELECT * FROM ' + table_names.photo + ' WHERE id_number=?';				        //查询用
                con.query(sql,option,function(err,res){
                    if(err) reject(err);
                    else resolve(res[0]);
                });
            }
            else{
                var opt = {
                    searchText:'',
                    strictMode:false,
                    order:'ASC',
                    offset:0,
                    limit: -1
                };

                opt = _.extend(opt,option);
                opt.table = table_names.photo;
                opt.searchText = _.trim(opt.searchText);

                //option合法性检查
                if(opt.order.toUpperCase() != 'DESC') opt.order = 'ASC';


                sql = 'SELECT * FROM `{{ table }}`';				        //查询用

                var sql_count = 'SELECT count(id_number) AS `count` FROM `{{ table }}`';	//统计总数用
                //搜索部分
                if(opt.searchText !== ''){
                    if(opt.strictMode == 'true'){
                        sql += ' WHERE id_number=\'{{ searchText }}\'';
                        sql_count += ' WHERE id_number=\'{{ searchText }}\'';
                    }

                    else{
                        sql += ' WHERE id_number LIKE \'%{{ searchText }}%\'';
                        sql_count += ' WHERE id_number LIKE \'%{{ searchText }}%\'';
                    }

                }
                //排序部分
                if(opt.sort !== '')
                    sql += ' ORDER BY id_number {{ order }}';
                //限制部分
                if(opt.limit >= 0) sql += ' limit {{ offset }},{{ limit }}';

                sql = _.template(sql + ';')(opt);
                sql_count = _.template(sql_count + ';')(opt);

                //查询过程
                var query_completed = false;
                var re = {};
                //计数
                con.query(sql_count,function(err,res){
                    if(err) reject(err);
                    else{
                        re.total = res[0].count;
                        if(query_completed) resolve(re);
                        else query_completed = true;
                    }
                });
                //查询
                con.query(sql,function(err,res){
                    if(err) reject(err);
                    else{
                        re.rows = res;
                        if(query_completed) resolve(re);
                        else query_completed = true;
                    }
                });
            }

        });
    }

    /**
     * 插入照片信息
     * @param {object} id_number 证件号
     * @param {object} file_name 文件名
     * @return {Promise} Promise对象*/
    function insertPhotoInfo(id_number,file_name) {
        return new Promise(function(resolve,reject){

            if(_.isUndefined(id_number) || _.isUndefined(file_name)){
                reject(new Error('非法的数据：缺少数据项'));
                return;
            }
            // 将身份证中可能出现的x变成大写字母
            id_number = id_number.toUpperCase();
            //重复检查
            repeatCheck(id_number)
                .then(function(){
                    //插入数据

                    id_number = id_number.toUpperCase();    //对齐省份证号的x为小写x

                    var sql = 'INSERT INTO ' + table_names.photo +
                        ' SET id_number=' + con.escape(id_number) + ',file_name=' + con.escape(file_name) + ';';
                    con.query(sql, function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                })
                .catch(reject);
        });
    }

    /**
     * 删除照片信息
     * @param {string} id_number 证件号
     * */
    function deletePhotoInfo(id_number){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.photo + ' WHERE id_number=?;';
            con.query(sql, id_number, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * 删除全部照片信息
     * */
    function deleteAllPhotoInfo(){
        return new Promise(function(resolve,reject){
            //删除数据
            var sql = 'DELETE FROM ' + table_names.photo + ';';
            con.query(sql, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**************** 文件操作 *******************/

    function getImage(filename){
        return new Promise(function(resolve,reject){
            var absolutePath = path.join(user_config.paths.photo,filename);//取绝对路径
            fs.readFile(absolutePath,function(err,res){
                if(err) {
                    if(err.code === 'ENOENT') reject(new Error('文件不存在'));
                    else reject(err);
                }
                else resolve(res);
            });
        });
    }

    function createImage(buffer,type){
        return new Promise(function(resolve,reject){

            var img = images(buffer);
            var width = img.width(),height = img.height();

            if(width < 144 || height < 192) reject(new Error('照片分辨率过小'));
            else if(Math.abs(Math.floor(width / 3 * 4 - height)) > 2)
                reject(new Error('照片比例错误'));
            else __write();

            function __write(){
                //文件名
                var filename = uuid.v4().replace(/-/g, '') + '.' + type;
                //绝对路径
                var absolutePath = path.join(user_config.paths.photo,filename);

                fs.writeFile(absolutePath,buffer,{flag:'wx+'},function(err){
                    if (err) {
                        if (err.code === 'EEXIST') __write();
                        else reject(err)
                    }
                    else resolve(filename);
                });
                /*
                fs.open(absolutePath, 'wx+', function(err, fd){
                    if (err) {
                        if (err.code === 'EEXIST') __write();
                        else reject(err)
                    }
                    else{
                        fs.write(fd,buffer,function(error){
                            if(error) fs.close(fd,function(err){
                                if(err) reject(err);
                                else reject(error);
                            });
                            else fs.close(fd,function(err){
                                if(err) reject(err);
                                else resolve(filename);
                            });

                        });
                    }
                });*/
            }
        });
    }

    function deleteImage(file_name){
        return new Promise(function(resolve,reject){

            file_name = file_name || '';
            if(_.isObject(file_name)) file_name = file_name.file_name;
            if(file_name === '') resolve(); //reject(new Error('无文件名传入'));
            var absolutePath = path.join(user_config.paths.photo,file_name); //绝对路径
            fs.unlink(absolutePath, function(err){
                if(err) {
                    if(err.code === 'ENOENT') {
                        resolve();
                    }
                    else reject(err);
                }
                else resolve();
            });
        });
    }

    function readImageDir(){
        return new Promise(function(resolve,reject){
            fs.readdir(user_config.paths.photo,function(err,res){
                if(err) reject(err);
                else resolve(res);
            });
        });
    }

    /**************** 对外接口 *******************/
    exports.begin = begin;
    exports.rollback = rollback;
    exports.commit = commit;

    exports.repeatCheck = repeatCheck;
    exports.exists = exists;
    exports.selectPhotoInfo = selectPhotoInfo;
    exports.getPhoto = getImage;

    function deletePhoto(id_number){
        return selectPhotoInfo(id_number)
            .then(deleteImage)
            .then(_.partial(deletePhotoInfo,id_number));
    }
    exports.deletePhoto = deletePhoto;

    function deleteAllPhoto(){
        return deleteAllPhotoInfo()
            .then(readImageDir)
            .map(deleteImage);
    }
    exports.deleteAllPhoto = deleteAllPhoto;

    function addPhoto(id_number,buffer,type){
        return createImage(buffer,type)
            .then(_.partial(insertPhotoInfo,id_number));
    }
    exports.addPhoto = addPhoto;

    function updatePhoto(id_number,buffer,type){
        return deletePhoto(id_number)
            .then(_.partial(addPhoto,id_number,buffer,type));
    }
    exports.updatePhoto = updatePhoto;


    function importPhoto(buffer){
        return new Promise(function(resolve,reject){
            decompress(buffer).then(function(files){
                    Promise.mapSeries(files,function(file){
                        return new Promise(function(resolve,reject){
                            //内容:file.data
                            //路径:file.path
                            if(file.type !== 'file') resolve();
                            else{
                                var acceptType = {'.jpg':'', '.png':'', '.gif':''};
                                var info = path.parse(file.path);
                                if(info.ext in acceptType){
                                    addPhoto(info.name,file.data,_.trimStart(info.ext,'.'))
                                        .then(resolve)
                                        .catch(function(err){
                                            err.message += '(文件名:' + info.base + ')';
                                            reject(err);
                                        })
                                }
                                else reject('不受支持的文件类型(文件名:' + info.base + ')');
                            }
                        });
                    })
                    .then(resolve)
                    .catch(function(err){
                        deleteAllPhoto()
                            .then(function(error){reject(err);})
                            .catch(reject);
                    })
            })
        });
    }
    exports.importPhoto = importPhoto;

    function exportPhoto(replaceFileName,writeStream){
        return new Promise(function(resolve,reject){
            var archive = archiver('zip', {store: true});

            archive.on('error', reject);
            archive.pipe(writeStream);

            if(replaceFileName === true){
                selectPhotoInfo().then(function(res){
                    _.each(res.rows,function(row){
                        archive.file(
                            path.join(user_config.paths.photo,row.file_name),
                            { name: row.id_number + path.extname(row.file_name)}
                        );
                    });
                    archive.finalize();
                    resolve();
                }).catch(reject);
            }
            else {
                archive.directory(user_config.paths.photo,'/');
                archive.finalize();
                resolve();
            }
        });
    }
    exports.exportPhoto = exportPhoto;

})();
