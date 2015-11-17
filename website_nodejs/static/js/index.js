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
$(document).ready(function(){

	//考点选择与学科选择联动
	var subject_selector = $('[name="subject_code"]');
	subject_selector.children().hide();
	subject_selector.children('[site = "0"]').show();

	$('[name="exam_site_code"]').change(function(){
		var esc = $(this).children('option:selected').val();
		subject_selector.children().hide();
		subject_selector.children('[site = "' + esc + '"]').show();
	});

	//隐藏掉科目选项中的考点名后缀
	subject_selector.children().each(function(){
		$(this).text($(this).text().split('@')[0]);
	});
});

$(document).ready(function() {

	// 对于每个 input 标签，填写正确格式的数据后，为每个input 标签添加 validated 类属性
	$('form :input').blur(function() {
		// 每次移开鼠标焦点时，先清楚后面的错误提示，以便重新验证
		var $parent = $(this).parent();
		// $parent.find('.form_tips').remove(); 这行代码是干嘛的

		// 验证姓名
		// 正确与否，都在input的兄弟元素.validated_result中添加文本
		if ($(this).is('[name=name]')) {
			if (this.value === '' || this.value.length < 2) {
				$parent.children('.validated_result').text('请输入姓名');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}

		// 证件号
		if ($(this).is('[name=id_number]')) {
			if ($('[name=id_type]').val() === '1') {
				// 是身份证的话
				if (this.value.length != 18) {
					// 不够18位
					$parent.children('.validated_result').text('请输入18位身份证号');
					$parent.removeClass().addClass('has_error');
				} else if (!getIdCardInfo(this.value.toString()).isTrue){
					// 身份证号不符合算法规则
					$parent.children('.validated_result').text('请仔细检查身份证号是否正确');
					$parent.removeClass().addClass('has_error');
				} else {
					$('input[name="birthday"]').val(this.value.slice(6, 14));
					// 保证是18位身份证号后，发送异步验证到服务器，确认该身份证号是否已经注册
					$.get("/repeatcheck", {
						id_number: $('[name=id_number]').val()
					}, function(data) {
						if (data === 'false') {
							$parent.children('.validated_result').text('不能重复报名');
							$parent.removeClass().addClass('has_error');
						} else {
							$parent.children('.validated_result').text('正确');
							$parent.removeClass().addClass('has_success');
						}
					});
				}
			} else {
				if ($(this).val().length == 0) {
					$parent.children('.validated_result').text('请输入证件号');
					$parent.removeClass().addClass('has_error');
				} else {
					$.get("/repeatcheck", {
						id_number: $('[name=id_number]').val()
					}, function(data) {
						if (data === 'false') {
							$parent.children('.validated_result').text('不能重复报名');
							$parent.removeClass().addClass('has_error');
						} else {
							$parent.children('.validated_result').text('正确');
							$parent.removeClass().addClass('has_success');
						}
					});
				}
			}
		}

		// 出生日期
		if ($(this).is('[name=birthday]')) {
			if ($('[name=input_birthday]').val() != '1') {
				if (this.value.length != 8) {
					$parent.children('.validated_result').text('请输入8位长度的出生日期');
					$parent.removeClass().addClass('has_error');
				} else {
					$parent.children('.validated_result').text('正确');
					$parent.removeClass().addClass('has_success');
				}
			}
		}

		// 邮政编码
		// 非必需，不需要非空检测
		/*
		if ($(this).is('[name=post_code]')) {
			if (this.value.length != 6) {
				$parent.children('.validated_result').text('请输入正确的邮编');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}
    */

		// 验证地址
		// 非必需，可为空，并不需要非空检测
		/*
		if ($(this).is('[name=address]')) {
			if (this.value === '') {
				$parent.children('.validated_result').text('请输入地址');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}
    */

		// 验证电子邮箱
		// 非必填项，可为空。
		/*
		if ($(this).is('[name=email]')) {
			if (this.value === '') {
				$parent.children('.validated_result').text('请输入电子邮箱');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}
    */

		// 验证联系电话
		if ($(this).is('[name=phone]')) {
			if (this.value.length != 11 && this.value.length != 8) {
				$parent.children('.validated_result').text('请输入11位手机号码或8位固定电话');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}

		// 验证备注信息
		if ($(this).is('[name=student_number]')) {
			if ($('input:checkbox').is(':checked')) { // 勾选了本校学生
				if (this.value.length < 9) {
					$parent.children('.validated_result').text('请填写正确的学号');
					$parent.removeClass().addClass('has_error');
				} else {
					$parent.children('.validated_result').text('正确');
					$parent.removeClass().addClass('has_success');
				}
			}
		}
		if ($(this).is('[name=school_name]')) {
			if ($(this).val() == '') {
				$parent.children('.validated_result').text('请输入学校或工作单位');
				$parent.removeClass().addClass('has_error');
			} else {
				$parent.children('.validated_result').text('正确');
				$parent.removeClass().addClass('has_success');
			}
		}
	});
	$('select[name=school]').change(function() {
		if ($(this).val() == '01') {
			$('input[name=school_name]').fadeIn('middle').prev().fadeIn('middle');
		}
		else{
			$('input[name=school_name]').fadeOut('middle').prev().fadeOut('middle');
		}
	});
});


$(document).ready(function() {
	// 绑定submit键，如未通过验证，则返回false，不进行表单提交
	$('[name=submit_form]').click(function() {
		if(confirm('您是否确认提交信息?\n一但提交将无法更改!')==false)return false;
		var error = [];
		//考点代码
		if ($('[name=exam_site_code]').val() != 410067 && $('[name=exam_site_code]').val() != 410084) {
			error.push('请选择考点');
		}
		//姓名 input
		if ($('[name=name]').val().length < 2) {
			error.push('请输入正确的名字');
		}

		//性别!!!只能为'男'或者'女'改一下 radio
		if ($('[name=sex]:checked').val() != 'male' && $('[name=sex]:checked').val() != 'famale') {
			error.push('请选择性别');
		}

		// 出生日期 input
		if ($('[name=birthday]').val().length != 8) {
			error.push('请输入正确的出生日期');
		}

		//证件类型 select
		if ($('[name=id_type]').val() < 1 || $('[name=id_type]').val() > 5) {
			error.push('请选择证件类型');
		}

		//证件号码 input
		if ($('[name=id_type]').val().length == 1 && $('[name=id_number]').val().length != 18) {
			error.push('请输入18位身份证号');
		}

		//民族 select
		if ($('[name=nationality]').val() < 1 || $('[name=nationality]').val() > 98) {
			error.push('请选择民族');
		}

		//职业 select
		if ($('[name=career]').val() < 1 || $('[name=career]').val() > 99) {
			error.push('请选择职业');
		}

		//文化程度 select
		if ($('[name=degree_of_education]').val() < 1 || $('[name=degree_of_education]').val() > 8) {
			error.push('请选择文化程度');
		}

		//培训类型
		if ($('[name=training_type]').val() < 1 || $('[name=training_type]').val() > 3) {
			error.push('请选择培训类型');
		}

		//邮编
		// 可以为空
		/*
		if ($('[name=post_code]').val().length != 6) {
			error.push('请输入邮政编码');
		}
		*/

		//地址长度 input
		// 可以不填
		/*
		if ($('[name=address]').val().length === 0 || $('[name=address]').val().length > 64) {
			error.push('请输入地址');
		}
		*/

		// 电子邮箱 input
		// 可以为空
		/*
		if ($('[name=email]').val().length === 0) {
			error.push('请输入电子邮箱');
		}
		*/

		// 联系电话 input
		// 既不为11位也不为8位则出错
		if ($('[name=phone]').val().length != 11 && $('[name=phone]').val().length != 8) {
			error.push('请输入联系电话');
		}

		if ($('input[name=is_our_school]').is(':checked')) {
			// 勾选本校学生
			if ($('[name=department]').val() == '0') {
				error.push('请选择学院');
			}
			if (/\d{9}\d*/.test($('[name=student_number]').val()) == false) {
				error.push('请输入学号');
			}
		} else {
			if ($('[name=school]').val() == '0') {
				error.push('请选择学校');
			}
			if ($('[name=school]').val() == '01' && $('input[name=school_name]').val() == '') {
				error.push('请输入学校或工作单位');
			}
		}


		if (error.length === 0) {
			return true;
		} else {
			$('#error_message').text(error);
			return false;
		}
	});
});


$(document).ready(function() {
	/*var select_department = $('select[name=department]');
  $('select[name=class] > option').hide(); // 在没有选择学院的时候，隐藏所有的专业信息
  select_department.change(function() {
    $('select[name=class]').val('0');
    $('select[name=class] > option').hide(function(){
	    $('select[name=class] > option[department=' + select_department.val() + ']').css('display','block');
    }); // 切换了学院后，要重置，要隐藏所有的专业标签

  });*/

	if ($('input[name=is_our_school]').is(':checked')) {
		$('div#input_remark_for_not_our_school').hide();
	} else {
		$('div#input_remark_for_is_our_school').hide();
		$('input[name="school_name"]').hide().prev().hide();
	}

	$('input[name=is_our_school]').click(function() {
		// 切换是否本校学生时，先全部隐藏
		//$('div#input_remark_for_is_our_school').hide();
		//$('div#input_remark_for_not_our_school').hide();
		if ($('input[name=is_our_school]').is(':checked')) {
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
});

// 身份证校验算法
function getIdCardInfo(cardNo) {
	var info = {
		isTrue : false,
		year : null,
		month : null,
		day : null,
		isMale : false,
		isFemale : false
	};
	if (!cardNo || (15 != cardNo.length && 18 != cardNo.length) ) {
		info.isTrue = false;
		return info;
	}
	if (15 == cardNo.length) {
		var year = cardNo.substring(6, 8);
		var month = cardNo.substring(8, 10);
		var day = cardNo.substring(10, 12);
		var p = cardNo.substring(14, 15); //性别位
		var birthday = new Date(year, parseFloat(month) - 1,
				parseFloat(day));
		// 对于老身份证中的年龄则不需考虑千年虫问题而使用getYear()方法
		if (birthday.getYear() != parseFloat(year)
				|| birthday.getMonth() != parseFloat(month) - 1
				|| birthday.getDate() != parseFloat(day)) {
			info.isTrue = false;
		} else {
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