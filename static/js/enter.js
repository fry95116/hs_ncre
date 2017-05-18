/*
$(document).ready(function() {
// 判断证件类型是否是身份证，如果是则在后端进行出生日期的提取，
// 如果用户更改了id_type，则用户需要手动输入出生日期。
var select_id_type = $('select[name=id_type]');
$('#input_birthday').hide(); // 在没有选择学院的时候，隐藏所有的专业信息
select_id_type.change(function() {
if( $('select[name=id_type]').val() != 1) {
$('#input_birthday').show();
} else {
$('#input_birthday').hide();
}
});
});
*/

function msgRender($el, condition, errMsg) {
	if(typeof condition == 'function') {
		condition = condition($el);
	}

	$item = $el.parent();

	if(!condition) {
		$item.removeClass().addClass('has_error');
		$item.children('.validated_result').text(errMsg);
		return false;
	} else {
		$item.removeClass();
		$item.children('.validated_result').text('');
		return true;
	}
}

//各个表项的验证逻辑

var validator = [
	//考点代码select
	['exam_site_code', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择考点');
	}],

	//科目代码select
	['subject_code', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择科目');
	}],

	//姓名 input
	['name', function($el) {
		return msgRender($el, function($el) {
			return /^...*$/.test($el.val());
		}, '请输入正确的名字');
	}],

	//性别 radio
	['sex', function($el) {
		return msgRender($el, function($el) {
            return $el.val() != 0;
		}, '请选择性别');
	}],

	//生日input(format:yyyymmdd)
	['birthday', function($el) {
		return msgRender($el, function($el) {
			return /^\d{8}$/.test($el.val());
		}, '请输入正确的出生日期');
	}],

	//证件类型 select
	['id_type', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择证件类型');
	}],

	//证件号码 input
	['id_number', function($el) {
		return msgRender($el, function($el) {
			return $el.val().length != 0;
		}, '请输入证件号');
	}],

	//证件号码 input
	['id_number', function($el) {
		return msgRender($el, function($el) {
			if($('[name="id_type"]').val() == 1) {
				return getIdCardInfo($el.val()).isTrue;
			} else return true;
		}, '请仔细检查证件号是否正确');
	}],

	['id_number', function($el){
        // 保证是18位身份证号后，发送异步验证到服务器，确认该身份证号是否已经注册
        var captcha_user = $el.val();
        var result = $.ajax({
            url: "/repeatcheck",
            timeout : 1000,
            data: {
                id_number: $el.val()
            },
            async: false
        }).responseJSON;
        if (result === false) {
            msgRender($el, false,'不能重复报名 ');
        }
        else if($('[name="id_type"]').val() == 1){
            //生日的自动填写
            $('[name="birthday"]').val($el.val().slice(6, 14)).trigger('blur');
        }
	}],

	//民族 select
	['nationality', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择民族');
	}],

	//职业 select
	['career', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择职业');
	}],

	//文化程度 select
	['degree_of_education', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择文化程度');
	}],

	//培训类型
	['training_type', function($el) {
		return msgRender($el, function($el) {
			return $el.val() != 0;
		}, '请选择培训类型');
	}],

	//邮编 input
	// 可以为空

	//地址长度 input
	// 可以不填

	// 电子邮箱 input
	['email', function($el) {
		return msgRender($el, function($el) {
			return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test($el.val());
		}, '请输入正确的电子邮件地址');
	}],

	// 联系电话 input(格式11位数字)
	['phone', function($el) {
		return msgRender($el, function($el) {
			return /^\d{1,11}$/.test($el.val());
		}, '联系电话输入有误');
	}],

	/* 备注 */
	//勾选本校学生的情况
	['department', function($el) {
		return msgRender($el, function($el) {
			if($('input[name=is_our_school]').is(':checked')) {
				return $el.val() != 0;
			}
			return true;
		}, '请选择学院');
	}],
	['student_number', function($el) {
		return msgRender($el, function($el) {
			if($('input[name=is_our_school]').is(':checked')) {
				return /\d{9}\d*/.test($el.val());
			}
			return true;
		}, '请输入学号');
	}],

	//不勾选本校学生的情况
	['school', function($el) {
		return msgRender($el, function($el) {
			if(!$('input[name=is_our_school]').is(':checked')) {
				return $el.val() != '0';
			}
			return true;
		}, '请选择学校');
	}],
	['school_name', function($el) {
		return msgRender($el, function($el) {
			if((!$('input[name=is_our_school]').is(':checked')) && $('[name=school]').val() == '01') {
				return $el.val() !== '';
			}
			return true;
		}, '请输入学校或工作单位');
	}],

	//验证码 input(使用同步ajax)
	['captcha', function($el) {
		return msgRender($el, function($el) {
			var captcha_user = $el.val();
			var result = $.ajax({
				url: "/captchatest",
                timeout : 1000,
				data: {
					test: captcha_user
				},
				async: false
			}).responseJSON;
			return result;
		}, '验证码错误');
	}]
];

//如有初始数据，组装之
$(document).ready(function(){
	//
	var errMessage = $('#error_message').html();
    $('#error_message').empty();
	//
    var formData = $('#last_formData').html();
    $('#last_formData').empty();

    try{
        errMessage = JSON.parse(errMessage);
        formData = JSON.parse(formData);
	}
	catch(err){}

    for(var key in errMessage){
		if(errMessage[key] == '非法的数据'){
			msgRender($('input[name="' + key + '"],select[name="' + key + '"]'),false,'请填写正确的值');
		}
		else if(errMessage[key] == '不存在'){
            msgRender($('input[name="' + key + '"],select[name="' + key + '"]'),false,'该字段不能为空');
		}
	}

	for(var key in formData){
        $('input[name="' + key + '"],select[name="' + key + '"]').val(formData[key]);
	}

});

//验证码 与 考点学科联动
$(document).ready(function() {

	//验证码点击事件
	$('#captcha').click(function() {
		this.src = '/captcha?t=' + Math.random();
	});

	//考点选择与学科选择联动

	var subject_selector = $('[name="subject_code"]');

	//隐藏掉科目选项中的考点名后缀
	subject_selector.children().each(function() {
		$(this).text($(this).text().split('@')[0]);
	});

	//only work at FF or Chrome
	/*
		subject_selector.children().hide();
		subject_selector.children('[site = "0"]').show();

		$('[name="exam_site_code"]').change(function(){
			var esc = $(this).children('option:selected').val();
			subject_selector.children().hide();
			subject_selector.children('[site = "' + esc + '"]').show();
		});
	*/
	//fucking IE
	var cache_sel = subject_selector.clone();
	//初始化
	$('[name="exam_site_code"]').val('0');
	subject_selector.empty().append('<option value="0" site="0">请选择</option>');
	cache_sel.children('[site = "0"]').each(function() {
		subject_selector.append($(this).clone());
	});

	$('[name="exam_site_code"]').change(function() {
		var esc = $(this).children('option:selected').val();
	subject_selector.empty().append('<option value="0" site="0">请选择</option>');
		cache_sel.children('[site = "' + esc + '"]').each(function() {
			subject_selector.append($(this).clone());
		});
	});



});

//验证 onblur
$(document).ready(function() {

	// 对于每个 input 标签，填写正确格式的数据后，为每个input 标签添加 validated 类属性
	$('form input,form select').blur(function() {
		//找到验证器
		for(var i = 0; i < validator.length; ++i) {
			if(validator[i][0] === $(this).attr('name')) {
				//如果验证失败，跳出
				if(!validator[i][1]($(this))) return;
			}
		}
	});
});

//验证 onsubmit
$(document).ready(function() {
	// 绑定submit键，如未通过验证，则返回false，不进行表单提交
	$('[name="submit_form"]').click(function() {
		if(confirm('您是否确认提交信息?\n一但提交将无法更改!') == false) return false;
		var noError = true;
		for(var i = 0; i < validator.length; ++i) {
			var $el = $('[name=' + validator[i][0] + ']');
            var res = validator[i][1]($el)
			noError = noError && res;
		}
		if(!noError) $(window).scrollTop(0);
        return noError;
	});
});

//备注项的显示控制
$(document).ready(function() {
	/*var select_department = $('select[name=department]');
  $('select[name=class] > option').hide(); // 在没有选择学院的时候，隐藏所有的专业信息
  select_department.change(function() {
    $('select[name=class]').val('0');
    $('select[name=class] > option').hide(function(){
	    $('select[name=class] > option[department=' + select_department.val() + ']').css('display','block');
    }); // 切换了学院后，要重置，要隐藏所有的专业标签

  });*/

	if($('input[name=is_our_school]').is(':checked')) {
		$('div#input_remark_for_not_our_school').hide();
	} else {
		$('div#input_remark_for_is_our_school').hide();
		$('input[name="school_name"]').hide().prev().hide();
	}

	$('input[name=is_our_school]').click(function() {
		// 切换是否本校学生时，先全部隐藏
		//$('div#input_remark_for_is_our_school').hide();
		//$('div#input_remark_for_not_our_school').hide();
		if($('input[name=is_our_school]').is(':checked')) {
			// 是本校学生时
			$('div#input_remark_for_not_our_school').fadeOut('fast', function() {
				$('div#input_remark_for_is_our_school').fadeIn('middle');
			});
		} else {
			// 不是本校学生时
			$('div#input_remark_for_is_our_school').fadeOut('fast', function() {
				$('div#input_remark_for_not_our_school').fadeIn('middle');
			});
		}
	});

	$('select[name=school]').change(function() {
		if($(this).val() == '01') {
			$('input[name=school_name]').fadeIn('middle').prev().fadeIn('middle');
		} else {
			$('input[name=school_name]').fadeOut('middle').prev().fadeOut('middle');
		}
	});
});

// 身份证校验算法
function getIdCardInfo(cardNo) {
	var info = {
		isTrue: false,
		year: null,
		month: null,
		day: null,
		isMale: false,
		isFemale: false
	};
	if(!cardNo || (15 != cardNo.length && 18 != cardNo.length)) {
		info.isTrue = false;
		return info;
	}
	if(15 == cardNo.length) {
		var year = cardNo.substring(6, 8);
		var month = cardNo.substring(8, 10);
		var day = cardNo.substring(10, 12);
		var p = cardNo.substring(14, 15); //性别位
		var birthday = new Date(year, parseFloat(month) - 1,
			parseFloat(day));
		// 对于老身份证中的年龄则不需考虑千年虫问题而使用getYear()方法
		if(birthday.getYear() != parseFloat(year) ||
			birthday.getMonth() != parseFloat(month) - 1 ||
			birthday.getDate() != parseFloat(day)) {
			info.isTrue = false;
		} else {
			info.isTrue = true;
			info.year = birthday.getFullYear();
			info.month = birthday.getMonth() + 1;
			info.day = birthday.getDate();
			if(p % 2 == 0) {
				info.isFemale = true;
				info.isMale = false;
			} else {
				info.isFemale = false;
				info.isMale = true
			}
		}
		return info;
	}
	if (18 == cardNo.length) {
		var year = cardNo.substring(6, 10);
		var month = cardNo.substring(10, 12);
		var day = cardNo.substring(12, 14);
		var p = cardNo.substring(14, 17)
		var birthday = new Date(year, parseFloat(month) - 1,
				parseFloat(day));
		// 这里用getFullYear()获取年份，避免千年虫问题
		if (birthday.getFullYear() != parseFloat(year)
				|| birthday.getMonth() != parseFloat(month) - 1
				|| birthday.getDate() != parseFloat(day)) {
			info.isTrue = false;
			return info;
		}
		var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];// 加权因子
		var Y = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];// 身份证验证位值.10代表X
		// 验证校验位
		var sum = 0; // 声明加权求和变量
		var _cardNo = cardNo.split("");
		if (_cardNo[17].toLowerCase() == 'x') {
			_cardNo[17] = 10;// 将最后位为x的验证码替换为10方便后续操作
		}
		for ( var i = 0; i < 17; i++) {
			sum += Wi[i] * _cardNo[i];// 加权求和
		}
		var i = sum % 11;// 得到验证码所位置
		if (_cardNo[17] != Y[i]) {
			return info.isTrue = false;
		}
		info.isTrue = true;
		info.year = birthday.getFullYear();
		info.month = birthday.getMonth() + 1;
		info.day = birthday.getDate();
		if (p % 2 == 0) {
			info.isFemale = true;
			info.isMale = false;
		} else {
			info.isFemale = false;
			info.isMale = true
		}
		return info;
	}
	return info;
}