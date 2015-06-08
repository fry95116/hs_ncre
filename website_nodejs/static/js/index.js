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

$(document).ready(function() {
  // 对于每个 input 标签，填写正确格式的数据后，为每个input 标签添加 validated 类属性
  $('form :input').blur(function() {
    // 每次移开鼠标焦点时，先清楚后面的错误提示，以便重新验证
    var $parent = $(this).parent();
    // $parent.find('.form_tips').remove(); 这行代码是干嘛的

    // 验证姓名
    // 正确与否，都在input的兄弟元素.validated_result中添加文本
    if( $(this).is('[name=name]')) {
      if( this.value === '' || this.value.length < 2) {
        $parent.children('.validated_result').text('请输入姓名');
        $parent.removeClass().addClass('has_error');
      } else {
        $parent.children('.validated_result').text('正确');
        $parent.removeClass().addClass('has_success');
      }
    }

    // 证件号
    if( $(this).is('[name=id_number]')) {
      if( $('[name=id_type]').val() === '1'){
        if( this.value.length != 18) {
          $parent.children('.validated_result').text('请输入正确的身份证号');
          $parent.removeClass().addClass('has_error');
        } else {
          var ok_message = '输入正确';
          $parent.children('.validated_result').text('正确');
          $parent.removeClass().addClass('has_success');
        }
      }
    }

    // 出生日期
    if( $(this).is('[name=birthday]')) {
      if( $('[name=input_birthday]').val() != '1'){
        if( this.value.length != 8) {
          $parent.children('.validated_result').text('请输入8位长度的出生日期');
          $parent.removeClass().addClass('has_error');
        } else {
          $parent.children('.validated_result').text('正确');
          $parent.removeClass().addClass('has_success');
        }
      }
    }

    // 邮政编码
    if( $(this).is('[name=post_code]')) {
      if( this.value.length != 6) {
        $parent.children('.validated_result').text('请输入正确的邮编');
        $parent.removeClass().addClass('has_error');
      } else {
        $parent.children('.validated_result').text('正确');
        $parent.removeClass().addClass('has_success');
      }
    }

    // 验证地址
    if( $(this).is('[name=address]')) {
      if( this.value === '') {
        $parent.children('.validated_result').text('请输入地址');
        $parent.removeClass().addClass('has_error');
      } else {
        $parent.children('.validated_result').text('正确');
        $parent.removeClass().addClass('has_success');
      }
    }

    // 验证电子邮箱
    // 非必填项
    if( $(this).is('[name=email]')) {
      if( this.value === '') {
        $parent.children('.validated_result').text('请输入电子邮箱');
        $parent.removeClass().addClass('has_error');
      } else {
        $parent.children('.validated_result').text('正确');
        $parent.removeClass().addClass('has_success');
      }
    }

    // 验证联系电话
    if( $(this).is('[name=phone]')) {
      if( this.value.length != 11 && this.value.length != 8) {
        $parent.children('.validated_result').text('请输入11位手机号码或8位固定电话');
        $parent.removeClass().addClass('has_error');
      } else {
        $parent.children('.validated_result').text('正确');
        $parent.removeClass().addClass('has_success');
      }
    }

    // 验证备注信息
    if( $(this).is('[name=remark]')) {
      if($('input:checkbox').is(':checked')) {  // 勾选了本校学生
        if( this.value.length != 9) {
          $parent.children('.validated_result').text('请填写正确的学号');
          $parent.removeClass().addClass('has_error');
        } else {
          $parent.children('.validated_result').text('正确');
          $parent.removeClass().addClass('has_success');
        }
      } else {
        if( this.value.length === 0) {
          $parent.children('.validated_result').text('请填写备注信息');
          $parent.removeClass().addClass('has_error');
        } else {
          $parent.children('.validated_result').text('正确');
          $parent.removeClass().addClass('has_success');
        }
      }
    }
  });
});


$(document).ready(function() {
  // 全局验证，用下面的check函数。
  // 绑定submit键，如未通过验证，则返回false，不进行表单提交
  $('[name=submit_form]').click(function() {
    var error = [];
  	//考点代码
    if( $('[name=exam_site_code]').val() != 410067 && $('[name=exam_site_code]').val() != 410084) {
      error.push('请选择考点');
    }
  	//姓名 input
    if( $('[name=name]').val().length < 2) {
      error.push('请输入正确的名字');
    }

  	//性别!!!只能为'男'或者'女'改一下 radio
  	if( $('[name=sex]:checked').val() != 'male' && $('[name=sex]:checked').val() != 'famale') {
  		error.push('请选择性别');
  	}

    // 出生日期 input
      if ( $('[name=birthday]').val().length != 8) {
        error.push('请输入正确的出生日期');
      }

  	//证件类型 select
  	if( $('[name=id_type]').val() < 1 || $('[name=id_type]').val() > 5) {
  		error.push('请选择证件类型');
  	}

  	//证件号码 input
  	if( $('[name=id_type]').val().length == 1 && $('[name=id_number]').val().length != 18) {
  		error.push('请输入18位身份证号');
  	}

  	//民族 select
  	if ( $('[name=nationality]').val() < 1 || $('[name=nationality]').val() > 98) {
  		error.push('请选择民族');
  	}

  	//职业 select
  	if ($('[name=career]').val() < 1 || $('[name=career]').val() > 99) {
  		error.push('请选择职业');
  	}

  	//文化程度 select
  	if ( $('[name=degree_of_education]').val() < 1 || $('[name=degree_of_education]').val() > 8) {
  		error.push('请选择文化程度');
  	}

  	//培训类型
  	if ( $('[name=training_type]').val() < 1 || $('[name=training_type]').val() > 3) {
  		error.push('请选择培训类型');
  	}

  	//邮编
  	if( $('[name=post_code]').val().length != 6){
  		error.push('请输入邮政编码');
  	}

  	//地址长度 input
  	if( $('[name=address]').val().length === 0 ||  $('[name=address]').val().length > 64){
  		error.push('请输入地址');
  	}

    // 电子邮箱 input
    // 空为错
    if( $('[name=email]').val().length ===0) {
      error.push('请输入电子邮箱');
    }

  	// 联系电话 input
    // 既不为11位也不为8位则出错
  	if( $('[name=phone]').val().length != 11 && $('[name=phone]').val().length != 8) {
      error.push('请输入联系电话');
    }

    // 备注 input
    if( $('[name=remark]').val().length === 0) {
      error.push('请输入备注信息');
    }

    if( error.length === 0){
      return true;
    } else {
      $('#error_message').text(error);
      return false;
    }
  });
});









/*
// 这个函数不需要了，本来是做的院系，专业双select联动，现在不需要了。
$(document).ready(function() {
  var select_department = $('select[name=department]');
  $('select[name=major] > option').hide(); // 在没有选择学院的时候，隐藏所有的专业信息
  select_department.change(function() {
    $('select[name=major]').val('0');
    $('select[name=major] > option').hide(); // 切换了学院后，要重置，要隐藏所有的专业标签
    $('select[name=major] > option[department=' + select_department.val() + ']').show();
  });

  $('div#input_remark_for_is_our_school').hide();
  $('div#input_remark_for_not_our_school').hide();

  $('input[name=is_or_not_our_school]').change(function() {
    $('div#input_remark_for_is_our_school').hide();
    $('div#input_remark_for_not_our_school').hide();
    current_selected_value = $('input[name=is_or_not_our_school]:checked').val();
    if( current_selected_value === 'is_our_school')
      $('div#input_remark_for_is_our_school').toggle(function() { $(this).show(); });
    else
      $('div#input_remark_for_not_our_school').toggle(function() { $(this).show(); });
  });
});
*/
