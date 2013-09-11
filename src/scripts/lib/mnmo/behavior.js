define(function () {
    'use strict';
    var Behavior = function () {
        var startFingerY,
            startListY,
            listElement,
            itemHeight,
            willAddCounter = false;

        this.init = function (counters) {
            var li,
                resistanceInterval;
            itemHeight = counters.getCounterSize();
            listElement = counters.getListElement();

            console.log(itemHeight, listElement);

            // add the space before first counter
            li = document.createElement('li');
            li.classList.add('counterlist__empty-space');
            listElement.insertBefore(li, listElement.firstChild);
            listElement.classList.add('counterlist--with-space');

            // listen for touch events
            document.body.addEventListener('touchstart', onTouchStart);
            document.body.addEventListener('touchmove', onTouchMove);
            document.body.addEventListener('touchend', onTouchEnd);
        };
        function getYScroll(){
            return (window.pageYOffset || document.documentElement.scrollTop);
        }
        function onTouchStart(event){
            startFingerY = event.touches.item(0).clientY;
            startListY = listElement.offsetTop;
        }
        function onTouchMove(event){
            var touch1 = event.touches.item(0),
                fingerY = touch1.clientY,
                deltaY = fingerY - startFingerY;
            // if there is a swipe down gesture
            // after the scroll is already at the top
            if ((getYScroll() === 0) && (deltaY > 0)){
                listElement.style.top = Math.min(0, (startListY + deltaY)) + 'px';
                // if the extra scroll hits the height of a full counter
                // then add a new counter
                if (startListY + deltaY >= 0){
                    willAddCounter = true;
                }
            }
        }
        function onTouchEnd(event){
            if (listElement.style.top.length > 0){
                if (willAddCounter){
                    console.log('ADD NEW COUNTER');
                    willAddCounter = false;
                }else{
                    listElement.classList.add('returning');
                }
                listElement.style.top = null;
            }
        }
    };
    return Behavior;
});
