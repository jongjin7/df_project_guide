/*
 project : detectAPI
 date : 2014.04
 version : 1.0
*/
var _Device = {};
_Device.smartphone = false;
_Device.tablet = false;
_Device.type = 0;		// 0: Web / 1: Tablet / 2: Mobile
_Device.os = 0; // 0 : android / 1 : ios / 2: etc
// alert( '[ main ] detect.js' );

function checkDevice() {
    // Android
    if (navigator.userAgent.match(/Android/) != null) {
        //android
        if (navigator.userAgent.match(/mobile|Mobile/) != null) {

            //mobile
            _Device.type = 2;

        } else {
            //tab
            _Device.type = 1;		// DOP.isTablet = true;
        }

        _Device.os = 0;

        // not android
    } else {
        var minSiteWidth = 480;
        /*Anything Less than or Equal to this will be in 'phone' view*/
        var maxSiteWidth = 1024;
        /*Anything between this and min width will be tablet, anything greater will be Desktop*/
        var w = ($(window).width() < window.screen.width ) ? $(window).width() : window.screen.width;

        // ios check
        if (navigator.userAgent.match(/iPhone|iPad|iPod/) != null) {
            _Device.os = 1;
        } else {
            _Device.os = 2;
        }


        if (navigator.userAgent.match(/webOS|iPhone|iPad|iPod|BlackBerry/) != null) {

            if (w <= minSiteWidth || (navigator.userAgent.match(/iPhone|iPod|BlackBerry/) != null && navigator.platform.match(/iPad/) == null)) {
                _Device.type = 2;			//mobile

            } else {
                //tab
                _Device.type = 1;			// DOP.isTablet = true;
            }

        } else {
            _Device.type = 0;		// Web
        }
    }

    if (_Device.type == 2) {
        // mobile
        _Device.tablet = false;
        _Device.smartphone = true;

    } else if (_Device.type == 1) {
        // tablet
        _Device.tablet = true;
        _Device.smartphone = false;

    } else {
        // web
        _Device.smartphone = _Device.tablet = false;
    }

}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// web browser Detect

_Browser = {};

function browserDetect(){

    ///////////////////////////////////////////////////////////////////////////// vars
    ///////////////////////////////////////////////////////////////////////////

    _Browser.ie6 = false;
    _Browser.ie7 = false;
    _Browser.ie8 = false;
    _Browser.ie9 = false;
    _Browser.ie10 = false;
    _Browser.ie11_over = false;

    _Browser.msie = false;
    _Browser.mozilla = false; // FF
    _Browser.safari  = false;
    _Browser.chrome = false;

    _Browser.version = 0;
    _Browser.name = "etc";

    /////////////////////////////////////////////////////////////////

    var objappVersion = navigator.appVersion;
    var objAgent = navigator.userAgent;
    var objbrowserName  = navigator.appName;
    var objfullVersion  = ''+parseFloat(navigator.appVersion);
    var objBrMajorVersion = parseInt(navigator.appVersion,10);
    var objOffsetName,objOffsetVersion,ix;


    // detect

    var iev=0;
    var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    var trident = !!navigator.userAgent.match(/Trident\/7.0/);
    var rv=navigator.userAgent.indexOf("rv:11.0");

    if (ieold) iev=new Number(RegExp.$1);
    if (navigator.appVersion.indexOf("MSIE 10") != -1) iev=10;
    if (trident&&rv!=-1) iev=11;

    if(iev != 0 || (objOffsetVersion=objAgent.indexOf("MSIE"))!=-1){

        _Browser.name = "Microsoft Internet Explorer";
        _Browser.msie = true;
        _Browser.version = iev;

        if(_Browser.version < 7){
            _Browser.ie6 = true;
        }else if(_Browser.version < 8){
            _Browser.ie7 = true;
        }else if(_Browser.version < 9){
            _Browser.ie8 = true;
        }else if(_Browser.version < 10){
            _Browser.ie9 = true;
        }else if(_Browser.version < 11){
            _Browser.ie10 = true;
        }else {
            _Browser.ie11_over = true;
        }
    }else{

        // In Chrome
        if ((objOffsetVersion=objAgent.indexOf("Chrome"))!=-1) {
            _Browser.chrome  = true;
            objbrowserName = "Chrome";
            objfullVersion = objAgent.substring(objOffsetVersion+7);
        }

        // In Firefox
        else if ((objOffsetVersion=objAgent.indexOf("Firefox"))!=-1) {
            _Browser.mozilla = true;
            objbrowserName = "Firefox";
        }

        // In Safari
        else if ((objOffsetVersion=objAgent.indexOf("Safari"))!=-1) {
            _Browser.safari = true;
            objbrowserName = "Safari";
            objfullVersion = objAgent.substring(objOffsetVersion+7);
            if ((objOffsetVersion=objAgent.indexOf("Version"))!=-1)
                objfullVersion = objAgent.substring(objOffsetVersion+8);
        }
        // For other browser "name/version" is at the end of userAgent
        else if ( (objOffsetName=objAgent.lastIndexOf(' ')+1) <
        (objOffsetVersion=objAgent.lastIndexOf('/')) )
        {
            objbrowserName = objAgent.substring(objOffsetName,objOffsetVersion);
            objfullVersion = objAgent.substring(objOffsetVersion+1);
            if (objbrowserName.toLowerCase()==objbrowserName.toUpperCase()) {
                objbrowserName = navigator.appName;
            }
        }
        // trimming the fullVersion string at semicolon/space if present
        if ((ix=objfullVersion.indexOf(";"))!=-1)
            objfullVersion=objfullVersion.substring(0,ix);
        if ((ix=objfullVersion.indexOf(" "))!=-1)
            objfullVersion=objfullVersion.substring(0,ix);

        objBrMajorVersion = parseInt(''+objfullVersion,10);
        if (isNaN(objBrMajorVersion)) {
            objfullVersion  = ''+parseFloat(navigator.appVersion);
            objBrMajorVersion = parseInt(navigator.appVersion,10);
        }

        _Browser.name = objbrowserName;
        _Browser.version = objBrMajorVersion;

    }
    /*
     var logStr = ''

     +'_Browser.name  = '+_Browser.name +'\n'
     +'_Browser.version = '+ _Browser.version +'\n'
     +'_Browser.mozilla = ' + _Browser.mozilla + '\n'
     +'_Browser.safari = ' + _Browser.safari + '\n'
     +'_Browser.chrome = ' + _Browser.chrome + '\n'
     +'_Browser.msie = ' + _Browser.msie + '\n'
     +'------- ? IE -----------------' + '\n'
     +'_Browser.ie6 = ' + _Browser.ie6 + '\n'
     +'_Browser.ie7 = ' + _Browser.ie7 + '\n'
     +'_Browser.ie8 = ' + _Browser.ie8 + '\n'
     +'_Browser.ie9 = ' + _Browser.ie9 + '\n'
     +'_Browser.ie10 = ' + _Browser.ie10 + '\n'
     +'_Browser.ie11_over = ' + _Browser.ie11_over + '\n'

     console.log(logStr);
     */
}

checkDevice();
browserDetect();
