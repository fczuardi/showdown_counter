define(['counter', 'hand', 'modernizr'], function (Counter) {
    'use strict';
    var CounterSet = function () {
        //private vars
        var list = [],
            counter,
            contextMenu,
            ol,
            addButtonElement,
            firstItemColor,
            preferredPointerType,
            self = this;

        //helpers
        function getNextColor() {
            firstItemColor = 1 +
                (firstItemColor % self.config.colorPaletteSize);
            return firstItemColor;
        }

        function addButtonClicked(event) {
            if (!self.isPreferredPointerType(event)) { return false; }
            self.addCounter();
        }

        //config
        self.config = {
            incrementSize: 1,
            bigIncrementSize: 5,
            bottomLimit: 0,
            topLimit: Number.MAX_VALUE,
            colorPaletteSize: 7
        };


        //methods
        this.isPreferredPointerType = function (event) {
            // first pointer interaction will defined the preferred pointer
            // type for the rest of the session
            if (preferredPointerType === undefined) {
                preferredPointerType = event.pointerType;
            }
            return (event.pointerType === preferredPointerType);
        };

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
            firstItemColor = Number(nodes[n + 1].dataset.color);

            //debug
            // nodes[0].querySelector('.counter__display').textContent = "2";

            // attach listeners for the addCounter button
            addButtonElement.addEventListener(
                'pointerdown',
                addButtonClicked,
                false
            );


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
            contextMenu.showRemoveButton();

        };
        this.removeCounter = function (cindex) {
            var li = list[cindex].getNode(),
                remainingCounters = ol.querySelectorAll('.counter').length;

            // when there is only 1 counter, hide the remove button
            if (remainingCounters === 2) {
                contextMenu.hideRemoveButton();
            }

            // remove dom element
            li.parentNode.removeChild(li);

        };

    };
    return CounterSet;
});
