if(typeof ($DGD) == 'undefined') {
	var $DGD = {'debug':'1'};
}

if(typeof ($DGD.echo) == 'undefined') {
	$DGD.echo=function(str) {
		if ($DGD.debug) console.log(str);
	}
}

$DGD.didScroll = false;
$DGD.didResize = false;
$DGD.loadedthemes=[];
$DGD.screenheight=2000;
$DGD.screenwidth=4000;
$DGD.boxes_wait_for_scroll=[];
$DGD.boxes_with_relative_position=[];
$DGD.boxes_wait_for_close=[];
$DGD.docheight=2000;
$DGD.toScroll=2000;


function DgdCreateSocialButtons(box) {
	this.ul=false;
	this.container=false;

	this.addFbButton = function () {
		if (typeof (FB) != "undefined") {
			FB.init({ status: true, cookie: true, xfbml: true });
		} else {
			jQuery.getScript("//connect.facebook.net/en_US/all.js#xfbml=1", function () {
				FB.init({ status: true, cookie: true, xfbml: true });
			});
		}	
		this.ul.append('<li class="fb '+box.social.facebook+'"><div class="fb-like" data-send="false" data-share="false" data-action="like" data-layout="'+box.social.facebook+'" data-width="200" data-show-faces="false"></div></li>');
	}

	this.addTwitterButton = function () {
		 if (typeof (twttr) != "undefined") {
			twttr.widgets.load();
		} else {
			jQuery.getScript("//platform.twitter.com/widgets.js");
		}

		this.ul.append('<li class="twitter '+box.social.twitter+'"><a href="https://twitter.com/share" data-url="'+$DGD.permalink+'" data-text="'+$DGD.title+'" class="twitter-share-button" >Tweet</a></li>');
		if(box.social.twitter=='no-count') {
			this.ul.find('.twitter a').attr('data-count', 'none');
		} else if (box.social.twitter=='vertical') {
			this.ul.find('.twitter a').attr('data-count', 'vertical');
		}
	}

	this.addGoogleButton = function () {
		if (typeof (gapi) != "undefined") {
			jQuery(".g-plusone").each(function () {
				gapi.plusone.render($(this).get(0));
			});
		} else {
			jQuery.getScript("https://apis.google.com/js/plusone.js");
		}

		this.ul.append('<li class="google '+box.social.google+'"><div class="g-plusone"></div></li>');
		if(box.social.google=='annotation') {
			this.ul.find('.google div').attr('data-size', 'medium');
			this.ul.find('.google div').attr('data-annotation', 'none');
		} else {
			this.ul.find('.google div').attr('data-size', box.social.google);
		}
	}

	this.addLinkedinButton = function () {
		if (typeof (IN) != "undefined") {
			IN.parse();
		} else {
			jQuery.getScript("//platform.linkedin.com/in.js");
		}	
		this.ul.append('<li class="linkedin '+box.social.linkedin+'"><script type="IN/Share"'+(box.social.linkedin != 'none' ? ' data-counter="'+box.social.linkedin+'"' : '')+'></script></li>');
	}

	this.addStumbleuponButton = function () {
		jQuery.getScript("//platform.stumbleupon.com/1/widgets.js");
		this.ul.append('<li class="stumbleupon s'+box.social.stumbleupon+'"><su:badge layout="'+box.social.stumbleupon+'"></su:badge></li>');
	}

	this.addPinterestButton = function () {
		jQuery.getScript("//assets.pinterest.com/js/pinit.js");
		this.ul.append('<li class="pinterest '+box.social.pinterest+'"><a href="http://pinterest.com/pin/create/button/?url='+$DGD.permalink+'&media='+$DGD.thumbnail+'" class="pin-it-button" count-layout="'+box.social.pinterest+'"><img border="0" src="//assets.pinterest.com/images/PinExt.png" title="Pin It" /></a></li>');
	}

	if(box.div.find('.inscroll').length>0) {
		this.container=box.div.find('.inscroll');
	} else if (box.div.find('#inscroll').length>0) {
		this.container=box.div.find('#inscroll');
	} else {
		this.container=box.div;
	}

	if(!jQuery(this.container).find('ul.stb_social').length) {
		// add ul if needed
		jQuery(this.container).append('<ul class="stb_social"></ul>');
	}
	this.ul=jQuery(this.container).find('ul.stb_social');

	if(box.social && this.ul.length>0) {
		if (box.social.facebook) this.addFbButton();
		if (box.social.twitter) this.addTwitterButton();
		if (box.social.google) this.addGoogleButton();
		if (box.social.linkedin) this.addLinkedinButton();
		if (box.social.stumbleupon) this.addStumbleuponButton();
		if (box.social.pinterest) this.addPinterestButton();
	}
}

$DGD.loadCss=function(cssUrl) {
	var fileref=document.createElement('link')
	fileref.rel='stylesheet';
	fileref.type='text/css';
	fileref.href=cssUrl;
	document.getElementsByTagName('head')[0].appendChild(fileref);
}

$DGD.measureScreen=function() {
	if(typeof window.innerHeight=='number') {
		this.screenheight=parseInt(window.innerHeight);
		this.screenwidth=parseInt(window.innerWidth);
	} else if (typeof screen.availHeight=='number') {
		this.screenheight=parseInt(screen.availHeight);
		this.screenwidth=parseInt(screen.availWidth);
	} else {
		this.screenheight=parseInt(jQuery(window).height());
		this.screenwidth=parseInt(jQuery(window).width());
	}
	this.docheight=parseInt(document.body.scrollHeight || jQuery(document).height());
	// With no doctype tag Chrome reports the same value for both calls.
	this.toScroll=this.docheight-this.screenheight;
	this.echo ('screenH: '+this.screenheight+', docH: '+this.docheight+', screenW: '+this.screenwidth+', toScroll: '+this.toScroll);
}


$DGD.isMobile=function () {
	// Thanks goes to http://detectmobilebrowsers.com/about
	return (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))return true;return false;})(navigator.userAgent||navigator.vendor||window.opera);
}


$DGD.calcScroll=function () {
	var scrolled=(document.body.scrollTop || parseInt(jQuery(document).scrollTop()));
	var rate=Math.round((scrolled+0.001)*10/(this.toScroll+0.001))*10;
	this.echo('Rate: '+rate + 
		' IE: '+document.body.scrollTop+
		' Scrollheight: '+document.body.scrollHeight+
		' window.pageYOffset: '+window.pageYOffset);

	for (var i=0; i<this.boxes_wait_for_scroll.length; i++) {
		var box=this.boxes_wait_for_scroll[i];
		if(rate>=box.trigger.scroll && box.hidden && !box.closed) {
			this.showBox(box);
		}
		if(rate<box.trigger.scroll && !box.hidden) {
			this.hideBox(box);
		}
	}
}

$DGD.fixPosition=function () {
	for(var i=0; i<this.boxes_with_relative_position.length; i++) {
		var box=this.boxes_with_relative_position[i];
		if(box.vpos=='center') box.div.css('top', (this.screenheight-box.height)/2+'px'); 
		if(box.hpos=='center') box.div.css('left', (this.screenwidth-box.width)/2+'px'); 
	}	
}

$DGD.setCookie=function (cname, exdays) {
    var d = new Date();
	var expires='';
	if(exdays!=0) {
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
		expires = "; expires="+d.toUTCString();
	} 
	document.cookie = cname + "=" + exdays + expires;
}

function dgdSetCookieCloseForever(cname) {
    var d = new Date();
	var expires='';
	if(exdays!=0) {
	    d.setTime(d.getTime() + (365*24*60*60*1000));
		expires = "; expires="+d.toUTCString();
	} 
	document.cookie = cname + "=closed" + expires;
}

$DGD.getCookie=function (cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) {
			return parseInt(c.substring(name.length,c.length));
		}
    }
    return -2;
}

$DGD.checkCookie=function (box) {
	var cookieval=this.getCookie(box.id);
	this.echo('Cookie:'+cookieval+', cookieLifetime :'+box.cookieLifetime);
	if(cookieval==box.cookieLifetime) {
		// value from cookie exists and is same than in scrollbox: showing is disabled
		this.echo(box.id+' is disabled by cookie');
		return false;
	} else if(cookieval=='9000') {
		this.echo(box.id+' is closed for ever');
		return false;
	}
	// cookie does not exist OR value is changed: showing is enabled
	this.echo(box.id+' is enabled by cookie');
	return true;
}

$DGD.placeBox=function (box) {

	box.div=jQuery('#'+box.id);
	box.hidden=true;		// box is temporarily not visible
	box.closed=false;	// box is closed, do not show again 
	box.anim_from={};
	box.anim_to={};

	// set div properties first as they affect position calculations later
	if(box.jsCss.backgroundColor!=null && box.jsCss.backgroundColor!='')		box.div.css('background-color', box.jsCss.backgroundColor); 
	if(box.jsCss.padding!=null)		box.div.css('padding', box.jsCss.padding); 
	box.jsCss.margin=parseInt(box.jsCss.margin); 
	if(box.jsCss.borderWidth!='0px' && box.jsCss.borderColor!='')		box.div.css('border', box.jsCss.borderColor+' solid '+box.jsCss.borderWidth); 
	if(box.jsCss.borderRadius!='0px')	box.div.css('border-radius', ''+box.jsCss.borderRadius); 
	if(box.jsCss.boxShadow!='0px')			box.div.css('box-shadow', ''+box.jsCss.boxShadow+' '+box.jsCss.boxShadow+' 25px #888888'); 
	if(box.jsCss.backgroundImageUrl!=null && box.jsCss.backgroundImageUrl!='')		box.div.css('background-image', 'url('+box.jsCss.backgroundImageUrl+')');

	if(box.closeImageUrl!=null && box.closeImageUrl!=''){
		// first tag in box.div is always close button, set this image as background
		var closebutton=box.div.children().first();
		var image=new Image();

		function onload() {
			this.echo('Custom close button: width:'+image.width+' url:'+box.closeImageUrl+' ');
			closebutton.removeClass('dgd_stb_box_x');
			closebutton.css('background-image', 'url('+box.closeImageUrl+')');
			closebutton.width(image.width);
			closebutton.height(image.height);
			closebutton.css('border', 'none');
			closebutton.css('top', '0px');
			closebutton.css('right', '0px');
		}
		// preload close button
		// when its loaded we can give to close button right size
		image.onload=onload;
		image.src=box.closeImageUrl;
	}

	new DgdCreateSocialButtons(box);

	if(box.showDuration==0){
		box.showDuration=86400000;
	}

	if(box.height=='auto') {
		box.height=parseInt(box.div.outerHeight(true));
	} else {
		box.height=parseInt(box.height);
		box.div.height(box.height);
	}
	if(box.width=='auto') {
		box.width=parseInt(box.div.outerWidth(true));
	} else {
		box.width=parseInt(box.width);
		box.div.width(box.width);
	}

	if(box.trigger.action=='element') {
		if(jQuery(box.trigger.element).length>0) {
			var elementheight=jQuery(box.trigger.element).offset().top;
			this.toScroll=this.docheight-this.screenheight;
			box.trigger.scroll=((elementheight-this.screenheight)+0.001)/(this.toScroll+0.001)*100;
			this.echo('Element offset:'+elementheight+ ' screenheight:'+this.screenheight+' docheight:'+this.docheight+' scroll:'+box.trigger.scroll);
		} else {
			box.trigger.scroll=111;
			this.echo('Element '+box.trigger.element+' is missing');
		}
	}

	switch(box.transition.effect) {
		case 'fade':
			box.anim_from['opacity']=0;
			box.anim_to['opacity']=1;
			break;
	}

	switch(box.vpos) {	// placement 'to'
		case 'top': 
			box.vpos_att='top';
			box.vpos_to=box.jsCss.margin;
			switch(box.transition.from) {
				case 't': box.vpos_from=-(box.height+box.jsCss.margin); break;
				case 'b': box.vpos_from=this.screenheight+box.jsCss.margin; break;
				default: box.vpos_from=box.vpos_to;
			}
			break;			
		case 'center': 
			box.vpos_att='top';
			box.vpos_to=(this.screenheight-box.height)/2;
			switch(box.transition.from) {
				case 't': box.vpos_from=-(box.height+box.jsCss.margin); break;
				case 'b': box.vpos_from=this.screenheight+box.jsCss.margin; break;
				default: box.vpos_from=box.vpos_to;
			}			
			break;
		default: // case 'bottom' 
			box.vpos_att='bottom';
			box.vpos_to=box.jsCss.margin;
			switch(box.transition.from) {
				case 't':  box.vpos_from=this.screenheight+box.jsCss.margin; break;
				case 'b': box.vpos_from=-(box.height+box.jsCss.margin); break;
				default: box.vpos_from=box.vpos_to;
			}
			break;
	}

	switch(box.hpos) { // placement 'to'
		case 'left':
			box.hpos_att='left';
			box.hpos_to=box.jsCss.margin;
			switch(box.transition.from) {
				case 'r': box.hpos_from=this.screenwidth+box.jsCss.margin; break;
				case 'l': box.hpos_from=-(box.width+2*box.jsCss.margin); break;
				default: box.hpos_from=box.hpos_to;
			}
			break;			
		case 'center':
			box.hpos_att='left';
			box.hpos_to=(this.screenwidth-box.width)/2;
			switch(box.transition.from) {
				case 'r': box.hpos_from=this.screenwidth+box.jsCss.margin; break;
				case 'l': box.hpos_from=-(box.width+2*box.jsCss.margin); break;
				default: box.hpos_from=box.hpos_to;
			}
			break;
		default: // case 'right':
			box.hpos_att='right';
			box.hpos_to=box.jsCss.margin;
			switch(box.transition.from) {
				case 'r': box.hpos_from=-(box.width+2*box.jsCss.margin); break;
				case 'l': box.hpos_from=this.screenwidth+2*box.jsCss.margin; break;
				default: box.hpos_from=box.hpos_to;
			}
			break;
	}
	
	this.echo('Box '+box.id+' direction is '+box.transition.from);
	this.echo('From: '+box.vpos_att+': '+box.vpos_from+'px, '+box.hpos_att+': '+box.hpos_from+'px');
	this.echo('To: '+box.vpos_att+': '+box.vpos_to+'px, '+box.hpos_att+': '+box.hpos_to+'px');

	box.div.css(box.vpos_att, box.vpos_from);
	box.div.css(box.hpos_att, box.hpos_from);
	box.anim_from[box.vpos_att]=box.vpos_from; 
	box.anim_from[box.hpos_att]=box.hpos_from;
	box.anim_to[box.vpos_att]=box.vpos_to; 
	box.anim_to[box.hpos_att]=box.hpos_to;

	// box.div.css('display', 'block').stop(true, true);
}

$DGD.hideBox=function (box) {
	if(box.hidden) {
		// already hidden nothing to do here
		return;
	}
	// BUG: Do not hide if some input boxes are in focus?
	this.echo('hide box '+box.id);
	box.hidden=true;
	box.div.animate(box.anim_from, box.transition.speed, 'swing', function() { box.div.css('display', 'none'); });
}

$DGD.showBox=function (box) {
	this.echo('show box '+box.id);
	if(!box) box=this;
	if(!box.hidden || box.closed) {
		// already visible OR forcefully closed, return
		return;
	}
	box.hidden=false;
	box.div.css('display','block').stop(true, true);
	box.div.animate(box.anim_to, box.transition.speed, 'swing');
}

$DGD.getBoxById=function (box_id) {
	for (var i=0; i<$DGD.scrollboxes.length; i++) {
		if($DGD.scrollboxes[i].id==box_id) return $DGD.scrollboxes[i];
	}
	return false;
}

$DGD.closeBox=function () {
	// closeBox is initiated from Static context, use $DGD instead of 'this' 
	var box_id=jQuery(this).closest('.dgd_stb_box').attr('id');
	var box=$DGD.getBoxById(box_id);
	if(box) {
		box.closed=true;
		$DGD.hideBox(box);
		$DGD.setCookie(box.id, box.cookieLifetime);	
	}
}

$DGD.regTimedClose=function(box, seconds_to_close) {
	box.closingTime=Date.now()+seconds_to_close*1000;
	$DGD.boxes_wait_for_close[$DGD.boxes_wait_for_close.length]=box;
}

$DGD.closeAfterSubmit=function (box_id) {
	var box=$DGD.getBoxById(box_id);
	if(box && box.hide_submitted) {
		// 9000 means 'for ever'
		$DGD.setCookie(box_id, '9000');
	}
	// register timed close
	$DGD.regTimedClose(box, 3);
}

$DGD.submitForm=function (e) {
	// submitForm is initiated from Static context, use $DGD
	e.preventDefault();
	var form=jQuery(this);
	var box_id=form.closest('.dgd_stb_box').attr('id');
	var message_container=form.next('p');

	var sendobj={};
	sendobj.box=box_id;
	sendobj.page=document.location.href;
	sendobj.action='dgd_stb_form_process';
	sendobj.stbNonce=$DGD.nonce;
	sendobj.user_screen_size=''+$DGD.screenwidth+'px * '+$DGD.screenheight+'px';
	form.find('input').each(function() {
		sendobj[jQuery(this).attr('name')] = jQuery(this).val();
	});		

	$DGD.echo('Ajaxurl: '+$DGD.ajaxurl);

	jQuery.ajax({
		url:$DGD.ajaxurl,
		data: sendobj,
		dataType:'html',
		type:'post',
		cache:false,
		beforeSend: function() {
			message_container.html('<img src="'+$DGD.scripthost+'img/37-1.gif" border="0">').show();
		},
		success: function (JSONstring) {
				try {
					response=jQuery.parseJSON(JSONstring);	
				} catch (e) {
					console.info('Unknown response: '+JSONstring);
					return;
				}
			$DGD.echo(message_container+'=>'+response.status+': '+response.html);
			message_container.html(response.html).show();
			if(response.status==200) {
				// set cookie for permanent close
				$DGD.closeAfterSubmit(box_id);
			}
		}
	});
}

$DGD.generateBox=function (box) {
	var boxdiv = document.createElement('div');
	boxdiv.className='dgd_stb_box '+box.theme;
	boxdiv.id=box.id;
	boxdiv.innerHTML=box.html;
	document.getElementsByTagName('body')[0].appendChild(boxdiv);
	this.loadCss(this.scripthost+'themes/'+box.theme+'/style.css'); 
	if(box.receiver_email) {
		// if receiver_email==1 then replace default action
		var form=jQuery(boxdiv).find('form');
		if(typeof form !='undefined') {
			form.submit(this.submitForm);
		}
	}
}

$DGD.scrollboxInit=function () {
	var is_mobile_user=false;
	if(is_mobile_user=this.isMobile()) {
		this.echo('Mobile user '+(navigator.userAgent||navigator.vendor||window.opera));		
	} else {
		this.echo('Regular user '+(navigator.userAgent||navigator.vendor||window.opera));			
	}
	if(this.scrollboxes.length>0) {
		this.measureScreen();

		for (var i=0; i<this.scrollboxes.length; i++) {
			var box=this.scrollboxes[i];

			this.echo('i:'+i+' box:'+box);
			this.echo('box '+box.id+' mob '+ box.hide_mobile);
			if((typeof box.hide_mobile != 'undefined') && is_mobile_user) {
				this.echo(box.id+' is disabled for mobile user');
				continue;
			} 

			if (!this.checkCookie(box)) {
				continue;
			}

			this.generateBox(box);
			this.placeBox(box);	

			// start timers
			if(box.trigger.action=='delay') {		// time action triggered box
				this.showBox(box);
			}else if (box.trigger.action=='scroll') { // scroll action triggered box
				box.trigger.delaytime=0;
				this.boxes_wait_for_scroll[this.boxes_wait_for_scroll.length]=box;
			}else if (box.trigger.action=='element') { // element action triggered box
				this.boxes_wait_for_scroll[this.boxes_wait_for_scroll.length]=box;
			}
		}

		if(this.boxes_wait_for_scroll.length>0) {
			window.onscroll = function(){$DGD.didScroll = true;};	// BUG: possible conflict area
			window.onresize = function(){$DGD.didResize = true;};	// BUG: possible conflict area

			setInterval(function() {
				if($DGD.didScroll) {
					$DGD.didScroll = false;
					$DGD.calcScroll();
				}
				if($DGD.didResize) {
					$DGD.didResize = false;
					$DGD.measureScreen();		
					$DGD.fixPosition();
				}
				if($DGD.boxes_wait_for_close.length>0) {
					var d=Date.now();
					for(var i=0; i<$DGD.boxes_wait_for_close.length; i++) {
						var box=$DGD.boxes_wait_for_close[i];
						if(box.closingTime<d) {
							// time to wrap it up
							box.closed=true;
							$DGD.hideBox(box);
							// remove box from queue
							$DGD.boxes_wait_for_close.splice[i];
						}
					}
				
				}
			}, 333);
		}

		jQuery('.dgd_stb_box_close').click($DGD.closeBox);
		jQuery('.dgd_stb_box_close_button').click($DGD.closeBox);
		// fallback for old layout
		jQuery('#closebox').click($DGD.closeBox);
	}
}

$DGD.echo('script.js loaded');
jQuery( document ).ready(function() {
	$DGD.scrollboxInit();
});
