define(function () {
    'use strict';
    var ContextMenu = function () {

        this.init = function (menuElement) {
            console.log('ContextMenu INIT', menuElement);
        };

        this.touchStart = function (event) {
            console.log('touchStart', event);
        };

        this.touchEnd = function (event) {
            console.log('touchEnd', event);
        };
// var pressTimer

// $("a").mouseup(function(){
//   clearTimeout(pressTimer)
//   // Clear timeout
//   return false;
// }).mousedown(function(){
//   // Set timeout
//   pressTimer = window.setTimeout(function() { ... your code ...},1000)
//   return false;
// });


    };
    return ContextMenu;
});
