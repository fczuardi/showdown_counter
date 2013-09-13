define(['counter'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            ol,
            firstItemColor,
            self = this;

        //helpers
        function getNextColor(){
            firstItemColor = 1 +
                (firstItemColor % self.config.colorPaletteSize);
            return firstItemColor;
        }

        //config
        self.config = {
            incrementSize: 1,
            bottomLimit: 0,
            topLimit: Number.MAX_VALUE,
            colorPaletteSize: 7
        };


        //methods
        this.init = function (viewportElement) {
            var listElement = viewportElement.querySelector('.counterlist'),
                nodes = viewportElement.querySelectorAll('.counter'),
                n;
            ol = listElement;
            for (n = nodes.length - 1; n >= 0; n -= 1) {
                self.addCounter(nodes[n]);
            }
            firstItemColor = Number(nodes[n+1].dataset.color);
        };

        this.getCounterSize = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getListElement = function () {
            return ol;
        };

        this.addCounter = function (domElement) {
            var firstCounter = ol.querySelector('.counter'),
                value = self.config.bottomLimit;
            if (typeof domElement === 'undefined'){
                domElement = firstCounter.cloneNode(true);
                domElement.classList.add('counter');
                domElement.dataset.color = getNextColor();
                domElement.dataset.value = self.config.bottomLimit;
                domElement.querySelector('.counter__display').textContent = value.toString();
                ol.insertBefore(domElement, firstCounter);
            }
            counter = new Counter(domElement, self);
            list.push(counter);
        };

    };
    return CounterSet;
});
