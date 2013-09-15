define(function () {
    'use strict';
    var Counter = function (domElement, contextMenu, parent) {
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

        this.increment = function (event) {
            removeRemainingClickEvents(event, self.increment);
            self.setValue(value + incrementSize);
        };
        this.decrement = function (event) {
            removeRemainingClickEvents(event, self.decrement);
            self.setValue(value - incrementSize);
        };
        function removeRemainingClickEvents(event, fn) {
            for (c = click.length - 1; c >= 0; c--) {
                if (click[c] != event.type){
                    event.target.removeEventListener(click[c], fn);
                }
            }
        }

        //atach listeners

        //attach click events
        for (c = click.length - 1; c >= 0; c--) {
            eventName = click[c];
            incrementButton.addEventListener(eventName, self.increment, false);
            decrementButton.addEventListener(eventName, self.decrement, false);
        }
        for (d = pointerDown.length - 1; d >= 0; d--) {
            eventName = pointerDown[d];
            domElement.addEventListener(eventName, contextMenu.touchStart, false);
        }
        //attach pointerup events
        for (u = pointerUp.length - 1; u >= 0; u--) {
            eventName = pointerUp[u];
            domElement.addEventListener(eventName, contextMenu.touchEnd, false);
        }


        this.setValue = function (v) {
            if ((v <= bottomLimit) || (v >= topLimit)){
                if (Modernizr.vibrate){
                    window.navigator.vibrate(50);
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
