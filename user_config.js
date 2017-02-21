(function() {
	//var LocalConfig = require('./config/LocalConfig.json');
	var lowdb = require('lowdb'),
		_ = require('lodash'),
		config = lowdb('./config/config.json'),
		localConfig = require('./config/LocalConfig.json');

	module.exports = {
        MySQLPath:localConfig.MySQLPath,
        db_config:localConfig.db_config,
        redis_config:localConfig.redis_config,

        admin_passport:{
        	get username(){return config.get('admin_passport.username').value();},
			get password(){return config.get('admin_passport.password').value();},
			set password(val){config.set('admin_passport.password',val).value();}
		},

		dump_plan:{
        	get path(){return config.get('dump_plan.path').value();},
        	get schedule(){return config.get('dump_plan.schedule').value();},
			set schedule(val){config.set('dump_plan.schedule',val).value();}
		},

        op_res_text:config.get('op_res_text').value(),
		exam_sites:config.get('exam_sites').value(),
		limit_rules:config.get('limit_rules').value()

	};

})();