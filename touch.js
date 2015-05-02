/*
 author:Cheemi 
 blog url:http://cheemi.com
 */
(function () {

    var TOUCHSTART, TOUCHEND, TOUCHMOVE;

    //normal touch events
    if (typeof (window.ontouchstart) != 'undefined') {

        TOUCHSTART = 'touchstart';
        TOUCHEND = 'touchend';
        TOUCHMOVE = 'touchmove';
    }  //microsoft touch events
    else if (typeof (window.onmspointerdown) != 'undefined') {
        TOUCHSTART = 'MSPointerDown';
        TOUCHEND = 'MSPointerUp';
    } else {
        TOUCHSTART = 'mousedown';
        TOUCHEND = 'mouseup';
    }

    function NodeFacade(node) {

        this._node = node;

    }

    NodeFacade.prototype.getDomNode = function () {
        return this._node;
    }

    NodeFacade.prototype.on = function (evt, callback, scope) {

        var scopeObj;

        if (!scope) {
            scopeObj = this._node;
        } else {
            scopeObj = scope;
        }
        evt = evt.toLowerCase();

        //滑动范围在5x5内则做点击处理，s是开始，e是结束
        var init = { x: 5, y: 5, sx: 0, sy: 0, ex: 0, ey: 0 };
        var sTime = 0, eTime = 0;

        if (evt === 'tap' || evt === 'tapstart' || evt === 'tapend') {
            this._node.addEventListener(TOUCHSTART, function (e) {
                if (TOUCHSTART === 'touchstart') {
                    sTime = new Date().getTime();
                    init.sx = e.targetTouches[0].pageX;
                    init.sy = e.targetTouches[0].pageY;
                    init.ex = init.sx;
                    init.ey = init.sy;
                }
                if (evt === 'tapstart') {
                    callback.apply(scope, arguments);
                }
            });
            this._node.addEventListener(TOUCHMOVE, function (e) {
                if (TOUCHMOVE === 'touchmove') {
                    init.ex = e.targetTouches[0].pageX;
                    init.ey = e.targetTouches[0].pageY;
                }
            }, false);
            this._node.addEventListener(TOUCHEND, function (e) {
                if (TOUCHEND === 'touchend') {
                    var changeX = init.sx - init.ex;
                    var changeY = init.sy - init.ey;
                    if (Math.abs(changeX) > Math.abs(changeY) && Math.abs(changeY) > init.y) {
                        //左右事件
                        if (changeX > 0) {
                            if (evt === 'left') callback.apply(scope, arguments);
                        } else {
                            if (evt === 'right') callback.apply(scope, arguments);
                        }
                    }
                    else if (Math.abs(changeY) > Math.abs(changeX) && Math.abs(changeX) > init.x) {
                        //上下事件
                        if (changeY > 0) {
                            if (evt === 'top') callback.apply(scope, arguments);
                        } else {
                            if (evt === 'down') callback.apply(scope, arguments);
                        }
                    }
                    else if (Math.abs(changeX) < init.x && Math.abs(changeY) < init.y) {
                        eTime = new Date().getTime();
                        //点击事件，此处根据时间差细分下

                        if ((eTime - sTime) > 300) {
                            if (evt === 'press') {
                                callback.apply(scope, arguments); //长按
                            }
                        }
                        else {
                            if (evt === 'tap') callback.apply(scope, arguments); //当点击处理
                        }
                    }
                }
                if (evt === 'tapend') callback.apply(scope, arguments);
            }, false);
        } else {
            this._node.addEventListener(evt, function (e) {
                callback.apply(scope, arguments);
            }, false);
        }
        return this;

    }

    window.$ = function (selector) {

        var node = document.querySelector(selector);

        if (node) {
            return new NodeFacade(node);
        } else {
            return null;
        }
    }


})();