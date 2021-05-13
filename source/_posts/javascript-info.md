---
title: javascript.info读书笔记
date: 2021-05-12 17:19:04
tags:
---
> 本文记录自己在学习时的一些`notobal points`。一是为了在读书的时候，对每一小节进行总结，加深印象，提高学习效果，避免“看完即忘”；二是为了在之后回顾的时候，可以迅速地“取精华而废糟粕”，避免把大量的时间浪费在人尽皆知的简单知识上。

# Prototypes, inheritance
[文章地址](https://javascript.info/prototype-inheritance)

## Prototypal inheritance

### [[Prototype]]
1. the references can’t go in circles. JavaScript will throw an error if we try to assign __proto__ in a circle.
2. The value of __proto__ can be either an object or null. Other types are ignored.
3. `__proto__`是内部的`[[Prototype]]`的getter/setter，并不完全等同于`[[Prototype]]`。现代的JavaScript建议我们使用`Object.getPrototypeOf/Object.setPrototypeOf`来获取/设置原型。

### Writing doesn’t use prototype
1. 只有在读取属性时才会从原型链上找，赋值/删除操作直接在对象本身上进行。**注意！**访问属性(Accessor properties)是例外，因为赋值是由setter函数处理的。如：
```js
let user = {
  name: "John",
  surname: "Smith",

  set fullName(value) {
    [this.name, this.surname] = value.split(" ");
  },

  get fullName() {
    return `${this.name} ${this.surname}`;
  }
};

let admin = {
  __proto__: user,
  isAdmin: true
};

alert(admin.fullName); // John Smith (*)

// setter triggers!
admin.fullName = "Alice Cooper"; // (**)

alert(admin.fullName); // Alice Cooper, state of admin modified
alert(user.fullName); // John Smith, state of user protected
```

### for…in loop
1. The for..in loop iterates over inherited properties too.
2. Almost all other key/value-getting methods, such as Object.keys, Object.values and so on ignore inherited properties.

这一节课后习题`Why are both hamsters full`可以看下


## F.prototype
1. `F.prototype` property is only used when `new F` is called, it assigns `[[Prototype]]` of the new object. 如果在创建一个对象后，改变`F.prototype`，则只会影响下一次用`new F`创建的对象的`[[Prototype]]`，已创建的对象的`[[Prototype]]`则不受影响。

### Default F.prototype, constructor property
1. Every function has the `"prototype"` property even if we don’t supply it.
The default `"prototype"` is an object with the only property `constructor` that points back to the function itself. 
即，每个函数都默认有`prototype`属性，它是`{constructor: function itself}`，如下图所示。
![函数默认原型](prototype/function-prototype-constructor.svg)

2. 设`Rabbit`为构造函数，`rabbit`为`Rabbit`的实例，则`rabbit`可**通过原型链**访问到它的构造函数，如下图所示。即`rabbit`的`constructor`是从原型链上获取的。
![实例访问构造函数](prototype/rabbit-prototype-constructor.svg)
需要注意的是，JavaScript itself does not ensure the right `"constructor"` value.

这一节的两道课后习题都可看下
