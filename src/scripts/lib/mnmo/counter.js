define(function () {
    'use strict';
    var Counter = function (domElement, parent) {
        var incrementButton = domElement.querySelector('.increment'),
            decrementButton = domElement.querySelector('.decrement'),
            displayElement = domElement.querySelector('.counter__display'),
            value = Number(domElement.dataset.value),
            // color = domElement.dataset.color,
            incrementSize = parent.config.incrementSize,
            bottomLimit = parent.config.bottomLimit,
            topLimit = parent.config.topLimit,
            self = this;

        function increment() {
            self.setValue(value + incrementSize);
        }
        function decrement() {
            self.setValue(value - incrementSize);
        }

        //atach listeners
        incrementButton.addEventListener('click', increment, false);
        decrementButton.addEventListener('click', decrement, false);

        this.setValue = function (v) {
            if ((v <= bottomLimit) || (v >= topLimit)){
                console.log('should vibrate', value, bottomLimit, topLimit);
                window.navigator.vibrate(50);
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
