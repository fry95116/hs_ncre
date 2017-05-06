(function() {
	//var LocalConfig = require('./config/LocalConfig.json');
	var lowdb = require('lowdb'),
		_ = require('lodash'),
		Promise = require('bluebird'),

        config = lowdb('./config/config.json'),
		localConfig = require('./config/LocalConfig.json');

	module.exports = {
        MySQLPath:localConfig.MySQLPath,
        db_config:localConfig.db_config,
		table_names:localConfig.table_names,
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

		exam_sites_operator:{

			addSite:function(examSite){
                return new Promise(function(resolve,reject){
                    //类型检查
                    if(_.has(examSite,'code') && _.has(examSite,'name')){
                        examSite = _.pick(examSite,['code','name']);			//过滤无用属性
						//重复检查
                        var i = config.get('exam_sites').findIndex(function(e){
                            return e.code == examSite.code;
                        }).value();
                        if(i == -1){
                        	examSite.subjects = [];
                            config.get('exam_sites').push(examSite).value();
                            resolve();
                        }
                        else reject(new Error('该考点号已经存在'));
                    }
					else reject(new Error('非法的类型'));

                });

			},
            updateSite:function(exam_site_code,key,value){
                return new Promise(function(resolve,reject){
                    //类型检查
                    if(key !== 'code' && key !== 'name') {
                        reject(new Error('无效的属性'));
                        return;
                    }

                    var examSites = config.get('exam_sites');
                    if(key === 'code' && exam_site_code !== value){
                        //重复检查(新的考点代码)
                        if(examSites.findIndex(function(e){return e.code == value;}).value() != -1){
                            reject(new Error('该考点号已经存在'));
                            return;
                        }
                    }
                    //更新信息
                    var oldVal = examSites.find(function(e){
                        return e.code == exam_site_code;
                    }).value();
                    oldVal[key] = value;
                    config.write();
                    resolve();
                });

            },
			removeSite:function(exam_site_code){
                return new Promise(function(resolve,reject){
                    config.get('exam_sites').remove(function(e){
                        return e.code == exam_site_code
                    }).value();
                    resolve();
                });
			},

			addSubject:function(exam_site_code,subject){
                return new Promise(function(resolve,reject){
                	if(_.has(subject,'code') && _.has(subject,'name') && _.has(subject,'duration')){		//类型检查
						subject = _.pick(subject,['code','name','duration']);			//过滤无用属性

                        var examSiteIndex = config.get('exam_sites').findIndex(function(e){
                            return e.code == exam_site_code;
                        }).value();
                        //考点重复检查
                        if(examSiteIndex == -1) reject(new Error('该考点不存在'));
                        else{
                            var i = config.get('exam_sites['+ examSiteIndex +'].subjects').findIndex(function(e){
                                return e.code == subject.code;
                            }).value();
                            //科目重复检查
                            if(i != -1) reject(new Error('该科目代码已存在'));
							else {
                            	config.get('exam_sites['+ examSiteIndex +'].subjects').push(subject).value();
                            	resolve();
                            }
                        }
					}
					else{
                		reject(new Error('缺少必要的数据项'));
					}
                });
			},
			removeSubject:function(exam_site_code,subject_code){
                return new Promise(function(resolve,reject){
                    var i = config.get('exam_sites').findIndex(function(e){
                        return e.code == exam_site_code;
                    }).value();
                    if(i !== -1) config.get('exam_sites['+ i +'].subjects').remove(function(e){
                        return e.code == subject_code;
                    }).value();
                    resolve();
                });
			}
		},

		limit_rules:config.get('limit_rules').value(),
        limit_rules_operator:{
            addRule:function(rule){
                return new Promise(function(resolve,reject){
                    rule = _.pick(rule,['desc','limitNum','limit_obj']);
                    //类型检查
                    if(!(_.isString(rule.desc) && _.isString('string') && _.isArray(rule.limit_obj))){
                        reject(new Error('非法的数据'));
                    }
                    else {
                        var erron = _.findIndex(rule.limit_obj,function(limit_obj){
                            //考点代码检查
                            if(_.isUndefined(limit_obj.exam_site_code)) return true;

                            var examSite = config.get('exam_sites').find(function(el){
                                return el.code == limit_obj.exam_site_code;
                            }).value();
                            if(_.isUndefined(examSite)) return true;
                            //如果不存在学科代码，检查通过
                            if(_.isUndefined(limit_obj.subject_code)) return false;
                            //如果存在学科代码，检查之
                            var subject = _.find(examSite.subjects,function(el){
                                return el.code == limit_obj.subject_code;
                            });
                            return _.isUndefined(subject);
                        });

                        if(erron != -1) reject(new Error('非法的限制科目（index：' + erron + '）'));
                        else {
                            config.get('limit_rules').push(rule).value();
                            resolve();
                        }
                    }
                });
            },
            removeRule:function(index){
                return new Promise(function(resolve,reject){
                    config.get('limit_rules').remove(function(e,i){
                        return i == index;
                    }).value();
                    resolve();
                });
            }
        },

        test_rooms:config.get('test_rooms').value(),
        test_rooms_operator:{

            addTestRoom:function(testRoom){
                return new Promise(function(resolve,reject){
                    //类型检查
                    if(_.has(testRoom,'code') && _.has(testRoom,'location')){
                        examSite = _.pick(testRoom,['code','name']);			//过滤无用属性
                        //重复检查
                        var i = config.get('test_rooms').findIndex(function(e){
                            return e.code == testRoom.code;
                        }).value();
                        if(i == -1){
                            testRoom.batchs = [];
                            config.get('test_rooms').push(testRoom).value();
                            resolve();
                        }
                        else reject(new Error('该考场号已经存在'));
                    }
                    else reject(new Error('非法的类型'));
                });

            },
            updateTestRoom:function(test_room_code,key,value){
                return new Promise(function(resolve,reject){
                    //类型检查
                    if(key !== 'code' && key !== 'location') {
                        reject(new Error('无效的属性'));
                        return;
                    }

                    var examSites = config.get('test_rooms');
                    if(key === 'code' && test_room_code !== value){
                        //重复检查(新的考点代码)
                        if(examSites.findIndex(function(e){return e.code == value;}).value() != -1){
                            reject(new Error('该考场号已经存在'));
                            return;
                        }
                    }
                    //更新信息
                    var oldVal = examSites.find(function(e){
                        return e.code == test_room_code;
                    }).value();
                    oldVal[key] = value;
                    config.write();
                    resolve();
                });

            },
            removeTestRoom:function(code){
                return new Promise(function(resolve,reject){
                    config.get('test_rooms').remove(function(e){
                        return e.code == code;
                    }).value();
                    resolve();
                });
            },

            addBatch:function(test_room_code,batch){
                return new Promise(function(resolve,reject){
                    if(_.has(batch,'code') && _.has(batch,'startTime') && _.has(batch,'endTime')) {		//类型检查
                        batch = _.pick(batch, ['code', 'startTime', 'endTime']);			//过滤无用属性

                        //日期合法性校验
                        batch.startTime = new Date(batch.startTime);
                        batch.endTime = new Date(batch.endTime);

                        if(batch.startTime && batch.endTime){
                            var testRoomIndex = config.get('test_rooms').findIndex(function (e) {
                                return e.code == test_room_code;
                            }).value();
                            //考场检查
                            if (testRoomIndex == -1) reject(new Error('该考场不存在'));
                            else {
                                var i = config.get('test_rooms[' + testRoomIndex + '].batchs').findIndex(function (e) {
                                    return e.code == batch.code;
                                }).value();
                                //科目重复检查
                                if (i != -1) reject(new Error('该批次号已存在'));
                                else {
                                    config.get('test_rooms[' + testRoomIndex + '].batchs').push(batch).value();
                                    resolve();
                                }
                            }
                        }else reject('非法的日期格式（考试开始时间）');

                    }
                    else reject(new Error('缺少必要的数据项'));
                });
            },
            removeBatch:function(test_room_code,batch_code){
                return new Promise(function(resolve,reject){
                    var i = config.get('test_rooms').findIndex(function(e){
                        return e.code == test_room_code;
                    }).value();
                    if(i !== -1) config.get('test_rooms['+ i +'].batchs').remove(function(e){
                        return e.code == batch_code;
                    }).value();
                    resolve();
                });
            }
        }

	};

})();