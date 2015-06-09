var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	app = express(),
	db=require('mongous').Mongous,
	fs=require('fs'),
	_=require('underscore');

var sub1=1140,sub2=3300;

var mapping_exam_site_code = {
  '410067': '华北水利水电大学（北环路36号）',
  '410084': '华北水利水电大学（郑东新区）'
};

var mapping_sex={
	'male':'男',
	'famale':'女'
}
var mapping_degree_of_education = {
	'1': '博士',
	'2': '硕士',
	'3': '本科',
	'4': '大专(专科)',
	'5': '高中(职高)',
	'6': '中专(中技)',
	'7': '初中',
	'8': '初中以下'
};

var mapping_id_type = {
	'1': '中华人民共和国居民身份证',
	'2': '台湾居民往来大陆通行证',
	'3': '港澳居民来往内地通行证',
	'4': '军人证件',
	'5': '护照'
};

var mapping_nationality = {
	'01': '汉',
	'02': '蒙古',
	'03': '回',
	'04': '藏',
	'05': '维吾尔',
	'06': '苗',
	'07': '彝',
	'08': '壮',
	'09': '布依',
	'10': '朝鲜',
	'11': '满',
	'12': '侗',
	'13': '瑶',
	'14': '白',
	'15': '土家',
	'16': '哈尼',
	'17': '哈萨克',
	'18': '傣',
	'19': '黎',
	'20': '傈僳',
	'21': '佤',
	'22': '畲',
	'23': '高山',
	'24': '拉祜',
	'25': '水',
	'26': '东乡',
	'27': '纳西',
	'28': '景颇',
	'29': '柯尔克孜',
	'30': '土',
	'31': '达斡尔',
	'32': '仫佬',
	'33': '羌',
	'34': '布朗',
	'35': '撒拉',
	'36': '毛难',
	'37': '仡佬',
	'38': '锡伯',
	'39': '阿昌',
	'40': '普米',
	'41': '塔吉克',
	'42': '怒',
	'43': '乌孜别克',
	'44': '俄罗斯',
	'45': '鄂温克',
	'46': '德昂',
	'47': '保安',
	'48': '裕固',
	'49': '京',
	'50': '塔塔尔',
	'51': '独龙',
	'52': '鄂伦春',
	'53': '赫哲',
	'54': '门巴',
	'55': '珞巴',
	'56': '基诺',
	'97': '其他',
	'98': '外国血统'
};
var mapping_career = {
	'01': '中国共产党中央委员会和地方各级组织负责人',
	'02': '国家机关及其工作机构负责人',
	'03': '民主党派和社会团体及其工作机构负责人',
	'04': '事业单位负责人',
	'05': '企业负责人',
	'08': '军人',
	'09': '不便分类的其他从业人员',
	'10': '失业（含待业及无业人员）',
	'11': '科学研究人员',
	'13': '工程技术人员',
	'17': '农业技术人员',
	'18': '飞机和船舶技术人员',
	'19': '卫生专业技术人员',
	'21': '经济业务人员',
	'22': '金融业务人员',
	'23': '法律专业人员',
	'24': '教学人员',
	'25': '文学艺术工作人员',
	'26': '体育工作人员',
	'27': '新闻出版、文化工作人员',
	'28': '宗教职业者',
	'29': '其他专业技术人员',
	'30': '学生',
	'31': '行政办公人员',
	'32': '安全保卫和消防人员',
	'33': '邮政和电信业务人员',
	'39': '其他办事人员和有关人员',
	'41': '购销人员',
	'42': '仓储人员',
	'43': '餐饮服务人员',
	'44': '饭店、旅游及健身娱乐场所服务人员',
	'45': '运输服务人员',
	'46': '医疗卫生辅助服务人员',
	'47': '社会服务和居民生活服务人员',
	'49': '其他商业、服务业人员',
	'51': '种植业生产人员',
	'52': '林业生产及野生动植物保护人员',
	'53': '畜牧业生产人员',
	'54': '渔业生产人员',
	'55': '水利设施管理养护人员',
	'59': '其他农、林、牧、渔、水利业生产人员',
	'61': '勘测及矿物开采人员',
	'62': '金属冶炼、轧制人员',
	'64': '化工产品生产人员',
	'66': '机械制造加工人员',
	'67': '机电产品装配人员',
	'71': '机械设备修理人员',
	'72': '电力设备安装、运行、检修及供电人员',
	'73': '电子元器件与设备制造、装配、调试及维修人员',
	'74': '橡胶和塑料制品生产人员',
	'75': '纺织、针织、印染人员',
	'76': '裁剪、缝纫和皮革、毛皮制品加工制作人员',
	'77': '粮油、食品、饮料生产加工及饲料生产加工人员',
	'78': '烟草及其制品加工人员',
	'79': '药品生产人员',
	'81': '木材加工、人造板生产、木制品制作及制浆、造纸和纸制品生产加工人员',
	'82': '建筑材料生产加工人员',
	'83': '玻璃、陶瓷、搪瓷及其制品生产加工人员',
	'84': '广播影视制品制作、播放及文物保护作业人员',
	'85': '印刷人员',
	'86': '工艺、美术品制作人员',
	'87': '文化教育、体育用品制作人员',
	'88': '工程施工人员',
	'91': '运输设备操作人员及有关人员',
	'92': '环境监测与废物处理人员',
	'93': '检验、计量人员',
	'99': '其他生产、运输设备操作人员及有关人员'
};

var mapping_department = {
	'01': '资环',
	'02': '水利',
	'03': '土木',
	'04': '机械',
	'05': '电力',
	'06': '环工',
	'07': '管经',
	'08': '信工',
	'09': '外语',
	'10': '数信',
	'11': '法学',
	'43': '国教',
	'45': '建筑',
	'49': '软件'
};
var mapping_school = {
	'01': '其他学校或工作单位',
	'02': '郑州大学',
	'03': '河南工业大学',
	'04': '河南农业大学',
	'05': '河南财经政法大学',
	'06': '铁道警察学院',
	'07': '郑州轻工业学院',
	'08': '中原工学院',
	'09': '河南牧业经济学院',
	'10': '河南中医学院',
	'11': '郑州航空工业管理学院',
	'12': '河南工程学院',
	'13': '河南警察学院',
	'14': '黄河科技学院',
	'15': '郑州科技学院',
	'16': '郑州华信学院',
	'17': '郑州师范学院',
	'18': '郑州成功财经学院',
	'19': '郑州升达经贸管理学院',
	'20': '河南财政税务高等专科学校',
	'21': '郑州电力高等专科学校',
	'22': '郑州幼儿师范高等专科学校',
	'23': '河南医学高等专科学校',
	'24': '郑州澍青医学高等专科学校',
	'25': '河南职业技术学院',
	'26': '郑州铁路职业技术学院',
	'27': '中州大学',
	'28': '河南水利与环境职业学院',
	'29': '河南信息统计职业学院',
	'30': '郑州电力职业技术学院',
	'31': '河南建筑职业技术学院',
	'32': '郑州城市职业学院',
	'33': '郑州理工职业学院',
	'34': '郑州信息工程职业学院',
	'35': '河南艺术职业学院',
	'37': '河南机电职业学院',
	'38': '郑州商贸旅游职业学院',
	'39': '郑州黄河护理职业学院',
	'40': '郑州财税金融职业学院',
	'41': '河南司法警官职业学院',
	'42': '郑州经贸职业学院',
	'43': '郑州交通职业学院',
	'44': '河南检察职业学院',
	'45': '郑州信息科技职业学院',
	'46': '郑州电子信息职业技术学院',
	'47': '嵩山少林武术职业学院',
	'48': '郑州工业安全职业学院',
	'49': '河南经贸职业学院',
	'50': '河南交通职业技术学院',
	'51': '河南农业职业学院',
	'52': '郑州旅游职业学院',
	'53': '郑州职业技术学院',
	'54': '河南工业贸易职业学院'
};

var mapping_item={
	exam_site_code:'考点',
	name:'姓名',
	sex:'性别',
	id_type:'证件类型',
	id_number:'证件号码',//330182199501160019
	birthday:'生日',	//19931214
	nationality:'民族',
	career:'职业',
	degree_of_education:'文化程度',
	training_type:'培训类型',
	subject_code:'考试科目',
	phone:'联系电话',
	post_code:'邮编',
	address	:'地址',
	email:'电子邮件',
	school:'学校',
	department	:'学院',
	class:'班级',
	student_number:'学号'
};

String.prototype.bytes = function() {
	var c, b = 0,
		l = this.length;
	while (l) {
		c = this.charCodeAt(--l);
		b += (c < 128) ? 1 : ((c < 65536) ? 2 : 4);
	};
	return b;
}

function isEmpty(inp){
	var re=false;
	for (i in inp){
		re=true;
	}
	return re;
}
app.set("view engine","ejs");
app.set("view options",{"layout":false});
//中间件
app.use('/submit', bodyparser.urlencoded({
	extended: true
})); //post请求
app.use('/',express.static(__dirname + '/static')); //处理静态文件

app.get('/', function(req, res) {
	var count1 = 0,count2=0;
	db('data.mytest').find({exam_site_code:''+410067}, function(r) {
		if (r.more === undefined) {
			count1 += r.numberReturned;
			db('data.mytest').find({exam_site_code:''+410084}, function(r) {
				if (r.more === undefined) {
					count2 += r.numberReturned;
					res.render('welcome', {
						count1: count1,
						count2:count2,
						sub1: sub1,
						sub2:sub2
					});
				} else {
					count2 += r.numberReturned;
				}
			});
		} else {
			count1 += r.numberReturned;
		}
	});
	//res.sendFile(__dirname + '/pages/welcome.html');
});

app.get('/getinfo',function(req,res){
	if(req.query.id_number){
		db('data.mytest').find({id_number: '' + req.query.id_number}, function(r) {
			if (r.documents.length == 0) {
				res.render('getinfo',{info:null});
			} else {
				var rep=r.documents[0];
				delete rep._id;
				delete rep.submit_form;
				rep.exam_site_code=mapping_exam_site_code[rep.exam_site_code];
				rep.sex=mapping_sex[rep.sex];
				rep.id_type=mapping_id_type[rep.id_type];
				rep.nationality=mapping_nationality[rep.nationality];
				rep.career=mapping_career[rep.career];
				rep.degree_of_education=mapping_degree_of_education[rep.degree_of_education];
				rep.school=mapping_school[rep.school];
				rep.department=mapping_department[rep.department];
				if(rep.is_our_school==='true'){
					delete rep.school;
				}
				else{
					delete rep.department;
					delete rep.class;
					delete rep.student_number;
				}
				res.render('getinfo',{info:rep,map:mapping_item});
			}
		});
	}
	
});

app.get('/fillout', function(req, res) {
	res.render('fillout',{});
});

app.get('/repeatcheck',function(req,res){
	if(req.query.id_number){
		db('data.mytest').find({id_number: '' + req.query.id_number}, function(r) {
			if (r.documents.length == 0) {
				res.send('true');
			} else {
				res.send('false');
			}
		});
	}
})
app.post('/submit', function(req, res) {

	var error = check(req.body);
	if (isEmpty(error)) {
		res.render('op_res', {
			res: '提交失败',
			info: error
		});
	} else {
		var count = 0
		db('data.mytest').find({exam_site_code:''+form.exam_site_code}, function(r) {
			if (r.more === undefined) {
				count += r.numberReturned;
				if (count >= sub) {
					res.render('op_res', {
						res: '提交失败：名额已满',
						info: {}
					});
				} else {
					db('data.mytest').find({
						id_number: '' + req.body.id_number
					}, function(r) {
						if (r.documents.length == 0) {

							db('data.mytest').insert(req.body);
							res.render('op_res', {
								res: '提交成功',
								info: {}
							});
						} else {
							res.render('op_res', {
								res: '提交失败：不要重复提交',
								info: {}
							});
						}
					});
				}
			} else {
				count += r.numberReturned;
			}
		});
	}
});

app.listen(8080, function() {
	console.log('listening on 8080');
});

function check(form) {
	//console.log(form);
	var error = {};
	//考点代码
	if (form.exam_site_code) {

	} else {
		error.exam_site_code = 'empty';
	}
	//姓名
	if (form.name) {
		if (form.name.bytes() > 32) {
			error.name = 'too lang';
		}
	} else {
		error.name = 'empty';
	}
	//性别
	if (form.sex) {
		if (form.sex != 'male' && form.sex != 'famale') {
			error.sex = 'can not distinguish';
		}
	} else {
		error.sex = 'empty';
	}
	//出生日期
	if(form.birthday){

	}
	else{
		error.birthday='empty';
	}
	//证件类型
	if (form.id_type) {
		if (form.id_type < 1 || form.id_type > 5) {
			error.id_type = 'unknown id_type';
		}
	} else {
		error.id_type = 'empty';
	}
	//证件号码
	if (form.id_number) {
		if (form.id_type == 1 && form.id_number.length != 18) {
			error.id_number = 'wrong number';
		}
	} else {
		error.id_number = 'empty';
	}
	//民族
	if (form.nationality) {
		if (form.nationality < 1 || form.nationality > 98) {
			error.nationality = 'unknown nationality code';
		}
	} else {
		error.nationality = 'empty';
	}
	//职业
	if (form.career) {
		if (form.career < 1 || form.career > 99) {
			error.career = 'unknown career code';
		}
	} else {
		error.career = 'empty';
	}
	//文化程度
	if (form.degree_of_education) {
		if (form.degree_of_education < 1 || form.degree_of_education > 8) {
			error.degree_of_education = 'unknown degree_of_education code';
		}
	} else {
		error.degree_of_education = 'empty';
	}
	//培训类型
	if (form.training_type) {
		if (form.training_type < 1 || form.training_type > 3) {
			error.training_type = 'unknown training_type code';
		}
	} else {
		error.training_type = 'empty';
	}
	//邮编
	//地址长度
	if (form.address) {
		if (form.address.length > 64) {
			error.address = 'too lang';
		}
	} 
	//考试科目代码
	if (form.subject_code) {
		if (form.subject_code) {

		}
	} else {
		error.subject_code = 'empty';
	}
	//联系电话
	if (form.phone) {
		if (/\d*/.test(form.phone) || form.phone === undefined) {

		}
	} else {
		error.phone = 'empty';
	}
	//备注????
	if(form.is_our_school){
		//学院
		if (form.department) {
			if (form.department==0) {
				error.department='department not selected'
			}
		} else {
			error.department = 'empty';
		}
		//班级
		if (form.class) {
			if (form.class==0) {
				error.class='class not selected'
			}
		} else {
			error.class = 'empty';
		}
		//学号
		if (form.student_number) {
			if (/\d{9}/.test(form.student_number)==false) {
				error.student_number='unknown student_number'
			}
		} else {
			error.student_number = 'empty';
		}
	}
	else{
		if(form.school){
			if(form.school==0){
				error.class='school not selected'
			}
		}
		else{
			error.school = 'empty';
		}
	}
	//
	return error;
}
