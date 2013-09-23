define(function () {
    'use strict';
    var Counter = function (domElement, index, contextMenu, parent) {
        var incrementButton = domElement.querySelector('.increment'),
            decrementButton = domElement.querySelector('.decrement'),
            displayElement = domElement.querySelector('.counter__display'),
            value = Number(domElement.dataset.value),
            incrementSize = parent.config.incrementSize,
            bottomLimit = parent.config.bottomLimit,
            topLimit = parent.config.topLimit,
            self = this;

        function increment(event) {
            if (!parent.isPreferredPointerType(event)) { return false; }
            self.setValue(value + incrementSize);
        }
        function decrement(event) {
            if (!parent.isPreferredPointerType(event)) { return false; }
            self.setValue(value - incrementSize);
        }
        function buttonUp(event) {
            if (contextMenu.isActive() ||
                self.isOutOfBounds(event)) {
                return false;
            }
            if (event.target === incrementButton) {
                increment(event);
            } else if (event.target === decrementButton){
                decrement(event);
            }
            contextMenu.touchEnd(event);
        }
        this.isOutOfBounds = function (event) {
            return  (
                (event.clientY <
                domElement.offsetTop - contextMenu.getScrollY() ) ||
                (event.clientY >
                domElement.offsetTop + domElement.offsetHeight -
                contextMenu.getScrollY())
            );
        };
        this.counterDrag = function(event) {
            contextMenu.touchEnd(event);
            if (self.isOutOfBounds(event)){
                self.counterTouchEnd(event);
            }
        };
        this.counterTouchStart = function(event) {
            event.target.addEventListener(
                'pointermove',
                self.counterDrag,
                false
            );
        };
        this.counterTouchEnd = function(event) {
            event.target.removeEventListener(
                'pointermove',
                self.counterDrag,
                false
            );
        };

        //set index
        domElement.dataset.index = index;

        //attach pointerdown events
        domElement.addEventListener(
            'pointerdown',
            self.counterTouchStart,
            false
        );
        // incrementButton.addEventListener('pointerdown', increment, false);
        // decrementButton.addEventListener('pointerdown', decrement, false);

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
