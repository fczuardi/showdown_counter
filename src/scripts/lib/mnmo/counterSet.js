define(['counter'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            ol,
            self = this;

        //helpers
        function add(domElement) {
            // counter = new Counter(domElement, self, list.length);
            counter = new Counter(domElement, self);
            list.push(counter);
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
                add(nodes[n]);
            }
        };

        this.getCounterSize = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getListElement = function () {
            return ol;
        };

    };
    return CounterSet;
});
