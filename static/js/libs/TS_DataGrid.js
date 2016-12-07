(function ($) {
    $.fn.TS_DataGrid = function (dataStruct) {
        
        //定义数据结构
        //格式:'key':[显示的表项名(string):'数据类型'('text'|'num'|'sel')]
        var default_dataStruct = [
            { key: 'c0', title: 'col-0', type: 'num' },
            { key: 'c1', title: 'col-1', type: 'text' },
        ]
        //view对象
        var view = {
            $el : $(this),
            append: undefined,
            getData: undefined,
            setData: undefined
        };

        dataStruct = dataStruct || default_dataStruct;
        
        //创建空表格
        view.$el.addClass('TS_DataGrid');
        view.$el.html('<table border="0" cellspacing="0" cellpadding="0"><tbody></tbody></table>');
        var $table = view.$el.children();
        
        //全局事件及变量，用于表格宽度拖动
        var handler_pressed = false, 
            handler_base = 0, 
            handler_sumbase = 0;
            handler_start = 0,
            handler_controlled = null;
        
        var __id = 0;
        
        $table.mousemove(
            function (e) {
                if (handler_pressed) {
                    handler_controlled.width(handler_base + ((e.clientX - handler_start)));
                }
            }
        );
        $table.mouseup(function () {
            handler_pressed = false;
            handler_controller = null;
        });
        
        //把手组件,用于改变表格宽度
        var $handler = $('<th class = "handler" ></th>');
        $handler.mousedown(function (e) {
            handler_pressed = true;
            handler_controlled = $table.find('tr:eq(0) :eq(' + $(this).prev().index() + ')');
            //handler_base = parseInt(handler_controlled.attr('width'));
            handler_base = handler_controlled.width();
            handler_start = e.clientX;
        });
        
        //创建表头
        var $header = $('<tr></tr>'), $header_item = $('<th></th>')
        $table.append($header);
        for (index in dataStruct) {
            //
            $header.append(
                $header_item.clone()
                .css({ 'width': $table.width() / dataStruct.length + 'px' })
                .text(dataStruct[index].title)
            );
            
            $header.append($handler.clone(true));
        }
        $header.children('.handler:last').remove();
        $header.children('th:last').removeAttr('style');
        $table.append($header);
        
        //输入框组件
        var $input = $('<input type = "text" />');
        $input.focus(function (e) {
            $(this).parent().attr({ 'old_val': $(this).val() });
        })
        $input.blur(function (e) {
            
            var $row = $(this).parents('tr'), $ceil = $(this).parent();
            var v = $(this).val();
            
            if(!$row.has('input'))$row.removeClass('focus');
            $ceil.empty().text(v);
            //交换数据后,触发监听器
            if ($ceil.attr('old_val') != v && typeof view.onCeilChanged !== 'undefined')
                view.onCeilChanged($ceil, $row.index() - 1, Math.floor($ceil.index() / 2));
            //如果所在行是空行，删除之
            var isEmptyRow = true;
            $row.children('td').each(function () {
                if ($(this).html() !== '') isEmptyRow = false;
            });
            if (isEmptyRow) {
                if (typeof view.onRowDeleted !== 'undefined')
                    view.onRowDeleted($row, $row.index() - 1);
                $row.remove();
            }
        });

        $input.keydown(function (e) {
            //回车键:确定数据
            if (e.keyCode == 13) $(this).trigger('blur');
            //tab键:切换单元格
            if (e.keyCode == 9) {
                var row = $(this).parents('tr'), col = $(this).parent();
                var next = col.nextAll('td:eq(0)');
                if (next.length == 0)
                    next = col.prevAll('td');
                next.trigger('click').trigger('click');
                return false;
        
            }
        });
        var $text_input = $input;
        //数字输入框
        var $num_input = $input.clone(true).attr({ type: 'number' });
        //选择输入框
        var $select = $('<select></select>');
        $select.keydown(function (e) {
            //tab键:切换单元格
            if (e.keyCode == 9) {
                var row = $(this).parents('tr'), col = $(this).parent();
                var next = col.nextAll('td:eq(0)');
                if (next.length == 0)
                    next = col.prevAll('td');
                next.trigger('click').trigger('click');
                return false;
        
            }
        });
        $select.change(function () { 
            if (typeof view.onCeilChanged !== 'undefined')
                var $ceil = $(this).parent();
                view.onCeilChanged($ceil, $row.index() - 1, Math.floor($ceil.index() / 2));
        });
          
        var type_input_map = {
            'text': $text_input,
            'num': $num_input
        };
        
        //单元格组件
        var $ceil = $('<td></td>');
        $ceil.click(function () {
            //切换行焦点
            var $row = $(this).parent();
            if (!$row.hasClass('focus')) {
                var $row_focus = $row.siblings('.focus');
                //触发监听器(失去焦点)
                if ($row_focus.length != 0 && typeof view.onRowBlur !== 'undefined')
                    view.onRowBlur($row_focus, $row_focus.index() - 1);
                $row_focus.removeClass('focus');
                $row.addClass('focus');
                //触发监听器(得到焦点)
                if (typeof view.onRowFocus !== 'undefined')
                    view.onRowFocus($row, $row.index() - 1);
                return;
            }
            //如果没有输入框，切换之
            else if ($(this).has('input,select').length == 0) {
                var val = $(this).text();
                var type = dataStruct[$(this).index() / 2].type;
                if (typeof type_input_map[type] !== 'undefined') {
                    var input = type_input_map[type].clone(true).val(val);
                    $(this).html(input);
                    input.focus();
                }
                
                //input.trigger('keyup');
            }
            else if ($(this).has('select').length != 0) { 
                $(this).children('select').focus();
            }
        });
        
        //添加对数据对象的操作
        //添加数据行
        view.append = function (focus,data) {
            
            if(typeof focus !== 'boolean') focus = true;
            //组装数据范式
            var default_data = {};
            for (var index in dataStruct) {
                default_data[dataStruct[index].key] = "";
            }
            data  = $.extend({}, default_data, data);

            $row = $('<tr></tr>');
            for (var index in dataStruct) {
                //单选框
                if (dataStruct[index].type === 'sel') {
                    var $sel = $select.clone(true);
                    if (typeof dataStruct[index].condidate !== 'undefiend') {
                        for (var j in dataStruct[index].condidate) {
                            if (typeof dataStruct[index].condidate[j].val === 'undefined') { 
                                dataStruct[index].condidate[j].val = '';
                            } 
                            //如果给定数据
                            if (dataStruct[index].condidate[j].val === data[dataStruct[index].key]) {
                                $sel.append($('<option>' + dataStruct[index].condidate[j].text + '</option>').
                                    attr({ selected: 'selected', value: dataStruct[index].condidate[j].val })
                                );
                            }
                            else {
                                $sel.append($('<option>' + dataStruct[index].condidate[j].text + '</option>')
                                    .attr({ value: dataStruct[index].condidate[j].val }));
                            }
                        }
                    }
                    $row.append($ceil.clone(true).append($sel));
                }
                else {
                    //其他情况
                    $row.append(
                        $ceil.clone(true).text(data[dataStruct[index].key])
                        //.attr({ 'width': '' + $table.width() / dataStruct.length })
                    );
                }
                $row.append($handler.clone(true));
            }
            $row.children('.handler:last').remove();
            //分配id
            if (typeof data.__id__ == 'undefined') $row.attr('TSDG_id', __id++);
            else $row.attr('TSDG_id', data.__id__);
            $table.append($row);
            //触发监听
            if (typeof view.onRowAppend !== 'undefined')
                view.onRowAppend($row, $row.index() - 1);
            //如果需要，为当前行获取焦点
            if (focus)
                $row.children('td:eq(0)').trigger('click').trigger('click');
        };
        //删除数据行
        view.delete = function (row_index) { 
            var $row = $table.find('tr:eq(' + (row_index + 1) + ')');
            if (typeof view.onRowDeleted !== 'undefined')
                view.onRowDeleted($row, $row.index() - 1);
            $row.remove();
        };
        //获取数据
        view.getData = function () {
            var re = [];
            $table.find('tr:not(:first)').each(function () {
                var $row = $(this);
                var dataObj = {}, index = 0;
                $row.children('td').each(function () {
                    var $ceil = $(this);
                    
                    if ($ceil.has('input').length == 0) dataObj[dataStruct[index].key] = $ceil.text();
                    else if ($ceil.has('select').length != 0) dataObj[dataStruct[index].key] = $ceil.children('select').val();
                    else dataObj[dataStruct[index].key] = $ceil.children('input').val();
                    
                    index++;
                });
                dataObj.__id__ = $row.attr('tsdg_id')
                re.push(dataObj);
            });
            return re;
        };
        //设置数据
        view.setData = function (data) {
            
            //清空table
            $table.find('tr:not(:first)').remove();

            for (index in data) {
                this.append(false, data[index]);
            }
        };
        //获取单元格元素
        view.getCeil = function (row, col) { 
            row += 1;
            return $table.find('tr:eq(' + row + ') td:eq(' + col + ')');
        }
        /*** 支持的事件 ***/
        //function($el_row,row) 行失去焦点时触发
        view.onRowBlur = undefined;
        //function($el_row,row) 行得到焦点时触发
        view.onRowFocus = undefined;
        //function($el_ceil,row,col) 单元格数据发生改变时触发
        view.onCeilChanged = undefined;
        //function($el_row,row) 添加行时触发
        view.onRowAppend = undefined;
        //function($el_row,row) 删除行时触发
        view.onRowDeleted = undefined;
        //返回一个view对象
        return view;
    }
})(jQuery);