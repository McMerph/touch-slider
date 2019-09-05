!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.slider=e():t.slider=e()}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function r(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=t,r.c=e,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:i})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=2)}([function(t,e,r){"use strict";var i=function(){return(i=Object.assign||function(t){for(var e,r=1,i=arguments.length;r<i;r++)for(var n in e=arguments[r])Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}).apply(this,arguments)};Object.defineProperty(e,"__esModule",{value:!0});var n,s=r(1),o=r(4);!function(t){t[t.Idle=0]="Idle",t[t.TouchStarted=1]="TouchStarted",t[t.Swipe=2]="Swipe",t[t.Positioning=3]="Positioning"}(n||(n={}));var a=function(){function t(e,r){var o;this.state=n.Idle,this.currentIndex=0,this.wrapper=document.createElement("div"),this.settings=i(i({},t.defaultSettings),r),this.slidesPerView=this.settings.slidesPerView,this.wrapper.classList.add(s.default.ELEMENTS.WRAPPER.NAME),(o=this.wrapper.classList).add.apply(o,this.getWrapperClassNames()),e.classList.add(s.default.BLOCK),e.appendChild(this.wrapper),this.addEventListeners(e)}return t.prototype.appendSlide=function(t){t.classList.add(s.default.ELEMENTS.SLIDE),this.wrapper.appendChild(t),this.slidesPerView=Math.min(this.settings.slidesPerView,this.wrapper.children.length),this.update()},t.prototype.previous=function(){this.slideTo(this.currentIndex-1)},t.prototype.next=function(){this.slideTo(this.currentIndex+1)},t.prototype.slideTo=function(t){var e=this.getNormalizedIndex(Math.floor(t));this.currentSlideOffset=(this.currentIndex-e)*this.getSlideSize(),this.moveToNearestSlide()},t.prototype.getWrapperClassNames=function(){return[]},t.prototype.getSlideSize=function(){var t=this.settings.spaceBetween;return(this.getWrapperSize()-(this.slidesPerView-1)*t)/this.slidesPerView},t.prototype.update=function(){for(var t=0;t<this.wrapper.children.length;t++){var e=this.wrapper.children.item(t);t<this.wrapper.children.length-1&&(e.style[this.getMarginProperty()]=this.settings.spaceBetween+"px"),e.style[this.getSizeProperty()]=this.getSlideSize()+"px"}},t.prototype.getNormalizedIndex=function(t){return o.limit({max:this.wrapper.children.length-this.slidesPerView,min:0,value:t})},t.prototype.addEventListeners=function(t){var e=this;window.addEventListener("resize",function(){e.update(),e.slideTo(e.currentIndex)}),t.addEventListener("touchstart",function(t){1===t.touches.length&&e.state===n.Idle&&(t.preventDefault(),e.startTouch=t.changedTouches[0],e.startTime=performance.now(),e.state=n.TouchStarted)}),t.addEventListener("touchmove",function(t){1===t.touches.length&&(t.preventDefault(),e.state===n.TouchStarted?e.isSwipe(t.changedTouches[0])&&(e.state=n.Swipe):e.state===n.Swipe&&(e.currentSlideOffset=e.getTouchOffset(t.changedTouches[0]),e.move()))});var r=function(t){e.state===n.Swipe&&(t.preventDefault(),e.moveToNearestSlide())};t.addEventListener("touchend",r),t.addEventListener("touchcancel",r),t.addEventListener("transitionend",function(){e.wrapper.style.transitionDuration="0",e.state=n.Idle})},t.prototype.getTouchOffset=function(t){var e=this.currentIndex,r=this.slidesPerView,i=this.getPixelsDelta(t),n=i/this.wrapper.clientWidth*r,s=i>0?r:0,o=e-Math.ceil(n)+r-s,a=i,u=o<0,p=o>this.wrapper.children.length-1;if(u||p){var c=u?this.getOffsetToStart():this.getOffsetToEnd();a=c+(a-c)/this.settings.outOfBoundsResistance}return a},t.prototype.getOffsetToStart=function(){return this.currentIndex*(this.getSlideSize()+this.settings.spaceBetween)},t.prototype.getOffsetToEnd=function(){var t=this.settings.spaceBetween,e=this.getSlideSize(),r=this.wrapper.children.length;return(this.currentIndex+this.slidesPerView-r)*e-(r-this.currentIndex-this.slidesPerView)*t},t.prototype.moveToNearestSlide=function(){var t=this.settings.spaceBetween,e=this.getIntegerSlidesOffset();this.currentSlideOffset=o.limit({max:this.getOffsetToStart(),min:this.getOffsetToEnd(),value:-e*(this.getSlideSize()+t)}),this.move()?(this.wrapper.style.transitionDuration=this.settings.transitionDurationInMs+"ms",this.state=n.Positioning):this.state=n.Idle,this.currentIndex=this.getNormalizedIndex(this.currentIndex+e)},t.prototype.getIntegerSlidesOffset=function(){var t=this.settings,e=t.deltaThreshold,r=t.timeThresholdInMs,i=-this.currentSlideOffset/this.getSlideSize(),n=i-Math.floor(i)>e/100?Math.floor(i)+1:Math.floor(i);return 0===n&&performance.now()-this.startTime<r&&(n=this.currentSlideOffset>0?-1:1),n},t.prototype.move=function(){var t=this.settings.spaceBetween,e=this.currentIndex,r=this.currentSlideOffset,i=-e*(this.getSlideSize()+t)+r,n=this.totalOffset!==i;return n&&(this.totalOffset=i,this.wrapper.style.transform="translate3d("+this.getTranslate3dParameters()+")"),n},t.defaultSettings={deltaThreshold:50,outOfBoundsResistance:5,slidesPerView:1,spaceBetween:0,timeThresholdInMs:300,transitionDurationInMs:200},t}();e.default=a},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i={SLIDE:"slider__slide",WRAPPER:"slider__wrapper"},n={BLOCK:"slider",ELEMENTS:{SLIDE:i.SLIDE,WRAPPER:{MODIFIERS:{VERTICAL:i.WRAPPER+"_vertical"},NAME:i.WRAPPER}}};e.default=n},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=r(3),n=r(5);e.default={HorizontalSlider:i.default,VerticalSlider:n.default}},function(t,e,r){"use strict";var i=function(){var t=function(e,r){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(e,r)};return function(e,r){function i(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(i.prototype=r.prototype,new i)}}();Object.defineProperty(e,"__esModule",{value:!0});var n=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return i(e,t),e.prototype.getSizeProperty=function(){return"width"},e.prototype.getMarginProperty=function(){return"marginRight"},e.prototype.getWrapperSize=function(){return this.wrapper.clientWidth},e.prototype.isSwipe=function(t){return Math.abs(this.startTouch.pageX-t.pageX)>Math.abs(this.startTouch.pageY-t.pageY)},e.prototype.getPixelsDelta=function(t){return t.pageX-this.startTouch.pageX},e.prototype.getTranslate3dParameters=function(){return this.totalOffset+"px, 0, 0"},e}(r(0).default);e.default=n},function(t,e,r){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.limit=function(t){var e=t.value,r=t.min,i=t.max,n=e;return n=Math.min(n,i),n=Math.max(n,r)}},function(t,e,r){"use strict";var i=function(){var t=function(e,r){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(e,r)};return function(e,r){function i(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(i.prototype=r.prototype,new i)}}();Object.defineProperty(e,"__esModule",{value:!0});var n=r(0),s=r(1),o=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return i(e,t),e.prototype.getWrapperClassNames=function(){return[s.default.ELEMENTS.WRAPPER.MODIFIERS.VERTICAL]},e.prototype.getSizeProperty=function(){return"height"},e.prototype.getMarginProperty=function(){return"marginBottom"},e.prototype.getWrapperSize=function(){return this.wrapper.clientHeight},e.prototype.isSwipe=function(t){return Math.abs(this.startTouch.pageX-t.pageX)<Math.abs(this.startTouch.pageY-t.pageY)},e.prototype.getPixelsDelta=function(t){return t.pageY-this.startTouch.pageY},e.prototype.getTranslate3dParameters=function(){return"0, "+this.totalOffset+"px, 0"},e}(n.default);e.default=o}]).default});
//# sourceMappingURL=slider.js.map