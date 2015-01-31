$DGD.previewDiv=false;

$DGD.getScrollboxContent = function () {
    var content;
    var editor = tinyMCE.activeEditor;
    var textArea = jQuery('textarea#content');
    if (textArea.length>0 && textArea.is(':visible')) {
        content = textArea.val();
    } else {
        content = editor.getContent();
    }
    return content;
};


$DGD.hasParam = function (obj, param) {
    return (typeof obj === 'object' && (typeof obj[param] === 'string' || typeof obj[param] === 'number' || typeof obj[param] === 'boolean'));
};

$DGD.stringArrayToObject = function (input, box) {
    var m;
    m = input.name.match(/dgd_stb(\[(\w+)\])(\[(\w+)\])*/);
    if( m !== null) {
        // $DGD.echo(m);
        if ($DGD.hasParam(box, m[2])) {
            box[m[2]]=input.value;
            // $DGD.echo(m[2]+': '+input.value);
        } else if ($DGD.hasParam(box[m[2]], [m[4]])) {
            box[m[2]][m[4]]=input.value;
            // $DGD.echo(m[2]+'.'+m[4]+': '+input.value);
        }
    }
};

$DGD.serializeObject = function (form, box) {
    var inputs = form.serializeArray(), i, input;
    jQuery.each(inputs, function (i, input) {
        $DGD.stringArrayToObject(input, box);
    });
};

$DGD.closePreview = function () {
    $DGD.closeBox();
    jQuery($DGD.previewDiv).remove();
    $DGD.previewDiv=false;
}


$DGD.getHtml = function (preview) {
    var sendobj = {};

    sendobj.html = preview.html;
    sendobj.widget_enabled = preview.widget_enabled;
    sendobj.action = 'dgd_stb_get_html';
    sendobj.stbNonce = $DGD.nonce;

    jQuery.ajax({
        url: $DGD.ajaxurl,
        data: sendobj,
        dataType: 'json',
        type: 'post',
        cache: false,
        beforeSend: function () {
            // do something
        },
        success: function (response) {
            console.debug(response.html);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // console.debug(textStatus + ': ' + errorThrown);
            console.debug(textStatus);
        }
    });
};


$DGD.showPreview = function (e) {
    var preview = $DGD.scrollboxes[0];
    e.preventDefault();
    if (typeof $DGD.previewDiv === 'object') {
        $DGD.closePreview();
    }
    $DGD.serializeObject(jQuery('form#post'), preview);
    preview.html=$DGD.getScrollboxContent();
    // BUG: parse shortcode and add widget

    /*
    $DGD.previewDiv = $DGD.generateBox(preview);
    $DGD.placeBox(preview);
    jQuery('.dgd_stb_box_close').click($DGD.closePreview);
    $DGD.showBox(preview);
    */
    $DGD.getHtml(preview);

    // $DGD.echo(preview));
    return false;
};

$DGD.replacePreviewButton = function () {
    if( pagenow==='dgd_scrollbox' ) {
        // $DGD.echo('We are at Scrollbox edit screen, do Preview button');
        jQuery('#preview-action a#post-preview').remove();
        jQuery('#preview-action').html('<a href="#" class="preview button" id="post-preview">Preview Scrollbox</a>');
        jQuery('#preview-action a#post-preview').click(function () {$DGD.showPreview(event)});
    }
};

jQuery(document).ready(function () { $DGD.replacePreviewButton(); });
