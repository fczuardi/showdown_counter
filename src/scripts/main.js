//Requirejs config
requirejs.config({
    baseUrl: '../js/lib/',
    paths: {
        'domReady': 'require/domReady',
        'counter': 'mnmo/counter',
        'counterSet': 'mnmo/counterSet'
    }
});

require(
    [
        'domReady',
        'counterSet'
    ],
    function (domReady, CounterSet) {
    'use strict';
    var counters = new CounterSet(),
        nodes,
        node;

    domReady(function(){
        nodes = document.querySelectorAll('.counter');
        for (var i = nodes.length - 1; i >= 0; i--) {
            node = nodes[i];
            counters.add(node);
        }
    });

});
