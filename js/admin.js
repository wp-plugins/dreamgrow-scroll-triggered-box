if(typeof ($DGD) == 'undefined') {
	var $DGD = {'debug':'1'};
}

if(typeof ($DGD.echo) == 'undefined') {
	$DGD.echo=function(str) {
		if ($DGD.debug) console.log(str);
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

$DGD.showTab=function(elem, tab) {
	jQuery(elem).parent('ul').next('.dgd_tab_container').find('.dgd_tab_content').addClass('hide');
	jQuery(elem).parent('ul').next('.dgd_tab_container').find('.'+tab).removeClass('hide');
	jQuery(elem).parent('ul').find('li').removeClass('selected');
	jQuery(elem).addClass('selected');
}


jQuery(document).ready(function($){
	try	{
	    jQuery('.dgd-popup-color-picker').wpColorPicker();
	} catch (err) {
		// $DGD.echo('WP 3.0 mode');
	}
	$DGD.select2D.init();
	var upload_image_type=false;

	jQuery('#upload_bg_image_button').click(function() {
		formfield = jQuery(this).prev('input');
		tb_show('Choose background image', 'media-upload.php?type=image&amp;TB_iframe=true');
		$DGD.restore_send_to_editor = window.send_to_editor;
		window.send_to_editor=function(html) {
			imgurl = jQuery('img',html).attr('src');
			jQuery(formfield).val(imgurl);
			imgwidth = jQuery('img',html).attr('width');
			imgheight = jQuery('img',html).attr('height');
			jQuery(dgd_stb_height).append('<option value="'+imgheight+'" selected="selected">'+imgheight+'</option>');
			jQuery(dgd_stb_width).append('<option value="'+imgwidth+'" selected="selected">'+imgwidth+'</option>');
			tb_remove();		
			window.send_to_editor=$DGD.restore_send_to_editor;
		}
		return false;
	});

 	jQuery('#upload_close_image_button').click(function() {
		formfield = jQuery(this).prev('input');
		upload_image_type='closeimage';
		// formfield = jQuery('#upload_image').attr('name');
		tb_show('Choose close button image', 'media-upload.php?type=image&amp;TB_iframe=true');
		$DGD.restore_send_to_editor = window.send_to_editor;
		window.send_to_editor=function(html) {
			imgurl = jQuery('img',html).attr('src');
			jQuery(formfield).val(imgurl);
			tb_remove();		
			window.send_to_editor=$DGD.restore_send_to_editor;
		}
		return false;
	});

	// prevent broken icon to show on WP<3.8
	jQuery('#menu-posts-dgdscrollbox').removeClass('menu-icon-dgdscrollbox').addClass('menu-icon-settings');
	jQuery('img[src="http://dashicons-welcome-comments"]').remove();
});
