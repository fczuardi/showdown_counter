define(function () {
    'use strict';
    var ContextMenu = function () {

        var menuElement,
            toolbarElement,
            pressing,
            longPressTriggerTime = 1000, //miliseconds
            self = this;

        function getScrollY() {
            var y = ( window.pageYOffset !== undefined) ? window.pageYOffset :
                    (
                        document.documentElement ||
                        document.body.parentNode ||
                        document.body
                    ).scrollTop;
            return y;
        }
        function onLongPress(event) {
            var scrollY = getScrollY(),
                counterElement = event.target;
            // get the li counter
            while (!counterElement.classList.contains('counter') &&
                   (counterElement !== document.body)) {
                counterElement = counterElement.parentNode;
            }

            menuElement.dataset.color = counterElement.dataset.color;
            menuElement.classList.add('context-menu--active');
            toolbarElement.style.top = (counterElement.offsetTop - scrollY) + 'px';
            event.preventDefault();
            event.stopPropagation();
        }
        function closeMenu() {
            menuElement.classList.remove('context-menu--active');
        }
        function preventClosing(event) {
            event.stopPropagation();
            return false;
        }

        // capture and disable system's context menu
        document.oncontextmenu = function (event) { // Use document as opposed to window for IE8 compatibility
            // console.log('context menu!', event);
            // event.preventDefault();
            // event.stopPropagation();
            // return false;
        };
        this.init = function (menu) {
            console.log('ContextMenu INIT', menu);
            menuElement = menu;
            toolbarElement = menuElement.querySelector('.context-menu__toolbar');
            menuElement.addEventListener('click', closeMenu, false);
            toolbarElement.addEventListener('click', preventClosing, false);
        };

        this.touchStart = function (event) {
            console.log('touchStart', event);
            pressing = window.setTimeout(
                                         onLongPress,
                                         longPressTriggerTime,
                                         event
                                        );
        };

        this.touchEnd = function (event) {
            console.log('touchEnd', event);
            clearTimeout(pressing);
        };


    };
    return ContextMenu;
});
