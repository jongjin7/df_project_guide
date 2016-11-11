var App = new (Backbone.Router.extend({
    Models: {},
    Collections: {},
    Views: {},

    initialize: function() {
        // init
    },

    start: function (options) {
        this.GlobalVars.currentDevice = _Device.type;
        this.GlobalVars.currentOS = _Device.os;
        this.GlobalVars.isMSIE = _Browser.msie;
        this.GlobalVars.isSafari = _Browser.safari;
        this.GlobalVars.isDebugMode = (/^127|^192|localhost/).test(document.location.hostname);

        if(this.GlobalVars.isMSIE){
            $('.browser-upgrade').removeClass('hide');
            $('body').css('overflow', 'hidden');
        }

        this.makeView();

    },

    /////////////////////////////////////////////
    //	뷰 생성하기
    /////////////////////////////////////////////
    makeView : function(){

        //this.appView = new App.Views.AppView();
        //this.appView.render();

    },

    /////////////////////////////////////////////
    //	모델 생성하기
    /////////////////////////////////////////////
    makeModel : function(){
        this.appModel = new App.Models.AppModel();
    },

    /////////////////////////////////////////////
    //	콜렉션 생성하기
    /////////////////////////////////////////////
    makeCollection : function(){
        this.mainCollection = new App.Collections.MainCollection();
    },




    /////////////////////////////////////////////
    //	글로벌 변수
    /////////////////////////////////////////////
    GlobalVars : {
        isDebugMode : true,

        /* 디바이스 종류 */
        currentDevice : -1,
        DEVICE_TYPE_WEB : 0,
        DEVICE_TYPE_TABLET : 1,
        DEVICE_TYPE_MOBILE : 2,

        /* OS 종류 */
        currentOS : -1,
        OS_TYPE_ANDROID : 0,
        OS_TYPE_IOS : 1,
        OS_TYPE_ETC : 2,

        OS_VER : 0,

        isLowIE : false,
        isIE8 : false,
        isIE9 : false,
        isMSIE : false,

        /* window size */
        windowWidth : 0,
        windowHeight : 0,
        windowInnerWidth : 0,
        windowInnerHeight : 0,

        WIN_MIN_WIDTH : 1024,

        /* server url */
        GET_MAIN_DATA_URL : "/json/main_data.html",

        /* debug mode url */
        DEBUG_GET_MAIN_DATA_URL : "/kr/json/main_data.html",

        /* index one depth */
        INDEX_0_MAIN : 0,


        /* index two depth*/


        FIXED_MENU_HEIGHT : 63,
        FIXED_MENU_TWO_HEIGHT : 39,


        /* index sns */
        SNS_0_FB : 0,
        SNS_1_TW : 1,
        SNS_2_GP : 2,
        SNS_3_PR : 3,

        isWheelLock : true
    },


    /////////////////////////////////////////////
    //	이벤트
    /////////////////////////////////////////////
    Events: {
        RESIZE_BROWSER : "resizebrowser",
        RESIZE_COMPLETE : "resizecomplete",
        SCROLL_MOVE : "scrollmove",
        GOTO_PAGE : "gotopage",
        CHANGE_PAGE : "changepage",
        PAGE_SHOW : "pageshow",
        PAGE_SHOW_COMPLETE : "pageshowcomplete",
        PAGE_HIDE : "pagehide",
        PAGE_HIDE_COMPLETE : "pagehidecomplete",
        LOAD_COMPLETE : "loadcomplete",
        LOAD_PROGRESS : "loadprogress",
        MOUSE_WHEEL : "mousewheel"
    },

    /////////////////////////////////////////////
    //	get HTML
    /////////////////////////////////////////////
    getHTML : function(url, data, callback){
        $.ajax({
            url : url,
            data : data,
            dataType: "html",
            error : function(e){
                console.log('get HTML error');
            },
            success : function(json){
                callback(json);
            }
        });
    },

    /////////////////////////////////////////////
    //	서버 통신
    /////////////////////////////////////////////
    getJsonData : function(url, data, callback){
        $.ajax({
            url : url,
            data : data,
            dataType: "json",
            error : function(e){
                console.error('json parse error');
            },
            success : function(json){
                callback(json);
            }
        });
    }
}))();
