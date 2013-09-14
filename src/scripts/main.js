//Requirejs config
requirejs.config({
    baseUrl: '../js/lib/',
    paths: {
        'domReady': 'requirejs/domReady',
        'counter': 'mnmo/counter',
        'counterSet': 'mnmo/counterSet',
        'behavior': 'mnmo/behavior'
    }
});

require(
    [
        'domReady',
        'counterSet',
        'behavior'
    ],
    function (domReady, CounterSet, Behavior) {
        'use strict';
        var counters = new CounterSet(),
            behavior = new Behavior(),
            viewportElement;

        domReady(function () {
            viewportElement = document.querySelector('.listviewport');
            counters.init(viewportElement);
        });
    }
);
