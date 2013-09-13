define(['counter'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            ol,
            self = this;

        //helpers
        function getNextColor(){
            return Math.round(Math.random()*7);
        }

        //config
        this.config = {
            incrementSize: 1,
            bottomLimit: 0,
            topLimit: Number.MAX_VALUE
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
        };

        this.getCounterSize = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getListElement = function () {
            return ol;
        };

        this.addCounter = function (domElement) {
            var firstCounter = ol.querySelector('.counter');
            if (typeof domElement === 'undefined'){
                domElement = firstCounter.cloneNode(true);
                console.log(domElement, firstCounter);
                domElement.classList.add('counter');
                domElement.dataset.color = getNextColor();
                console.log(ol, domElement, firstCounter);
                ol.insertBefore(domElement, firstCounter);
            }
            counter = new Counter(domElement, self);
            list.push(counter);
            console.log('addCounter', list);
        };

    };
    return CounterSet;
});
