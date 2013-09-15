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
            preferredEventType = {},
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
            if (preferredEventType.increment === undefined){
                preferredEventType.increment = event.type;
            }
            if (event.type !== preferredEventType.increment){
                return false;
            }
            self.setValue(value + incrementSize);
            event.stopPropagation();
        };
        this.decrement = function (event) {
            if (preferredEventType.decrement === undefined){
                preferredEventType.decrement = event.type;
            }
            if (event.type !== preferredEventType.decrement){
                return false;
            }
            self.setValue(value - incrementSize);
        };

        //set index
        domElement.dataset.index = index;

        //atach listeners

        //attach click events
        //attach pointerdown events
        for (d = pointerDown.length - 1; d >= 0; d -= 1) {
            eventName = pointerDown[d];
            incrementButton.addEventListener(
                eventName,
                self.increment,
                false
            );
            decrementButton.addEventListener(
                eventName,
                self.decrement,
                false
            );
            domElement.addEventListener(
                eventName,
                contextMenu.touchStart,
                false
            );
        }
        //attach pointerup events
        for (u = pointerUp.length - 1; u >= 0; u -= 1) {
            eventName = pointerUp[u];
            domElement.addEventListener(
                eventName,
                contextMenu.touchEnd,
                false
            );
        }
console.log(pointerUp[0], pointerDown[0], click[0], click[0]);

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
