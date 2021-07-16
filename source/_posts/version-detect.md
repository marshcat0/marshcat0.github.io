---
title: 【TSD】Garden招聘系统版本检测实现总结
date: 2021-03-04 16:24:15
tags:
hide: false
---

## TL;DR
Garden前端在Q2上线了新版本检测功能，以下是对该实现方法的说明，和由此延伸出的其他思考。

## 背景和目的
1. Garden招聘系统迭代迅速，基本上每周都有上线，版本变动频繁。
2. 频繁使用Garden的业务方，在打开Garden后，不会去频繁刷新
3. 对于单页面应用，不刷新则无法获取最新版本

以上就会导致，业务方有可能在过时的版本上操作，可能会产生报错，增加产品答疑的工作量，也有可能产生脏数据。
针对以上问题，Garden组开发了新版本检测功能。

## 技术和方案介绍
### 整体思路
![整体流程](整体流程.jpg) 
项目中代码变动后，webpack打包时的`contenthash`也会变动（`hash`、`chunkHash`、`contentHash`之间的区别参考[这里](https://stackoverflow.com/a/52786672))。因此如果我们在一个全局的组件中定时请求`index.html`，再从`app.[hash].js`中将hash解析出来，与当前页`index.html`中的hash做对比，若hash不同，则版本发生了变动
### 关键代码
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
        {
          headers: {
            'Cache-Control': 'max-age=0',
          },
        },
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

## 其他思考
### HTTP缓存
若index.html没有变化，浏览器向后端请求时，会返回304 Not Modified，那能不能根据axios返回的response的状态码来判断版本有没有更新呢？下面给出作者的探究思路。
1. 尝试将axios的response打印出来，却发现当Chrome network panel显示结果为304时，console打印出的状态码为200。但是为什么呢？

2. 原因是，axios请求头中没有`cache validator`（缓存验证），如`If-Modified-Since`(`Last-Modified`)或者`If-None-Match`(`Etag`)，因此Chrome不会给axios返回200.

3. 根据`HTTP/1.1 cache`的规范，[Handling a Received Validation Request](https://datatracker.ietf.org/doc/html/rfc7234#section-4.3.2)，

    > When a cache decides to revalidate its own stored responses for a request that contains an If-None-Match list of entity-tags, the cache MAY combine the received list with a list of  entity-tags from its own stored set of responses (fresh or stale) and send the union of the two lists as a replacement If-None-Match header field value in the forwarded request.
 
    可以理解为：对于同一个资源A，clientA缓存了一份，clientB也缓存了一份，且请求转发顺序为clientA->clientB->服务器，则cliendA发送请求验证缓存时（使用`If-None-Match`），clientB也可以把自己缓存的资源的`Etag`加入到  `If-None-Match`列表中。
 
    > If the response to the forwarded request is 304 (Not Modified) and has an ETag header field value with an entity-tag that is not in the client's list, the cache MUST generate a 200(OK)  response for the client by reusing its corresponding stored response, as updated by the 304 response metadata (Section 4.3.4).
 
    大概意思可以理解为：服务器给clientB返回了304(`response`头中有`Etag`)，但是clienA请求头中的`If-None-Match`与服务器返回的`Etag`不相同（因为，如上文所说，clientB将自己具有但是clientA不具有的缓存的`Etag`加入到了`If-None-Match`中），则clientB会给clientA返回200 Ok(`response`是clienA缓存的正确的文件，并经过服务器返回的`response`中的metadata更新)
    以上应该可以让大家更好地理解第二点。（axios中没有存储正确的缓存文件，因此即使chrome收到了304的返回，依然要告诉axios这是200 ok）
 
4. 对于`Last-Modified`验证字段，则不存在(3)中所说的，因为仅凭修改时间，clientB无法判断clientA是否有正确的缓存文件。

5. 其他参考：
    Stackoverflow的[这篇回答](https://stackoverflow.com/a/16817752/6028514)，如下：![](so_200.png)  
    （回答中提到的[spec](https://www.w3.org/TR/2014/WD-XMLHttpRequest-20140130/)提示文档已经过时，如果小伙伴们发现了更加及时、权威的文章，欢迎补充。）
    意思大概是，即使服务器返回了`304 Not Modified`，xhr返回结果中的status仍会是200，除非在请求头中自定义了缓存的验证，即：xhr请求头中自定义`If-None-Match`或    `If-Modified-Since`头。但是加了这两个头之后，对于`If-None-Match`，xhr请求头的`If-None-Match`必须要和服务器返回的`Etag`一致，xhr返回结果中的status才会是304。

## 参考资料
1. [realContentHash](https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash)
2. 用`vue inspect --mode production`（也可用`npx vue-cli-service inspect --mode production`）打印出webpack配置，有以下关注点： 

    1) `output`中的`filename`、`chunkFilename`，其中`chunkFileName`是指未被列在`entry`中，却又需要被打包出的`chunk`文件的名称。一般来说指懒加载的依赖。[参考地址](https://mp.weixin.qq.com/s/BHSihethgh_zH0K1J3qwnA)  
    如果这两项的内容是`js/[name].[contenthash:8].js`，（格式参考[这里](https://webpack.js.org/loaders/file-loader/#placeholders)）则可以直接用作者写的正则，否则可能需要编辑配置/重新写正则
    2) `entry`项。entry的配置项命名规则，引用官网说明如下：
        > If a string or array of strings is passed, the chunk is named main. If an object is passed, each key is the name of a chunk, and the value describes the entry point for the chunk.

        我们这里着重看下entry中传入的是否是对象&对象的key（即生成的chunk的name）是否为`app`，若不是，则需要重新写正则