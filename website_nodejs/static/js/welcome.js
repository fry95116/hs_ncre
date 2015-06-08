$(document).ready(function(){
	$('#info').hide();
	$('#read_info').click(function(){
		$('#header').fadeOut('fast');
		$('body').animate({paddingTop:'48px'},'fast');
		$('#nav h1').animate({marginTop:'24px',fontSize:'48px'},'fast',function(){
			$('#info').fadeIn('middle');
		});
	});
});