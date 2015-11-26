var index_node = require('./index_node');
var _ = require('underscore');


$(document).ready(function() {
	$('#toggleserver').click(function(){
		var b = $(this);
		b.attr('disabled',true);
		b.text('处理中');
		index_node.isRunning('frontServer',function(res){
			console.log(res);
			if(res){
				index_node.stopServer('frontServer',function(){
					b.text('开始服务');
					setTimeout(function(){$('#refreshprocess').trigger('click');},600);
					b.attr('disabled',false);
				});
			}
			else{
				index_node.startServer(function(){
					b.text('停止服务');
					setTimeout(function(){$('#refreshprocess').trigger('click');},600);
					b.attr('disabled',false);
				});
			}	
		});
		
	});
	$('#refreshprocess').click(function(){
		index_node.refreshState('frontServer',function(res){
			console.log(res);
			if(res){
				$('#pid').text(res.pid);
				$('#state').text(res.state);
				$('#restart').text(res.restart);
				$('#uptime').text(res.uptime);
			}
		});
	});

	index_node.isRunning('frontServer',function(res){
		console.log("start" + res);
		if(res) $('#toggleserver').text('停止服务');
		else $('#toggleserver').text('开始服务');
	});
	$('#refreshprocess').trigger('click');
});