(function() {
	var LocalConfig = require('./config/LocalConfig.json');
	var config = require('./config/config.json');

	exports.MySQLPath = LocalConfig.MySQLPath;
	exports.db_config = LocalConfig.db_config;
    exports.redis_config = LocalConfig.redis_config;
    exports.admin_passport = LocalConfig.admin_passport;

	exports.op_res_text = config.op_res_text;

	exports.exam_sites = config.exam_plan.exam_sites;
	exports.limit_rules = config.exam_plan.limit_rules;

})();