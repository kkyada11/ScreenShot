'use strict';

var webPage	= require('webpage'),
	page	= webPage.create(),
	system	= require('system'),
	fs		= require('fs');

function getFilename(url){
	var pattern = /(^.*\/)([^&#?]*)/;
	var m = url.match(pattern);
	var filename = m[2];
	return filename;
}

function getExtensionOfFilename(filename) {
	var _fileLen = filename.length;
	var _lastDot = filename.lastIndexOf('.');
	var _fileExt = filename.substring(_lastDot, _fileLen).toLowerCase();
	return _fileExt;
}

console.log('The default user agent is ' + page.settings.userAgent);

if (system.args.length === 1){
	console.log('Usage: loadspeed.js <some URL>');
	phantom.exit();
}

// 셋팅.
// PC
page.settings.userAgent = 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; NetHelper70)';
// 모바일 [Mobile Safari]
page.settings.userAgent = 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1_3 like Mac OS X; ko-kr) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16';
// 모바일 [Android Web Browser]
page.settings.userAgent = 'Mozilla/5.0 (Linux; U; Android 2.1-update1; ko-kr; Nexus One Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17';
// 모바일 [Opera Mini]
//page.settings.userAgent = 'Opera/9.80 (J2ME/MIDP; Opera Mini/5.0.18302/1114; U; en) Presto/2.4.15';
// 모바일 [WebOS Web Browser]
//page.settings.userAgent = 'Mozilla/5.0 (webOS/1.4.1.1; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.0';

page.viewportSize = {width:320, height:568};

var address = system.args[1],
		path = system.args[2];

page.open(address, function(status){
	if (status) {
		// fs.write('test.html', page.content, 'w');	// html 파일 소스 반환.
		var files = path + '/' + getFilename(address);
		//page.render(filename+'.jpeg', {format: 'jpeg', quality: '100'});	// 이미지로 캡쳐.
		page.render(files+'.png');	// 이미지로 캡쳐.
		phantom.exit();
	}
	phantom.exit();
});