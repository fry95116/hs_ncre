var express = require('express'),
	bodyparser = require('body-parser'), //解析post请求用
	app = express(),
	db=require('mongous').Mongous,
	fs=require('fs'),
	_=require('underscore');

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
	var count=0
	db('data.mytest').find({},function(r){
		if(r.more===undefined){
			count+=r.numberReturned;
			res.render('welcome',{count:count,sub:1000});
		}
		else{
			count+=r.numberReturned;
		}
	})
	//res.sendFile(__dirname + '/pages/welcome.html');
});

app.get('/getinfo',function(req,res){
	if(req.query.id_number){
		db('data.mytest').find({id_number: '' + req.query.id_number}, function(r) {
			if (r.documents.length == 0) {
				res.render('getinfo',{info:null});
			} else {
				res.render('getinfo',{info:r.documents[0]});
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
	if (isEmpty(error)){
		res.send('submited failed<br>' + JSON.stringify(error));
	}
	else{
		db('data.mytest').find({id_number:''+req.body.id_number},function(r){
			if(r.documents.length==0){
				db('data.mytest').insert(req.body);
				res.send('sccess submited');
			}
			else{
				res.send('do not submit twice');
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
	if (form.student_number) {
		if (/\d {9}/.test(form.student_number)) {

		} else {

		}
	} else {
		error.student_number = 'empty';
	}
	//
	return error;
}
