if(typeof ($DGD) == 'undefined') {
	var $DGD = {};
	$DGD.echo=function(str) {
		console.log(str);
	}
}

$DGD.select2D = {};

$DGD.select2D.paint=function(ver, hor) {
	var row=0;
	var col=0;
	switch (ver) {
		case 'bottom': row++;
		case 'center': row++;
	}
	switch (hor) {
		case 'right': col++;
		case 'center': col++;
	}
	jQuery('#dgd_pos_selector .selected').removeClass('selected');
	jQuery('#dgd_pos_selector').find('tr:eq('+row+')').find('a:eq('+col+')').addClass('selected');
}

$DGD.select2D.choose=function(ver, hor) {
	jQuery('#hpos_selector').val(hor);
	jQuery('#vpos_selector').val(ver);
	$DGD.select2D.paint(ver, hor);
}

$DGD.select2D.init = function() {
	var ver=jQuery('#vpos_selector').val();
	var hor=jQuery('#hpos_selector').val();
	$DGD.select2D.paint(ver, hor);
}

jQuery(document).ready(function($){
	try	{
	    jQuery('.dgd-popup-color-picker').wpColorPicker();
	} catch (err) {
		$DGD.echo('WP 3.0 mode');
	}
	$DGD.select2D.init();
	var upload_image_type=false;

	jQuery('#upload_bg_image_button').click(function() {
		formfield = jQuery(this).prev('input');
		tb_show('Choose background image', 'media-upload.php?type=image&amp;TB_iframe=true');
		window.restore_send_to_editor = window.send_to_editor;
		window.send_to_editor=function(html) {
			imgurl = jQuery('img',html).attr('src');
			jQuery(formfield).val(imgurl);
			imgwidth = jQuery('img',html).attr('width');
			imgheight = jQuery('img',html).attr('height');
			jQuery(dgd_stb_height).append('<option value="'+imgheight+'" selected="selected">'+imgheight+'</option>');
			jQuery(dgd_stb_width).append('<option value="'+imgwidth+'" selected="selected">'+imgwidth+'</option>');
			tb_remove();		
			window.send_to_editor=window.restore_send_to_editor;
		}
		return false;
	});

 	jQuery('#upload_close_image_button').click(function() {
		formfield = jQuery(this).prev('input');
		upload_image_type='closeimage';
		// formfield = jQuery('#upload_image').attr('name');
		tb_show('Choose close button image', 'media-upload.php?type=image&amp;TB_iframe=true');
		window.restore_send_to_editor = window.send_to_editor;
		window.send_to_editor=function(html) {
			imgurl = jQuery('img',html).attr('src');
			jQuery(formfield).val(imgurl);
			tb_remove();		
			window.send_to_editor=window.restore_send_to_editor;
		}
		return false;
	});
});
