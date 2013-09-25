define(function () {
    'use strict';
    var Counter = function (domElement, index, contextMenu, parent) {
        var incrementButton = domElement.querySelector('.increment'),
            decrementButton = domElement.querySelector('.decrement'),
            displayElement = domElement.querySelector('.counter__display'),
            value = Number(domElement.dataset.value),
            incrementSize = parent.config.incrementSize,
            bigIncrementSize = parent.config.bigIncrementSize,
            bottomLimit = parent.config.bottomLimit,
            topLimit = parent.config.topLimit,
            deltaX,
            deltaY,
            swiping = false,
            swipeWidth,
            swipeStartX,
            swipeStartY,
            swipeTrigger = 1 / 4,
            self = this;

        function increment(event) {
            if (!parent.isPreferredPointerType(event)) { return false; }
            self.setValue(value + incrementSize);
        }
        function decrement(event) {
            if (!parent.isPreferredPointerType(event)) { return false; }
            self.setValue(value - incrementSize);
        }
        function biggerIncrement() {
            self.setValue(value + bigIncrementSize);
        }
        function biggerDecrement() {
            self.setValue(value - bigIncrementSize);
        }
        function buttonUp(event) {
            if (contextMenu.isActive() ||
                    self.isOutOfBounds(event) ||
                    (Math.abs(deltaX) > swipeWidth)
                    ) {
                deltaX = 0;
                return false;
            }
            if (event.target === incrementButton) {
                increment(event);
            } else if (event.target === decrementButton) {
                decrement(event);
            }
            contextMenu.touchEnd(event);
        }
        function counterDrag(event) {
            deltaX = event.clientX - swipeStartX;
            deltaY = event.clientY - swipeStartY;
            if ((!swiping) ||
                    (Math.abs(deltaX) - Math.abs(deltaY) < 2)
                    ) {
                return false;
            }
            event.preventDefault();
            contextMenu.killTimer();
            swipeWidth = swipeTrigger * domElement.offsetWidth;
            domElement.classList.add('counter--swiping');
            domElement.style.left = Math.min(swipeWidth,
                                        Math.max(-swipeWidth, deltaX)) + 'px';
        }
        this.isOutOfBounds = function (event) {
            return (
                (event.clientY <
                domElement.offsetTop - contextMenu.getScrollY()) ||
                (event.clientY >
                        domElement.offsetTop + domElement.offsetHeight -
                        contextMenu.getScrollY())
            );
        };
        this.counterTouchStart = function (event) {
            swiping = true;
            swipeStartX = event.clientX;
            swipeStartY = event.clientY;
        };
        this.counterTouchEnd = function () {
            if (!swiping) { return false; }
            swiping = false;
            domElement.classList.remove('counter--swiping');
            swipeWidth = swipeTrigger * domElement.offsetWidth;

            if (Math.abs(domElement.offsetLeft) >= swipeWidth) {
                if (domElement.offsetLeft > 0) {
                    biggerIncrement();
                } else {
                    biggerDecrement();
                }
            }
            domElement.style.left = '0px';
        };

        //set index
        domElement.dataset.index = index;

        //attach pointerdown events
        domElement.addEventListener(
            'pointerdown',
            self.counterTouchStart,
            false
        );
        incrementButton.addEventListener(
            'pointerdown',
            self.counterTouchStart,
            false
        );
        decrementButton.addEventListener(
            'pointerdown',
            self.counterTouchStart,
            false
        );

        //attach pointermove events
        domElement.addEventListener('pointermove', counterDrag, false);

        //attach pointerup events
        incrementButton.addEventListener('pointerup', buttonUp, false);
        decrementButton.addEventListener('pointerup', buttonUp, false);
        domElement.addEventListener(
            'pointerup',
            self.counterTouchEnd,
            false
        );

        this.reset = function () {
            self.setValue(bottomLimit);
        };

        this.setValue = function (v) {
            if ((v <= bottomLimit) || (v >= topLimit)) {
                if (Modernizr.vibrate) {
                    window.navigator.vibrate(50);
                } else if (window.navigator &&
                           window.navigator.notification &&
                           window.navigator.notification.vibrate) {
                    window.navigator.notification.vibrate(50);
                }
            }
            value = Math.min(Math.max(v, bottomLimit), topLimit);
            domElement.dataset.value = value;
            displayElement.textContent = value;
        };
        this.getNode = function () {
            return domElement;
        };

    };
    return Counter;
});
