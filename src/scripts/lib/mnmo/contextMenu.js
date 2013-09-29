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

        function getColorRowAndColumn(event) {
            var clientX = event.clientX,
                clientY = event.clientY,
                originX = colorPicker.offsetLeft + event.target.offsetLeft,
                originY = toolbarElement.offsetTop +
                          colorPicker.offsetTop +
                          event.target.offsetTop,
                pickerHeight = colorPicker.offsetHeight,
                pickerWidth = colorPicker.offsetWidth,
                deltaX = clientX - originX,
                deltaY = clientY - originY,
                column = Math.floor(deltaX / (pickerWidth / 3)),
                row = Math.ceil(deltaY / (pickerHeight / 2)) - 1;
            column = Math.min(Math.max(column, 0), 2);
            row = Math.min(Math.max(row, 0), 1);

            return [column, row];
        }
        function setBackgroundColorFromPallete(palettePosition) {
            var colorIndex = 1 + palettePosition[0] +
                            (palettePosition[1]) * 3;

            if (colorIndex >= Number(hiddenColor)) {
                colorIndex += 1;
            }
            menuElement.dataset.color = colorIndex;
            counterElement.dataset.color = colorIndex;
        }


        function paletteUpdate(event) {
            var gridPosition = getColorRowAndColumn(event);
            setBackgroundColorFromPallete(gridPosition);
        }
        function paletteUpdateStart(event) {
            paletteUpdate(event);
            colorHitArea.addEventListener(
                'pointermove',
                paletteUpdate,
                false
            );
        }
        function paletteUpdateEnd() {
            colorHitArea.removeEventListener(
                'pointermove',
                paletteUpdate,
                false
            );
        }
        function closeMenu(event) {
            if (!counterSet.isPreferredPointerType(event)) { return false; }
            menuElement.classList.remove('context-menu--active');
        }
        function toolbarClicked(event) {
            var clientY = event.clientY;
            if (counterSet.isPreferredPointerType(event) &&
                    event.target === toolbarElement && (
                        (clientY < event.target.offsetTop) ||
                        (clientY > event.target.offsetTop +
                                                event.target.offsetHeight)
                    )) {
                closeMenu(event);
            }
        }
        function toolbarTouchEnd(event) {
            if (!counterSet.isPreferredPointerType(event)) { return false; }
            self.touchEnd(event);
        }
        function resetSelectedCounter(event) {
            if (!counterSet.isPreferredPointerType(event)) { return false; }
            counterList[selectedCounterIndex].reset();
            closeMenu(event);
        }
        this.removeSelectedCounter = function (event) {
            if (!counterSet.isPreferredPointerType(event)) { return false; }
            counterSet.removeCounter(selectedCounterIndex);
            closeMenu(event);
        };
        // capture and disable system's context menu
        // Use document as opposed to window for IE8 compatibility
        document.oncontextmenu = function (event) {
            event.preventDefault();
            return false;
        };

        this.setCounterSet = function (cset) {
            counterSet = cset;
            counterList = cset.getList();

            //attach pointerdown events
            document.body.addEventListener(
                'pointerdown',
                self.touchStart,
                false
            );
            toolbarElement.addEventListener(
                'pointerdown',
                toolbarClicked,
                false
            );
            colorHitArea.addEventListener(
                'pointerdown',
                paletteUpdateStart,
                false
            );
            removeButton.addEventListener(
                'pointerdown',
                self.removeSelectedCounter,
                false
            );
            resetButton.addEventListener(
                'pointerdown',
                resetSelectedCounter,
                false
            );


            //attach pointerup events
            colorHitArea.addEventListener(
                'pointerup',
                paletteUpdateEnd,
                false
            );
            toolbarElement.addEventListener(
                'pointerup',
                toolbarTouchEnd,
                false
            );
            menuElement.addEventListener(
                'pointerup',
                closeMenu,
                false
            );
            document.body.addEventListener(
                'pointerup',
                self.touchEnd,
                false
            );

            //scroll
            window.onscroll = self.killTimer;

        };

        this.init = function (menu) {
            menuElement = menu;
            toolbarElement = menuElement.querySelector(
                '.context-menu__toolbar'
            );
            resetButton = menuElement.querySelector(
                '.context-menu__reset-button'
            );
            removeButton = menuElement.querySelector(
                '.context-menu__remove-button'
            );
            colorPicker = menuElement.querySelector(
                '.context-menu__color-picker'
            );
            colorHitArea = colorPicker.querySelector(
                '.area'
            );

        };
        this.isActive = function () {
            return menuElement.classList.contains('context-menu--active');
        };
        this.getScrollY = function () {
            var y = (window.pageYOffset !== undefined) ? window.pageYOffset :
                    (
                        document.documentElement ||
                        document.body.parentNode ||
                        document.body
                    ).scrollTop;
            return y;
        };
        this.openMenu = function (event) {
            event.stopPropagation();
            var scrollY = self.getScrollY(),
                color;

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
            menuElement.querySelector('.color-' +
                                        hiddenColor).style.display = 'block';
            menuElement.querySelector('.color-' +
                                        color).style.display = 'none';
            hiddenColor = color;

            counterList[selectedCounterIndex].counterTouchEnd();
            //display the menu
            menuElement.classList.add('context-menu--active');

            //move the toolbar to over the selected counter
            toolbarElement.style.top = (counterElement.offsetTop - scrollY) +
                                        'px';

        };

        this.touchStart = function (event) {
            event.stopPropagation();
            counterElement = event.target;
            if (!event.target.classList.contains('counter') &&
                !event.target.classList.contains('counter__display') &&
                event.target.nodeName.toLowerCase() !== 'button')  {
                return false;
            }
            // get the li counter
            while (!counterElement.classList.contains('counter') &&
                    (counterElement !== document.body)) {
                counterElement = counterElement.parentNode;
            }
            selectedCounterIndex = counterElement.dataset.index;
            if (!counterSet.isPreferredPointerType(event)) { return false; }
            if (self.isActive()) {
                return false;
            }
            if (pressing === undefined) {
                pressing = window.setTimeout(
                    self.openMenu,
                    longPressTriggerTime,
                    event
                );
            }
        };

        this.killTimer = function () {
            window.clearTimeout(pressing);
            pressing = undefined;
        };

        this.touchEnd = function (event) {
            event.stopPropagation();
            self.killTimer();
            counterList[selectedCounterIndex].counterTouchEnd();
        };

        this.hideRemoveButton = function () {
            menuElement.querySelector('.context-menu__remove-button').
                            style.display = 'none';
        };
        this.showRemoveButton = function () {
            menuElement.querySelector('.context-menu__remove-button').
                            style.display = 'block';
        };

    };
    return ContextMenu;
});
