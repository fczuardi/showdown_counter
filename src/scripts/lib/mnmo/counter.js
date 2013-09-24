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
            swiping = false,
            swipeWidth,
            swipeStartX,
            swipeTrigger = 1 / 3,
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
            self.counterTouchEnd();
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
        function counterDrag (event) {
            if (!swiping) { return false; }
            deltaX = event.clientX - swipeStartX;
            swipeWidth = swipeTrigger * event.target.offsetWidth;
            if (!parent.isPreferredPointerType(event)) { return false; }
            contextMenu.killTimer();
            // contextMenu.touchEnd(event);
            if (Math.abs(deltaX) > swipeWidth) {
                if (deltaX > 0) {
                    biggerIncrement();
                } else {
                    biggerDecrement();
                }
                self.counterTouchEnd();
            }
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
            if (!parent.isPreferredPointerType(event)) { return false; }
            swiping = true;
            swipeStartX = event.clientX;
        };
        this.counterTouchEnd = function () {
            swiping = false;
        };

        //set index
        domElement.dataset.index = index;

        //attach pointerdown events
        domElement.addEventListener(
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
