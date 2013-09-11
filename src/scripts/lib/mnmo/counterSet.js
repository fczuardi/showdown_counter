define(['counter'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //constants
        this.config = {
            incrementSize: 1,
            bottomLimit: 0,
            topLimit: Number.MAX_VALUE
        };

        //private vars
        var list = [],
            counter,
            viewport,
            ol,
            self = this;

        //methods
        this.init = function (viewportElement) {
            var listElement = viewportElement.querySelector('.counterlist'),
                nodes = viewportElement.querySelectorAll('.counter');
            viewport = viewportElement;
            ol = listElement;
            for (var i = nodes.length - 1; i >= 0; i--) {
                add(nodes[i]);
            }
        };

        this.getCounterSize = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getListElement = function () {
            return ol;
        };

        //helpers
        var add = function (domElement) {
            counter = new Counter(domElement, self, list.length);
            list.push(counter);
        };
    };
    return CounterSet;
});
