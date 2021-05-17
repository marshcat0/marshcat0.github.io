---
title: javascript.info读书笔记 -- Prototype篇
date: 2021-05-12 17:19:04
tags: javascript.info读书笔记
---
> 本文记录自己在学习时的一些`notable points`。一是为了在读书的时候，对每一小节进行总结，加深印象，提高学习效果，避免“看完即忘”；二是为了在之后回顾的时候，可以迅速地“取精华而废糟粕”，避免把大量的时间浪费在人尽皆知的简单知识上。

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

## Native prototypes
![All of the built-in prototypes have Object.prototype on the top](prototype/native-prototypes-classes.svg)

### Primitives
The most intricate thing happens with strings, numbers and booleans.

As we remember, they are not objects. But if we try to access their properties, temporary wrapper objects are created using built-in constructors String, Number and Boolean. They provide the methods and disappear.

These objects are created invisibly to us and most engines optimize them out, but the specification describes it exactly this way. Methods of these objects also reside in prototypes, available as String.prototype, Number.prototype and Boolean.prototype.

课后习题`Add the decorating "defer()" to functions`中关于`apply`的可以看看。

## Prototype methods, objects without __proto__
`__proto__`属性在浏览器端略微过时了。以下有三个现代的方法来替代它：
1. [Object.create(proto, [descriptors])](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create) – creates an empty object with given proto as [[Prototype]] and optional property descriptors.
2. [Object.getPrototypeOf(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) – returns the [[Prototype]] of obj.
3. [Object.setPrototypeOf(obj, proto)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) – sets the [[Prototype]] of obj to proto.

通过`Object.create`的第二个参数（属性描述符），可以实现更加精确的属性拷贝：
> We can use Object.create to perform an object cloning more powerful than copying properties in for..in:
```js
let clone = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
```
> This call makes a truly exact copy of obj, including all properties: enumerable and non-enumerable, data properties and setters/getters – everything, and with the right [[Prototype]].

### Brief history
> Don’t change [[Prototype]] on existing objects if speed matters
Javascript引擎对于作用域链的查找做了优化，因此，如果在运行时(原文为`on the fly`)通过`Object.setPrototypeOf`或`obj.__proto__=`更改了原型，就会破坏这种优化，从而影响运行速度。

### "Very plain" objects
对对象进行赋值时，有一个有趣的现象：对`__proto__`的赋值有时会不生效。
> That shouldn’t surprise us. The __proto__ property is special: it must be either an object or null. A string can not become a prototype.
解决方法有：
1. 使用`Map` instead of `plain objects`
2. 使用`Object.create(null)`

### Summary
Other methods:

1. [Object.keys(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys) / [Object.values(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) / [Object.entries(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) – returns an array of enumerable own string property names/values/key-value pairs.
2. [Object.getOwnPropertySymbols(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols) – returns an array of all own symbolic keys.
3. [Object.getOwnPropertyNames(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames) – returns an array of all own string keys.
4. [Reflect.ownKeys(obj)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys) – returns an array of all own keys. 等于`Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))`
5. [obj.hasOwnProperty(key)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty): returns true if obj has its own (not inherited) key named key.
