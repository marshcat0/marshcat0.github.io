(function(e){function t(t){for(var r,u,a=t[0],i=t[1],l=t[2],f=0,s=[];f<a.length;f++)u=a[f],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&s.push(o[u][0]),o[u]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);p&&p(t);while(s.length)s.shift()();return c.push.apply(c,l||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],r=!0,a=1;a<n.length;a++){var i=n[a];0!==o[i]&&(r=!1)}r&&(c.splice(t--,1),e=u(u.s=n[0]))}return e}var r={},o={index:0},c=[];function u(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=e,u.c=r,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)u.d(n,r,function(t){return e[t]}.bind(null,r));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="/";var a=window["webpackJsonp"]=window["webpackJsonp"]||[],i=a.push.bind(a);a.push=t,a=a.slice();for(var l=0;l<a.length;l++)t(a[l]);var p=i;c.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("a429")},a429:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("7a23"),o=n("607d"),c=(n("6575"),Object(r["defineComponent"])({setup:function(e){var t=Object(r["ref"])(0),n=["http://fakeimg.pl/300/?text=1","http://fakeimg.pl/300/?text=2","http://fakeimg.pl/300/?text=3","http://fakeimg.pl/300/?text=4","http://fakeimg.pl/300/?text=5"],c=3e3,u=function(){console.log("next")},a=function(){console.log("prev")};return function(e,i){return Object(r["openBlock"])(),Object(r["createBlock"])(Object(r["unref"])(o["Slider"]),{activeIndex:t.value,"onUpdate:activeIndex":i[0]||(i[0]=function(e){return t.value=e}),images:n,stepInterval:c,onClickNext:u,onClickPrev:a},null,8,["activeIndex"])}}}));const u=c;var a=u;Object(r["createApp"])(a).mount("#app")}});
//# sourceMappingURL=index.1d38d95c.js.map