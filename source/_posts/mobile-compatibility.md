---
title: 移动端兼容
date: 2021-04-28 13:58:16
tags:
---

## 前言
最近作者在开发移动端会议室系统的过程中，备受跨设备兼容的困扰。前车之鉴，后人之师，在此我把遇到、解决过的兼容性问题列举出来，一是为了做个记录，二也是给大家提供参考。

### iOS上底部安全区的适配
iOS取消实体home键，改为全面屏手势后，在屏幕底部展示了一个小黑条，而如果写网页的时候不加处理，内容就会被小黑条覆盖掉。解决方法如下：
```css
.container {
  // 底部安全区适配
  padding-bottom: constant(safe-area-inset-bottom); // iOS老版本写法，为了保持向前兼容，也要加上，且要放到前面
  padding-bottom: env(safe-area-inset-bottom);
}
```
将以上样式应用于页面外部容器/**定位为fixed且bootom为0（即固定在页面底部显示）的元素**即可。
对于安卓机型，作者测试了一下小米10 pro，该机型在开启底部小黑条时，是在屏幕最下方单独为小黑条保留了一部分空间，没有侵入app，所以无需额外设置。

### IOS企业微信端对于fixed元素位置显示错误
如下两图所示。其中左图为有问题的页面，右图为正常页面。
<figure>
<img src="fixed-bug.png" width="49%">
<img src="fixed-normal.png" width="49%">
</figure>

bug原因猜测：
<center>
<img src="fixed-reason.png" width="49%">
</center>
如图所示，页面最外层容器没有铺满当前页。将最外层容器高度铺满页面后，bug被修复：

```css
#app {
  min-height: 100vh;
}
```
### height: 100vh的问题
在移动端使用100vh可能会出现双重滚动条/底部fixed元素被盖住。拿移动端的chrome举例，浏览器把地址栏也算入到了可视高度内（下滑地址栏可隐藏），因此当展示地址栏的时候，100vh就要比实际的可视高度要高，因此会出现双重滚动条/底部fixed元素被盖住。
<center>
<img src="mobile-chrome.jpeg" width="49%">
</center>

解决方法是：
```css
body {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}
html {
  height: -webkit-fill-available;
}
```
参考资料：[CSS fix for 100vh in mobile WebKit](https://css-tricks.com/css-fix-for-100vh-in-mobile-webkit/)

### 大分辨率图片加载不出来的问题
> 仅安卓端企业微信内置浏览器有问题

经过测试，7088*10630分辨率的图片，安卓端企业微信内置浏览器无法加载出（合理推测大分辨率的加载不出）
解决方法是在上传图片的时候制定图片的最大分辨率，超过分辨率则用canvas降分辨率

```js
async function resizeImg (file) {
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }
  function getImg(src) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = function () {
        resolve(img)
      }
      img.src = src
    })
  }
    
  const canvas = document.createElement('canvas')
  const src = await getBase64(file)
  const img = await getImg(src)

  // 缩放
  // 限制最大x分辨率
  const x = 1600
  let width = img.width
  let height = img.height
  if (width > x) {
    height *= x / width
    width = x
  }

  // 绘画
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise((resolve) => {
    // 转为为提交所需格式
    canvas.toBlob((blob) => {
      resolve(blob)
    })
  })
}
```

提交上传图片时，在formData里append处理后的图片即可。
```js
const form = new FormData()
const blob = await resizeImg(file)
form.append('file', blob)
```

### 安卓端文字偏上，某些机型尤其明显（使用flex垂直居中时）
！不知道咋解决，有人知道的话私信我一下谢谢～（叹气）

### 不同逻辑分辨率的设备兼容
鉴于现在主流浏览器对于viewport 单位 (vw, vh, vmin, vmax)支持良好，因此在对于不同逻辑分辨率的设备，可以使用`postcss-px-to-viewport`插件，来将`px`单位改成`vw`单位。
需要注意的是: 
1. `postcss-px-to-viewport`这个插件`npm`源与`github`源不一致，`npm`源会导致一些选项，如`include`选项无效，而由于[npm的bug](https://github.com/npm/cli/issues/624)，在`docker`中用`npm`安装`github`源的文件会失败，从而导致自动部署失败。
参考资料：[vant 浏览器适配](https://vant-contrib.gitee.io/vant/#/zh-CN/advanced-usage#viewport-bu-ju)
2. 经过`px`到`vw`的转换后，对于小数点像素（如`1.3456px`），不同的浏览器有不同的处理策略，可能会导致使用同样样式的线条，有的粗有的细的问题