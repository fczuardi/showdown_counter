//Requirejs config
requirejs.config({
    baseUrl: '../js/lib/',
    paths: {
        'domReady': 'requirejs/domReady',
        'modernizr': 'modernizr/modernizr-custom',
        'cordova': 'cordova/cordova-2.8',
        'counter': 'mnmo/counter',
        'counterSet': 'mnmo/counterSet',
        'contextMenu': 'mnmo/contextMenu'
    }
});

require(
    [
        'domReady',
        'counterSet',
        'contextMenu',
        'cordova'
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
            alert('dom ready');
        });

        document.addEventListener("deviceready", function() {
            alert('device ready');
        }, false);



    }
);
