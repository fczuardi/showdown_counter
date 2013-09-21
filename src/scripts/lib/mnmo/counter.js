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
            lastEvent,
            self = this;

        function increment(event) {
            if (!parent.isPreferredPointerType(event)){ return false; }
            lastEvent = event;
            self.setValue(value + incrementSize);
        }
        function decrement(event) {
            if (!parent.isPreferredPointerType(event)){ return false; }
            self.setValue(value - incrementSize);
        }
        function buttonUp(event) {
            contextMenu.touchEnd(event);
        }

        //set index
        domElement.dataset.index = index;

        //attach pointerdown events
        incrementButton.addEventListener('pointerdown', increment, false);
        decrementButton.addEventListener('pointerdown', decrement, false);

        //attach pointerup events
        incrementButton.addEventListener('pointerup', buttonUp, false);
        decrementButton.addEventListener('pointerup', buttonUp, false);


        this.reset = function () {
            self.setValue(bottomLimit);
        };

        this.setValue = function (v) {
            if ((v <= bottomLimit) || (v >= topLimit)) {
                if (Modernizr.vibrate) {
                    window.navigator.vibrate(50);
                } else if (navigator &&
                           navigator.notification &&
                           navigator.notification.vibrate) {
                    navigator.notification.vibrate(50);
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
