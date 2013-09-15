define(function () {
    'use strict';
    var ContextMenu = function () {

        var menuElement,
            counterElement,
            toolbarElement,
            colorPicker,
            colorHitArea,
            resetButton,
            removeButton,
            pressing,
            selectedCounterIndex = 0,
            counterSet,
            counterList,
            longPressTriggerTime = 1000, //miliseconds
            hiddenColor = 1,
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

        function getColorRowAndColumn(event){
            var originX =   colorPicker.offsetLeft +event.target.offsetLeft,
                originY =   toolbarElement.offsetTop +
                            colorPicker.offsetTop +
                            event.target.offsetTop,
                pickerHeight = colorPicker.offsetHeight,
                pickerWidth = colorPicker.offsetWidth,
                deltaX = event.touches[0].clientX - originX,
                deltaY = event.touches[0].clientY - originY,
                column = Math.floor(deltaX / (pickerWidth / 3)),
                row = Math.ceil(deltaY / (pickerHeight / 2)) - 1;
                column = Math.min(Math.max(column, 0), 2);
                row = Math.min(Math.max(row, 0), 1);

            return [column, row];
        }
        function setBackgroundColorFromPallete(palettePosition){
            var colorIndex = 1 + palettePosition[0] +
                            (palettePosition[1]) * 3;

            if (colorIndex >= Number(hiddenColor) ){
                colorIndex += 1;
            }
            menuElement.dataset.color = colorIndex;
            counterElement.dataset.color = colorIndex;
        }

        this.openMenu = function(event) {
            var scrollY = getScrollY(),
                color;
            event.preventDefault();
            event.stopPropagation();
            self.killTimer();

            counterElement = event.target;
            // get the li counter
            while (!counterElement.classList.contains('counter') &&
                   (counterElement !== document.body)) {
                counterElement = counterElement.parentNode;
            }

            // based on the selected item's color, change the background
            // and hide the current color from the pallete
            color = counterElement.dataset.color;
            menuElement.dataset.color = color;
            menuElement.querySelector('.color-' + hiddenColor).style.display = "block";
            menuElement.querySelector('.color-' + color).style.display = "none";
            hiddenColor = color;

            selectedCounterIndex = counterElement.dataset.index;

            //display the menu
            menuElement.classList.add('context-menu--active');

            //move the toolbar to over the selected counter
            toolbarElement.style.top = (counterElement.offsetTop - scrollY) + 'px';

        };
        function paletteUpdate(event) {
            event.preventDefault();
            event.stopPropagation();
            var gridPosition = getColorRowAndColumn(event);
            setBackgroundColorFromPallete(gridPosition);
        }
        function closeMenu() {
            menuElement.classList.remove('context-menu--active');
        }
        function toolbarClicked(event) {
            if ((event.touches[0].clientY < event.target.offsetTop) ||
                (event.touches[0].clientY > event.target.offsetTop + event.target.offsetHeight)) {
                closeMenu();
            }
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
            event.preventDefault();
            return false;
        };
        this.setCounterSet = function (cset) {
            counterSet = cset;
            counterList = cset.getList();
        };

        this.init = function (menu) {
            menuElement = menu;
            toolbarElement = menuElement.querySelector('.context-menu__toolbar');
            resetButton = menuElement.querySelector('.context-menu__reset-button');
            removeButton = menuElement.querySelector('.context-menu__remove-button');
            colorPicker = menuElement.querySelector('.context-menu__color-picker');
            colorHitArea = colorPicker.querySelector('.area');
            menuElement.addEventListener('touchstart', closeMenu, false);

            toolbarElement.addEventListener('touchstart', toolbarClicked, false);

            resetButton.addEventListener('touchstart', resetSelectedCounter, false);
            removeButton.addEventListener('touchstart', removeSelectedCounter, false);

            colorHitArea.addEventListener('touchstart', paletteUpdate, false);
            colorHitArea.addEventListener('touchmove', paletteUpdate, false);
            colorHitArea.addEventListener('touchend', paletteUpdate, false);
        };

        this.touchStart = function (event) {
            // event.preventDefault();
            if (menuElement.classList.contains('context-menu--active')){
                return false;
            }
            pressing = window.setTimeout(
                                         self.openMenu,
                                         longPressTriggerTime,
                                         event
                                        );
        };

        this.killTimer = function () {
            clearTimeout(pressing);
        };
        this.touchEnd = function (event) {
            event.preventDefault();
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
