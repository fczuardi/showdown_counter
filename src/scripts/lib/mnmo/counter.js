define(function () {
    'use strict';
    var Counter = function (domElement, index, contextMenu, parent) {
        var incrementButton = domElement.querySelector('.increment'),
            decrementButton = domElement.querySelector('.decrement'),
            displayElement = domElement.querySelector('.counter__display'),
            value = Number(domElement.dataset.value),
            // color = domElement.dataset.color,
            incrementSize = parent.config.incrementSize,
            bottomLimit = parent.config.bottomLimit,
            topLimit = parent.config.topLimit,
            pointerDown = parent.config.pointerDownEvents,
            pointerUp = parent.config.pointerUpEvents,
            click = parent.config.clickEvents,
            eventName,
            c,
            d,
            u,
            self = this;

        function removeRemainingClickEvents(event, fn) {
            for (c = click.length - 1; c >= 0; c -= 1) {
                if (click[c] !== event.type) {
                    event.target.removeEventListener(click[c], fn);
                }
            }
        }
        this.increment = function (event) {
            // removeRemainingClickEvents(event, self.increment);
            self.setValue(value + incrementSize);
            event.preventDefault();
        };
        this.decrement = function (event) {
            // removeRemainingClickEvents(event, self.decrement);
            self.setValue(value - incrementSize);
            event.preventDefault();
        };

        //set index
        domElement.dataset.index = index;

        //atach listeners

        //attach click events
            incrementButton.addEventListener(
                'touchstart',
                self.increment,
                false
            );
            decrementButton.addEventListener(
                'touchstart',
                self.decrement,
                false
            );
        //attach pointerdown events
            domElement.addEventListener(
                'touchstart',
                contextMenu.touchStart,
                false
            );
        //attach pointerup events
            domElement.addEventListener(
                'touchend',
                contextMenu.touchEnd,
                false
            );


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
