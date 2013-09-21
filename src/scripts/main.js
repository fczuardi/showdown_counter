//Requirejs config
requirejs.config({
    baseUrl: '../js/lib/',
    paths: {
        'domReady': 'requirejs/domReady',
        'modernizr': 'modernizr/modernizr-custom',
        'hand': 'microsoft/handjs/hand-1.1.2',
        'counter': 'mnmo/counter',
        'counterSet': 'mnmo/counterSet',
        'contextMenu': 'mnmo/contextMenu'
    }
});

require(
    [
        'domReady',
        'counterSet',
        'contextMenu'
    ],
    function (domReady, CounterSet, ContextMenu) {
        'use strict';
        var counters = new CounterSet(),
            contextMenu = new ContextMenu(),
            viewportElement,
            contextMenuElement;

        domReady(function () {
            viewportElement = document.querySelector('.listviewport');
            contextMenuElement = document.querySelector('.context-menu');
            contextMenu.init(contextMenuElement);
            counters.init(viewportElement, contextMenu);
        });
    }
);
