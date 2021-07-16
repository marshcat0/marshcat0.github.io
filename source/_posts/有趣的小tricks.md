---
title: 有趣的小tricks
date: 2021-07-15 10:58:49
tags:
---

1. [利用`css3 filter`改变svg的颜色](https://stackoverflow.com/a/53336754/6028514)：有时候ui会要求图标hover变色，但是图标是以`<img src="xxx.svg">`的形式引入的（因此不能通过设置`color`来改变颜色），也不想或者不能使用两张图片，此时就可以用css3 的filter设置颜色。
2. [巧妙得知浏览器是否开始下载文件](https://stackoverflow.com/questions/1106377/detect-when-browser-receives-file-download)：下载文件时，接口比较慢，想显示loading，但不知道是否开始下载怎么办？前端在请求下载文件时，向后端传递一个随机的`downloadToken`，后端返回文件流的header里面`set-cookie``downloadToken`( **注意`cookie`的`path`** ，对于单页面应用，且`history`模式为`hash`，建议`path`设置为`/`)，前端轮询本地的`cookie`，发现`cookie`中的`dnloadToken`与发送给后端的`dnloadToken`相同时，则说明浏览器已开始下载。