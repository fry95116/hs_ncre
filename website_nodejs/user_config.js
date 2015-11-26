(function() {
	var config = require('./config/config.json');
	var jsonPath = require('JSONPath');

	exports.path = config.path;
	exports.db_config = config.db_config;
	exports.op_res_text = config.op_res_text;

	exports.sites_info = config.exam_plan.exam_sites;
	exports.sites_info.get = function(path){
		return jsonPath.eval(this, path);
	};

	exports.limit_rules = config.exam_plan.limit_rules;
	exports.limit_rules.get = function(path){
		return jsonPath.eval(this, path);
	};

})();