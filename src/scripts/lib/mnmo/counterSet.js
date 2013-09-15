define(['counter', 'modernizr'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            contextMenu,
            ol,
            toolbarElement,
            addButtonElement,
            firstItemColor,
            self = this;

        //helpers
        function getNextColor() {
            firstItemColor = 1 +
                (firstItemColor % self.config.colorPaletteSize);
            return firstItemColor;
        }
        function addButtonClicked() {
            self.addCounter();
        }
        function getClickEvents() {
            var result = [];
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
        function getPointerMoveEvents() {
            var result = [];
            if (Modernizr.touchevents) {
                result.push('touchmove');
            }
            result.push('mousemove');
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
            pointerUpEvents: getPointerUpEvents(),
            pointerMoveEvents: getPointerMoveEvents
        };


        //methods
        this.init = function (viewportElement, menu) {
            var listElement = viewportElement.querySelector('.counterlist'),
                nodes = viewportElement.querySelectorAll('.counter'),
                n;

            ol = listElement;
            contextMenu = menu;
            toolbarElement = viewportElement.querySelector('.toolbar');
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
            firstItemColor = Number(nodes[n + 1].dataset.color);

            //debug
            // nodes[0].querySelector('.counter__display').textContent = "12";

            // attach listeners for the addCounter button
            addButtonElement.addEventListener('click', addButtonClicked);

            // register the counterlist on the context menu
            menu.setCounterSet(self);

            // scroll to the first counter
            window.scroll(0, nodes[n + 1].offsetHeight);
        };

        this.getCounterHeight = function () {
            return list[0].getNode().offsetHeight;
        };

        this.getCounterWidth = function () {
            return list[0].getNode().offsetWidth;
        };

        this.getList = function () {
            return list;
        };

        this.getListElement = function () {
            return ol;
        };

        this.addCounter = function (domElement) {
            var firstCounter = ol.querySelector('.counter'),
                value = self.config.bottomLimit;
            if (domElement === undefined) {
                domElement = firstCounter.cloneNode(true);
                domElement.classList.add('counter');
                domElement.dataset.color = getNextColor();
                domElement.dataset.value = self.config.bottomLimit;
                domElement.querySelector('.counter__display').
                                            textContent = value.toString();
                domElement.style.left = -(self.getCounterWidth()) + 'px';
                ol.classList.add('counterlist--transition');
                window.setTimeout(function (ol, li) {
                    ol.insertBefore(domElement, firstCounter);
                    ol.classList.remove('counterlist--transition');
                    window.setTimeout(function (li) {
                        li.style.left = '0px';
                    }, 400, li);
                }, 300, ol, domElement);
            }
            counter = new Counter(domElement, list.length, contextMenu, self);
            list.push(counter);
        };
        this.removeCounter = function (cindex) {
            var li = list[cindex].getNode(),
                remainingCounters = ol.querySelectorAll('.counter').length;

            // when there is only 1 counter, hide the remove button
            if (remainingCounters === 2) {
                contextMenu.hideRemoveButton();
            } else {
                contextMenu.showRemoveButton();
            }

            // remove dom element
            li.parentNode.removeChild(li);

        };

    };
    return CounterSet;
});
