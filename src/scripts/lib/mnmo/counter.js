define(function () {
    'use strict';
    var Counter = function (domElement, index, contextMenu, parent) {
        var incrementButton = domElement.querySelector('.increment'),
            decrementButton = domElement.querySelector('.decrement'),
            displayElement = domElement.querySelector('.counter__display'),
            value = Number(domElement.dataset.value),
            bottomLimit = parent.config.bottomLimit,
            topLimit = parent.config.topLimit,
            self = this;

        this.increment = function (incrementSize) {
            self.setValue(value + incrementSize);
        };
        this.decrement = function (decrementSize) {
            self.setValue(value - decrementSize);
        };

        //set index
        domElement.dataset.index = index;
        incrementButton.dataset.counterIndex = index;
        decrementButton.dataset.counterIndex = index;

        //atach listeners

        //attach pointerdown events
        // for (d = pointerDown.length - 1; d >= 0; d -= 1) {
        //     eventName = pointerDown[d];
        //     incrementButton.addEventListener(
        //         eventName,
        //         self.increment,
        //         false
        //     );
        //     decrementButton.addEventListener(
        //         eventName,
        //         self.decrement,
        //         false
        //     );
        //     domElement.addEventListener(
        //         eventName,
        //         contextMenu.touchStart,
        //         false
        //     );
        // }
        //attach pointerup events
        // for (u = pointerUp.length - 1; u >= 0; u -= 1) {
        //     eventName = pointerUp[u];
        //     domElement.addEventListener(
        //         eventName,
        //         contextMenu.touchEnd,
        //         false
        //     );
        // }

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
