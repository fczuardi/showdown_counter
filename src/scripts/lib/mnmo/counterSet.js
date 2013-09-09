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
            counter;

        //methods
        this.add = function (domElement) {
            counter = new Counter(domElement, this, list.length);
            list.push(counter);
        };
    };
    return CounterSet;
});
