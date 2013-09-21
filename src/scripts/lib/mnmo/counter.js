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
            if (!parent.isPreferredPointerType(event)){ return false; }
            self.setValue(value + incrementSize);
        }
        function decrement(event) {
            if (!parent.isPreferredPointerType(event)){ return false; }
            self.setValue(value - incrementSize);
        }

        //set index
        domElement.dataset.index = index;

        //atach listeners

        //attach pointerdown events
        incrementButton.addEventListener('pointerdown', increment, false);
        decrementButton.addEventListener('pointerdown', decrement, false);

        // for (d = pointerDown.length - 1; d >= 0; d -= 1) {
        //     eventName = pointerDown[d];
        //     domElement.addEventListener(
        //         eventName,
        //         contextMenu.touchStart,
        //         false
        //     );
        // }
        //attach pointerup events
//         for (u = pointerUp.length - 1; u >= 0; u -= 1) {
//             eventName = pointerUp[u];
//             domElement.addEventListener(
//                 eventName,
//                 contextMenu.touchEnd,
//                 false
//             );
//         }
// console.log(pointerUp[0], pointerDown[0], click[0], click[0]);

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
