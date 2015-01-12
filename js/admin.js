/*jslint browser: true, plusplus: true */
/*global $DGD */
/*global jQuery */
/*global tb_show */
/*global tb_remove */
/*global console */


if (typeof $DGD !== 'object') {
    $DGD = { debug: true };
}

if (typeof $DGD.echo !== 'object') {
    $DGD.echo = function (str) {
        'use strict';
        if ($DGD.debug) {console.log(str); }
    };
}

$DGD.select2D = {};

$DGD.select2D.paint = function (ver, hor) {
    'use strict';
    var row = 0, col = 0;
    switch (ver) {
    case 'bottom':
        row++;
    case 'center':
        row++;
    }
    switch (hor) {
    case 'right':
        col++;
    case 'center':
        col++;
    }
    jQuery('#dgd_pos_selector .selected').removeClass('selected');
    jQuery('#dgd_pos_selector').find('tr:eq(' + row + ')').find('a:eq(' + col + ')').addClass('selected');
};

$DGD.select2D.choose = function (ver, hor) {
    'use strict';
    jQuery('#hpos_selector').val(hor);
    jQuery('#vpos_selector').val(ver);
    $DGD.select2D.paint(ver, hor);
};

$DGD.select2D.init = function () {
    'use strict';
    var ver = jQuery('#vpos_selector').val(),
        hor = jQuery('#hpos_selector').val();
    $DGD.select2D.paint(ver, hor);
};

$DGD.showTab = function (elem, tab) {
    'use strict';
    jQuery(elem).parent('ul').next('.dgd_tab_container').find('.dgd_tab_content').addClass('hide');
    jQuery(elem).parent('ul').next('.dgd_tab_container').find('.' + tab).removeClass('hide');
    jQuery(elem).parent('ul').find('li').removeClass('selected');
    jQuery(elem).addClass('selected');
};

jQuery(document).ready(function () {
    'use strict';
    try {
        jQuery('.dgd-popup-color-picker').wpColorPicker();
    } catch (ignore) {
    }
    $DGD.select2D.init();
    $DGD.restore_send_to_editor = window.send_to_editor;

    jQuery('#upload_bg_image_button').click(function () {
        var formfield = jQuery(this).prev('input');
        tb_show('Choose background image', 'media-upload.php?type=image&amp;TB_iframe=true');
        window.send_to_editor = function (html) {
            var imgurl = jQuery('img', html).attr('src'),
                imgwidth,
                imgheight;
            jQuery(formfield).val(imgurl);
            imgwidth = jQuery('img', html).attr('width');
            imgheight = jQuery('img', html).attr('height');
            jQuery('#dgd_stb_height').append('<option value="' + imgheight + '" selected="selected">' + imgheight + '</option>');
            jQuery('#dgd_stb_width').append('<option value="' + imgwidth + '" selected="selected">' + imgwidth + '</option>');
            tb_remove();
            window.send_to_editor = $DGD.restore_send_to_editor;
        };
        return false;
    });

    jQuery('#upload_close_image_button').click(function () {
        var formfield = jQuery(this).prev('input');
        tb_show('Choose close button image', 'media-upload.php?type=image&amp;TB_iframe=true');
        window.send_to_editor = function (html) {
            var imgurl = jQuery('img', html).attr('src');
            jQuery(formfield).val(imgurl);
            tb_remove();
            window.send_to_editor = $DGD.restore_send_to_editor;
        };
        return false;
    });

    // prevent broken icon to show on WP<3.8
    jQuery('#menu-posts-dgdscrollbox').removeClass('menu-icon-dgdscrollbox').addClass('menu-icon-settings');
    jQuery('img[src="http://dashicons-welcome-comments"]').remove();
});