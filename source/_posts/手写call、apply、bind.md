---
title: 手写call、apply、bind
date: 2021-10-10 15:22:06
tags:
---

### call

```js
Function.prototype.fakeCall = function (context, ...args) {
  context = context ?? window

  context.__fn = this // **1**
  let result = context.__fn(...args) // **2**

  delete context.__fn
  return result
}
```

注意:

1. `this`其实就是调用`call`的函数。如：`func.call(thisArg, ...args)`中，`call`里面，`this`就是`func`。
2. 同`1`，把调用`call`的函数赋值到`thisArg`上，再用点语法去调用，即可实现`call`。

### apply

> `apply`与`call`的实现类似，此处为避免重复代码，直接使用`call`

```js
Function.prototype.fakeApply = function (context, args) {
  return this.call(context, ...args)
}
```

### bind

```js
Function.prototype.fakeBind = function (context, ...bindArgs) {
  return (...args) => 
    this.call(context, ...bindArgs, ...args)
}
```

关于巧用箭头函数包装可以参考之前的文章：{% post_link  关于箭头函数%}
注意本实现有缺陷，因为箭头函数不是构造函数，不能被`new`实例化。为了兼容`new`，可以改成：

```js
Function.prototype.fakeBind = function (context, ...bindArgs) {
  const fn = this
  const resultFn = function(...args) {
    const that = new.target ? this : context // **1**
    return fn.call(that, ...bindArgs, ...args)
  }

  resultFn.prototype = fn.prototype
  return resultFn
}
```

注意：

1. 这里也可用`resultFn.prototype.isPrototypeOf(this)`代替`new.target`，但会有问题，若`fn`的实例通过点语法调用`bind`过的函数，`this`仍然指向`fn`的实例。
如：

```js
function Car(a) {
  this.a = a
} 
let test = {a: 'test'}
let bindedCar = Car.fakeBind(test)
let realCar = new Car('real car')

realCar.bindedCar = bindedCar
realCar.bindedCar('test') 
```

以上例子，`realCar.bindedCar`错误改变了`realCar.a`。
