define(['counter', 'modernizr'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            contextMenu,
            ol,
            addButtonElement,
            firstItemColor,
            self = this;

        //helpers
        function getNextColor(){
            firstItemColor = 1 +
                (firstItemColor % self.config.colorPaletteSize);
            return firstItemColor;
        }
        function addButtonClicked(event) {
            event.preventDefault();
            self.addCounter();
        }
        function getClickEvents() {
            var result = [];
            // msPointerEnabled ?
            // @TODO
            if (Modernizr.touchevents) {
                result.push('touchstart');
            }
            result.push('click');
            return result;
        }
        function getPointerDownEvents() {
            var result = [];
            if (Modernizr.touchevents) {
                result.push('touchstart');
            }
            result.push('mousedown');
            return result;
        }
        function getPointerUpEvents() {
            var result = [];
            if (Modernizr.touchevents) {
                result.push('touchend');
            }
            result.push('mouseup');
            return result;
        }

        //config
        self.config = {
            incrementSize: 1,
            bottomLimit: 0,
            topLimit: Number.MAX_VALUE,
            colorPaletteSize: 7,
            clickEvents: getClickEvents(),
            pointerDownEvents: getPointerDownEvents(),
            pointerUpEvents: getPointerUpEvents()
        };


        //methods
        this.init = function (viewportElement, menu) {
            var listElement = viewportElement.querySelector('.counterlist'),
                nodes = viewportElement.querySelectorAll('.counter'),
                n;

            ol = listElement;
            contextMenu = menu;
            addButtonElement = viewportElement.
                                querySelector('.add-counter-button');
            // check localStorage to see if there are cached counters
            // @TBD

            // if yes, them replace the current html with a generated one
            // based on last session's counters
            // @TBD

            // if localStorage is empty,
            // populate the counters based on the initial html
            for (n = nodes.length - 1; n >= 0; n -= 1) {
                self.addCounter(nodes[n]);
            }
            firstItemColor = Number(nodes[n+1].dataset.color);

            // attach listeners for the addCounter button
            addButtonElement.addEventListener('click', addButtonClicked);
        };

        this.getCounterHeight = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getCounterWidth = function () {
            return list[0].getNode().offsetWidth;
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
                domElement.querySelector('.counter__display').
                                            textContent = value.toString();
                domElement.style.left = - (self.getCounterWidth()) + "px";
                ol.classList.add('counterlist--transition');
                setTimeout(function(ol, li){
                    ol.insertBefore(domElement, firstCounter);
                    ol.classList.remove('counterlist--transition');
                    setTimeout(function(li){
                        li.style.left = "0px";
                    },400, li);
                },300, ol, domElement);
            }
            counter = new Counter(domElement, contextMenu, self);
            list.push(counter);
            // domElement.style.top = "0px";
        };

    };
    return CounterSet;
});
