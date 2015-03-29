$DGD.iframe = false;
$DGD.iframeDocument = false;
$DGD.previewObj = {"trigger":{"action":"scroll","scroll":50,"delaytime":0,"element":""},"height":"auto","width":300,"vpos":"bottom","hpos":"right","include_css":"1","theme":"default","jsCss":{"padding":"10","margin":"10","backgroundImageUrl":"","backgroundColor":"","boxShadow":"","borderColor":"","borderWidth":"0px","borderRadius":""},"transition":{"effect":"slide","from":"b","speed":400},"social":{"facebook":0,"twitter":0,"google":0,"pinterest":0,"stumbleupon":0,"linkedin":0},"closeImageUrl":"","hide_mobile":"1","submit_auto_close":5,"delay_auto_close":40,"hide_submitted":"1","cookieLifetime":1,"receiver_email":false,"thankyou":"You are subscribed. Thank You!","widget_enabled":"1","tabhtml":"Subscribe!","tab":"1","id":"dgd_scrollbox-preview","voff":0,"hoff":0};

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

$DGD.initIframe = function () {
    var iframeref;
    $DGD.iframe = document.getElementById('previewFrame');
	if (!$DGD.iframe) {
        iframeref = document.createElement('iframe');
        iframeref.id = 'previewFrame';
        document.getElementsByTagName('body')[0].appendChild(iframeref);
	    $DGD.iframe = document.getElementById('previewFrame');
	}
	if (!$DGD.iframeDocument) {
		$DGD.iframeDocument = $DGD.iframe.contentDocument || $DGD.iframe.contentWindow.document;
	}
}

$DGD.closePreview = function () {
	if ( $DGD.iframeDocument ) {
		$DGD.iframeDocument.replaceChild(document.implementation.createHTMLDocument('Preview').documentElement, $DGD.iframeDocument.documentElement);
	    $DGD.removeClass($DGD.iframe, 'activate');
    }
}

$DGD.makeItTransparent = function (doc) {
    //  thanks to: http://pankajparashar.com/posts/modify-pseudo-elements-css/
    var style = document.createElement("style");
    doc.head.appendChild(style);
    sheet = style.sheet;
    if (sheet.addRule) {    // IE, Chrome, Safari?
        sheet.addRule('body::before','background: transparent');
    } else if (sheet.insertRule) {  // Firefox
        sheet.insertRule('body::before { background: transparent }', 0);
    }
    doc.body.style.background='transparent';
}

$DGD.loremIpsum = function () {
    return '<article class="page type-page hentry"><div class="entry-content">'+
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pellentesque dolor sit amet cursus tristique. Suspendisse molestie, neque et pretium auctor, quam nulla porttitor quam, ac tristique lacus risus et elit. Etiam a vehicula ipsum. Cras hendrerit urna dignissim leo efficitur, eget elementum eros venenatis. Nullam sem orci, gravida ut tempus ac, rutrum eu sapien. Vivamus vitae nisl nisl. Nulla eget magna mauris.</p>' +
        '<p>Etiam ex nisl, rutrum non odio nec, porta molestie nunc. Vestibulum tincidunt purus eget iaculis elementum. Morbi efficitur purus at diam ultricies gravida. Pellentesque at mi in ante auctor pretium. Morbi ac fringilla tellus, sed iaculis ex. Vivamus nec vestibulum nunc. Donec dictum, neque eu aliquet rutrum, mauris elit hendrerit metus, et lobortis metus quam in tortor. Integer efficitur risus quis lacinia ornare. Donec a lectus pharetra, faucibus dolor eget, euismod nibh. Nam facilisis eros nec eros dapibus, vel placerat libero iaculis. Morbi condimentum et tortor non finibus. Cras sit amet porttitor ipsum. Cras placerat orci non porta vestibulum.</p>' +
        '<p>Nulla facilisi. Donec vitae ornare dui. Nulla condimentum rutrum tortor, at interdum elit consequat vel. Nullam in purus ultricies, facilisis nisl ac, tincidunt magna. Aliquam blandit finibus efficitur. Curabitur rhoncus ex non felis molestie tincidunt. Quisque a tortor eros. Praesent eu arcu at dui imperdiet aliquam. Vivamus fringilla eros eu mi tempus finibus quis nec ligula. Sed hendrerit arcu quis justo dapibus ullamcorper. Aenean ultricies velit vel arcu fermentum bibendum. Nulla consectetur vel lorem a imperdiet.</p>'+
        '</div></article>';
}

$DGD.generatePreviewPage = function (data) {
    var parent,
        old_html = document.implementation.createHTMLDocument('old'),
        new_html = document.implementation.createHTMLDocument('Preview'),
        new_head,
        new_body,
        scrollbox_div;
    old_html.documentElement.innerHTML = data;

    new_head = new_html.getElementsByTagName('head')[0];
    new_body = new_html.getElementsByTagName('body')[0];

    jQuery(old_html).find('head link[rel="stylesheet"], head style, head script').each(function( index, element ){
        if ( typeof this === 'object' && this.outerHTML.length>0 ) {
            new_head.appendChild(this);
        }
    });

    jQuery(old_html).find('body link[rel="stylesheet"], body style, body script').each(function( index, element ){
        if ( typeof this === 'object' && this.outerHTML.length>0 ) {
            new_body.appendChild(this);
        }
    });

    $DGD.previewObj.html=jQuery(data).find('div.entry-content').html();
	$DGD.addClass($DGD.iframe, 'activate');

    new_body.innerHTML = $DGD.loremIpsum();
    console.log('New: '+new_html.documentElement);
    console.log($DGD.iframeDocument.documentElement);

    //  $DGD.iframeDocument.documentElement.innerHTML=new_html.documentElement.innerHTML;

    $DGD.iframeDocument.replaceChild(new_html.documentElement, $DGD.iframeDocument.documentElement);
    $DGD.makeItTransparent($DGD.iframeDocument);

    parent=$DGD.iframeDocument.getElementsByTagName('body')[0];
    console.log('parent:');
    console.log(parent);
    $DGD.iframeDocument.addEventListener( 'keyup', $DGD.closePreview, false );
    $DGD.iframeDocument.addEventListener( 'click', $DGD.closePreview, false );
    $DGD.iframeDocument.addEventListener( 'touchstart', $DGD.closePreview, false );

    scrollbox_div = $DGD.generateBox($DGD.previewObj, parent);
    $DGD.previewObj.div=jQuery('#dgd_scrollbox-preview', $DGD.iframeDocument);

    $DGD.placeBox($DGD.previewObj);
    $DGD.showBox($DGD.previewObj);
}

$DGD.renderAjaxError = function (jqXHR, textStatus, errorThrown) {
    console.debug(textStatus + ' ' + errorThrown);
};

$DGD.getHtmlAndShow = function(preview) {
    var url = jQuery('form#post').attr('action') + '?t=' + Date.now(),
	    previewField = jQuery('input#wp-preview'); // IE9+
        // Bug: consider using DOMParser, http://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements

    if ( wp.autosave ) {
        wp.autosave.server.triggerSave();
    }
    previewField.val('dopreview');

    jQuery.ajax({
        type: "POST",
        url: url,
        data: jQuery("form#post").serialize(), // serializes the form's elements.
        success: $DGD.generatePreviewPage,
        error: $DGD.renderAjaxError,
        });
    previewField.val('');

    return false; // avoid to execute the actual submit of the form.
};

$DGD.showPreview = function (e) {
    e.preventDefault();
    $DGD.closePreview();
    $DGD.serializeObject(jQuery('form#post'), $DGD.previewObj);
    //  console.log($DGD.previewObj);
    // $DGD.previewObj.trigger.action='scroll';
    // $DGD.previewObj.trigger.scroll=0;
    $DGD.getHtmlAndShow($DGD.previewObj);
    return false;
};

$DGD.showDebug = function (e) {
    var iframe = document.getElementById('previewFrame');
    e.preventDefault();
    console.log( iframe.contentWindow.$DGD );
    console.log( iframe.contentWindow );
    console.log( iframe.contentWindow.document.getElementById('dgd_scrollbox-preview') );
    return false;
};

$DGD.replacePreviewButton = function () {
    if( pagenow==='dgd_scrollbox' ) {
        $DGD.echo('We are at Scrollbox edit screen, add Preview button and preview area');
        $DGD.initIframe();
        jQuery('#preview-action a#post-preview').remove();
        jQuery('#preview-action').append('<a href="#" class="preview button" id="scrollbox-preview">Preview Scrollbox</a>');
        jQuery('#preview-action a#scrollbox-preview').click(function (event) {$DGD.showPreview(event)});
    }
};

jQuery(document).ready(function () { $DGD.replacePreviewButton(); });
