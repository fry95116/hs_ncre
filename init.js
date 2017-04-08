/**
 * Created by tastycarb on 2017/3/20.
 */
var mysql = require('mysql'),
	redis = require('redis'),
	Promise = require('bluebird'),
	_ = require('lodash');

var LocalConfig = require('./config/LocalConfig.json'),
	redis_config = LocalConfig.redis_config,
	db_config = LocalConfig.db_config,
	tableStructure = [
		{Field:'address',Type:'varchar(255)',Null:'YES',Key:'',Default:null,Extra:''},
		{Field:'birthday',Type:'varchar(255)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'career',Type:'tinyint(4)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'degree_of_education',Type:'tinyint(4)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'email',Type:'varchar(255)',Null:'YES',Key:'',Default:null,Extra:''},
		{Field:'exam_site_code',Type:'int(11)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'id_number',Type:'varchar(255)',Null:'NO',Key:'PRI',Default:null,Extra:''},
		{Field:'id_type',Type:'tinyint(4)',Null:'NO',Key:'PRI',Default:null,Extra:''},
		{Field:'name',Type:'varchar(255)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'nationality',Type:'tinyint(4)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'phone',Type:'varchar(11)',Null:'YES',Key:'',Default:null,Extra:''},
		{Field:'post_code',Type:'varchar(11)',Null:'YES',Key:'',Default:null,Extra:''},
		{Field:'remark',Type:'varchar(255)',Null:'YES',Key:'',Default:null,Extra:''},
		{Field:'sex',Type:'varchar(6)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'subject_code',Type:'tinyint(4)',Null:'NO',Key:'',Default:null,Extra:''},
		{Field:'training_type',Type:'tinyint(4)',Null:'NO',Key:'',Default:null,Extra:''}
	];


//数据库连接检查
function checkMysql() {
	return new Promise(function (resolve, reject) {
		console.log('测试mysql连接......');
		var con = mysql.createConnection(db_config); // 连接数据库
		con.connect(function (err) {
			if (err) {
				if (err.code === 'ECONNREFUSED') {
					console.log('ERROR:无法连接到mysql server,请检查mysql连接配置.');
				}
				else {
					console.log('ERROR:无法连接到mysql(未知错误)');
				}
				reject(err);
			}
			else {
				console.log('mysql连接正常.');
				resolve(con);
			}
		});
	});
}

function checkTable(con) {
	return new Promise(function (resolve, reject) {
		console.log('测试表结构......');
		con.query('DESC data;', function (err, res) {
			if (err) {
				//console.log(err);
				console.log('ERROR:表结构获取失败(未知错误)');
				reject(err);

			}
			else if(res.length !== tableStructure.length){
				console.log('ERROR:表结构错误');
				reject(new Error('表结构错误'));
			}
			else{
				tableStructure = _.sortBy(tableStructure,function(v){
					return v.Field;
				});
				res = _.sortBy(res,function(v){
					return v.Field;
				});
				var i = _.findIndex(tableStructure,function(val,index){
					return !_.isEqual(_.toPlainObject(res[index]),val);
				});
				//有缺失项
				if(i !== -1){
					console.log('ERROR:表结构错误');
					reject(new Error('表结构错误'));
				}
				else{
					console.log('表结构正常.');
					con.end();
					resolve();
				}
			}

		});
	});
}

function checkRedis() {
	return new Promise(function (resolve, reject) {
		console.log('测试redis连接......');
		var redisClient = redis.createClient(redisClient);
		redisClient.on('error', function (err) {
			if (err.code === 'ECONNREFUSED') {
				console.log('ERROR:无法连接到redis server,请检查redis连接配置.');
			}
			else {
				console.log('ERROR:无法连接到redis(未知错误)');
			}
			reject(err);
		});
		redisClient.on('connect', function () {
			console.log('redis连接正常.');
			redisClient.quit();
			//resolve();
		});
		redisClient.on('end', function () {
			resolve();
		});
	});
}

checkMysql()
	.then(checkTable)
	.then(checkRedis)
	.then(function () {
		console.log('检查完成,连接正常');
	})
	.catch(function (err) {
		console.log('ERROR:', err);
	});

