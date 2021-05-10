---
title: Array.isArray vs instanceof
date: 2021-05-10 15:28:38
tags:
---

## 先说结论
`Array.isArray`优于`instance of Array`。

`Array.isArray`是`ES5`的方法： `MDN文档`：[MDN Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
`MDN`上提到：
> When checking for Array instance, Array.isArray is preferred over instanceof because it works through iframes.
```js
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
xArray = window.frames[window.frames.length - 1].Array;
var arr = new xArray(1, 2, 3); // [1,2,3]

// Correctly checking for Array
Array.isArray(arr);  // true
// Considered harmful, because doesn't work through iframes
arr instanceof Array; // false
```
可以看到，在当前页面新创建一个`iframe`，用`iframe`中的`Array`构造函数`new`一个数组`xArray`，`Array.isArray`可以**在当前页面**判断出`xArray`是一个数组，而`instanceof`不可以。

因此`Array.isArray`优于`instance of Array`。

## 深入一点
### 多个`global`
> A global object is an object that always exists in the global scope.

根据[MDN Global object](https://developer.mozilla.org/en-US/docs/Glossary/Global_object)，各个脚本执行上下文有各自的`global`。浏览器中的`window`、`Node.js`中的`global`都是各自运行环境中的`global`。

而浏览器中，各个窗口/`iframe`，并不共享同一个`window`。而在不同的`window`中，`Array.prototype`也是不同的（若是相同的，则恶意网页修改`Array.prototype`会引起严重后果）。因此`instanceof Array`在跨页面/`iframe`的情况下不适用。

### 其他的检测数组的方法
a.constructor === Array
这个方法与`instanceof Array`类似。`a instanceof Array`会在`a`的原型链上向上寻找`Array.protype`，而若`a`为数组，则`a.__proto__ === a.constructor.prototype === Array.prototype`，所以二者类似。

其他的方法来自[这里](http://web.mit.edu/jwalden/www/isArray.html)，作者用了一个有意思的比喻来描述这些方法“叫得像鸭子它就是一个鸭子”。
>  Another option relies on so-called "duck typing", where if a value quackslooks like a duckan array then it is a duckan array.
```js
Array.isArray({ constructor: Array }) // 通过a.constructor === Array 判断
Array.isArray({ push: Array.prototype.push, concat: Array.prototype.concat }) // 通过判断对象是否有数组的方法判断
Object.prototype.toString = function() { return "[object Array]"; };  // 通过a.toString() === "[object Array]" 判断
Array.isArray({ __proto__: Array.prototype }) // 通过a.__proto__ === Array.prototype判断
Array.isArray({ length: 0 })  // 通过是否有length属性判断
```
在此不再赘述。

