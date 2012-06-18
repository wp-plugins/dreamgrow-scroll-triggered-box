jQuery(document).ready(function(){
    jQuery("#closebox").click(function(){
        jQuery('#scrolldriggered').stop(true, true).animate({ 'bottom': '-210px' }, 500, function() {
            jQuery('#scrolldriggered').hide();
            hascolsed = true;
            jQuery.cookie('nopopup', 'true', { expires: cookieLife });
        });
        return false;
    });

    var windowheight = jQuery(window).height();
    var totalheight = jQuery(document).height();
    var boxOffset = '';
    if(sdbElement != ''){
        boxOffset = jQuery(sdbElement).offset().top;
    }
    jQuery(window).resize(function() {
        windowheight = jQuery(window).height();
        totalheight = jQuery(document).height();
    });

    jQuery(window).scroll(function(){
        var y = jQuery(window).scrollTop();
        var boxHeight = jQuery('#scrolldriggered').outerHeight();
        var scrolled = parseInt( (y+windowheight) / totalheight*100 );


        if(showBox(scrolled,triggerHeight,y) && jQuery('#scrolldriggered').is(":hidden") && hascolsed != true) {
            jQuery('#scrolldriggered').show();
            jQuery('#scrolldriggered').stop(true, true).animate({ 'bottom': '10px' }, 500, function() {});
        }
        else if(!showBox(scrolled,triggerHeight,y) && jQuery('#scrolldriggered').is(":visible") && jQuery('#scrolldriggered:animated').length < 1){
            jQuery('#scrolldriggered').stop(true, true).animate({ 'bottom': -boxHeight }, 500, function() {
                jQuery('#scrolldriggered').hide();
            });
        }
    });
});
function showBox(scrolled,triggerHeight,y){
    if(isMobile()) return false;
    if(sdbElement == ''){
        if(scrolled >= triggerHeight){
            return true;
        }
    }
    else{
        if(boxOffset < (windowheight + y)){
            return true;
        }
    }
    return false;
}
function isMobile(){
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        ){
        return true;
    }
    else return false;
}