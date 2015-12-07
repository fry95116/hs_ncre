(function() {
	var LocalConfig = require('./config/LocalConfig.json');
	var config = require('./config/config.json');
	var jsonPath = require('JSONPath');

	exports.MySQLPath = LocalConfig.MySQLPath;
	exports.db_config = LocalConfig.db_config;
	exports.op_res_text = config.op_res_text;

	exports.sites_info = config.exam_plan.exam_sites;
	exports.sites_info.get = function(path){
		return jsonPath.eval(this, path);
	};
	exports.sites_info.findName = function(esc,sc){
		if(sc) return jsonPath.eval(this, '$[?(@.code==' + esc + ')].subjects[?(@.code==' + sc + ')].name')[0];
		else return jsonPath.eval(this, '$[?(@.code==' + esc + ')].name')[0];
	}
	exports.sites_info.each = function(cb){
		for(var i = 0; i < this.length; ++i)cb(this[i]);
	};

	exports.limit_rules = config.exam_plan.limit_rules;
	exports.limit_rules.get = function(path){
		return jsonPath.eval(this, path);
	};
	exports.limit_rules.each = function(cb){
		for(var i = 0; i < this.length; ++i)cb(this[i]);
	};

})();