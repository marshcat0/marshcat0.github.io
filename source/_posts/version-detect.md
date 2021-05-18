---
title: version-detect
date: 2021-03-04 16:24:15
tags:
hide: true
---

## 前言
本文介绍了如何实现vue项目代码版本检测&提示更新，及其相关原理。

## 原理

项目中代码变动后，webpack打包时的`contenthash`也会变动（`hash`、`chunkHash`、`contentHash`之间的区别参考[这里](https://stackoverflow.com/a/52786672))。因此如果我们在一个全局的组件中定时请求`index.html`，再从`app.[hash].js`中将hash解析出来，与当前页`index.html`中的hash做对比，若hash不同，则版本发生了变动

## 关键代码
```javascript
    async compareHash() {
      if (this.notificationShown) return

      const latestHash = await this.getLatestHash()
      const currentHash = this.getCurrentHash()

      if (latestHash !== currentHash) {
        this.notificationShown = true
        // 在这里发送通知
        })
      }
    },
    async getLatestHash() {
      const response = await axios.get(
        `${window.location.protocol}//${window.location.host}/`,
      )

      // 构建html
      let el = document.createElement('html')
      el.innerHTML = response.data

      return this.getHashFromHtml(el)
    },
    getCurrentHash() {
      return this.getHashFromHtml(document)
    },
    getHashFromHtml(el) {
      // 获取js script的src
      let scriptTags = el.getElementsByTagName('script')
      let scriptSrcs = Array.prototype.map.call(scriptTags, item => item.src)

      // 正则获取app.[hash].js的hash
      // 默认hashDigest为hex，即app.js的hash为16进制
      // 用vue inspect --mode production查看webpack配置
      // filename与chunkFilename都是'js/[name].[contenthash:8].js'
      let appHashRegex = /.*app\.(?<hash>[0-9a-f]{8})\.js/
      return scriptSrcs
        .map(item => item.match(appHashRegex))
        .filter(item => item)[0].groups.hash
    },
  },

```

## 废弃思路
### HTTP缓存
若index.html没有变化，浏览器向后端请求时，会返回304，那能不能根据axios返回的response的状态码来判断版本有没有更新呢？下面给出作者的探究思路。
1. 尝试将axios的response打印出来，却发现当Chrome network panel显示结果为304时，console打印出的状态码为200，如图所示：![axios 200](axios_200.jpg)
2. 根据Stackoverflow的[这篇回答](https://stackoverflow.com/a/16817752/6028514)，如下：![](so_200.png)  
（回答中提到的![spec](https://www.w3.org/TR/2014/WD-XMLHttpRequest-20140130/)提示文档已经过时，如果小伙伴们发现了更加及时、权威的文章，欢迎补充。）
意思大概是，即使服务器返回了`304 Not Modified`，xhr返回结果中的status仍会是200，除非在请求头中自定义了缓存的验证（通过`If-None-Match`或` If-Modified-Since`）  
作者尝试了下，对于一个请求，用charles抓包，charles中显示状态码为304，而chrome中显示状态码为200，应该跟上面也是同样的道理吧。  
此外，作者尝试了下手动在http头中自定义缓存验证，得到了以下的结果：![axios 304](axios 304.png)，说明304的状态码已经被传递给xhr了。至于axios报错的原因，则不深入追究了。  
从另外一个角度考虑的话，在没有自定义验证规则的前提下，把304暴露给xhr是没有意义的，因为在项目中，并不知道到底去哪里取这个`Not Modified`的文件
3. 所以结论是，可以这么做，但是要在axios中先自定义`If-None-Match`或` If-Modified-Since`头，并且这两个字段的内容要额外请求一次来获取。不过这样就略显复杂。


### HTTP缓存
需要注意的是，缓存在浏览器中是被默认启用的（参考[What's default value of cache-control? - Stack Overflow](https://stackoverflow.com/questions/14496694/whats-default-value-of-cache-control)）。  
而用axios发送请求时，默认不会发送缓存相关的header，将`axios.defaults.headers`打印出来如下：![axios 默认header](axios_default_header.jpg)
因此，浏览器会默认将index.html缓存。在chrome中试验结果如下：




## 参考资料
1. [realContentHash](https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash)
2. 用`vue inspect --mode production`（也可用`npx vue-cli-service inspect --mode production`）打印出webpack配置，有以下关注点： 

    1) `output`中的`filename`、`chunkFilename`，其中`chunkFileName`是指未被列在`entry`中，却又需要被打包出的`chunk`文件的名称。一般来说指懒加载的依赖。[参考地址](https://mp.weixin.qq.com/s/BHSihethgh_zH0K1J3qwnA)  
    如果这两项的内容是`js/[name].[contenthash:8].js`，（格式参考[这里](https://webpack.js.org/loaders/file-loader/#placeholders)）则可以直接用作者写的正则，否则可能需要编辑配置/重新写正则
    2) `entry`项。entry的配置项命名规则，引用官网说明如下：
    > If a string or array of strings is passed, the chunk is named main. If an object is passed, each key is the name of a chunk, and the value describes the entry point for the chunk.
    我们这里着重看下entry中传入的是否是对象&对象的key（即生成的chunk的name）是否为`app`，若不是，则需要重新写正则
3. 如何在本地调试