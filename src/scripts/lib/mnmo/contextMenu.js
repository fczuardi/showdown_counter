define(function () {
    'use strict';
    var ContextMenu = function () {

        var menuElement,
            toolbarElement,
            resetButton,
            removeButton,
            pressing,
            selectedCounterIndex = 0,
            counterSet,
            counterList,
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
        this.onLongPress = function(event) {
            var scrollY = getScrollY(),
                counterElement = event.target;

                console.log('open menu!', event);

            // get the li counter
            while (!counterElement.classList.contains('counter') &&
                   (counterElement !== document.body)) {
                counterElement = counterElement.parentNode;
            }
            console.log('selectedCounterIndex', counterElement, counterElement.dataset.index);
            selectedCounterIndex = counterElement.dataset.index;
            menuElement.dataset.color = counterElement.dataset.color;
            menuElement.classList.add('context-menu--active');
            toolbarElement.style.top = (counterElement.offsetTop - scrollY) + 'px';
            event.preventDefault();
            event.stopPropagation();
        };
        function closeMenu() {
            menuElement.classList.remove('context-menu--active');
        }
        function preventClosing(event) {
            event.stopPropagation();
            return false;
        }
        function resetSelectedCounter (event){
            counterList[selectedCounterIndex].reset();
            closeMenu();
        }
        function removeSelectedCounter (event){
            counterSet.removeCounter(selectedCounterIndex);
            closeMenu();

        }
        // capture and disable system's context menu
        document.oncontextmenu = function (event) { // Use document as opposed to window for IE8 compatibility
            console.log('oncontextmenu!');
            self.onLongPress(event);
            // console.log('context menu!', event);
            // event.preventDefault();
            // event.stopPropagation();
            // return false;
        };
        this.setCounterSet = function (cset) {
            counterSet = cset;
            counterList = cset.getList();
        };

        this.init = function (menu) {
            console.log('ContextMenu INIT', menu);
            menuElement = menu;
            toolbarElement = menuElement.querySelector('.context-menu__toolbar');
            resetButton = menuElement.querySelector('.context-menu__reset-button');
            removeButton = menuElement.querySelector('.context-menu__remove-button');
            menuElement.addEventListener('click', closeMenu, false);
            toolbarElement.addEventListener('click', preventClosing, false);
            resetButton.addEventListener('click', resetSelectedCounter, false);
            removeButton.addEventListener('click', removeSelectedCounter, false);
        };

        this.touchStart = function (event) {
            console.log('touchStart', event);
            pressing = window.setTimeout(
                                         self.onLongPress,
                                         longPressTriggerTime,
                                         event
                                        );
        };

        this.touchEnd = function (event) {
            console.log('touchEnd', event);
            clearTimeout(pressing);
        };

        this.hideRemoveButton = function (){
            menuElement.querySelector('.context-menu__remove-button').
                            style.display = 'none';
        };
        this.showRemoveButton = function (){
            menuElement.querySelector('.context-menu__remove-button').
                            style.display = 'block';
        };

    };
    return ContextMenu;
});
