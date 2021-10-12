---
title: Js继承最佳实践
date: 2021-10-12 12:40:00
tags:
---
如下：

```js
  function Animal(name) {
    this.name = name
    this.someProp = [1, 2, 3]
  }
  function Cat(name, color) {
    // 复用父类构造函数
    Animal.call(this, name)
    this.color = color
  }

  Cat.prototype = new Animal('animal')  /***1***/
  Cat.prototype.constructor = Cat /***2***/
```

注意：

1. 这里其实只是为了继承`Animal.prototype`上的属性，其实没有必要再`new Animal`，尤其是`Animal`执行复杂操作时。我们可以创建一个以`Animal.prototype`为原型的新对象`a`，再将`Cat.prototype`指向它。如下：

    ```js
    function createPrototype(proto) {
        function F(){}
        F.prototype = proto
        return new F()
    }
    Cat.prototype = createPrototype(Animal.prototype)
    Cat.prototype.constructor = Cat
    ```

    或者我们可以使用`Object.create`来帮助我们构建以`Animal.prototype`为原型的新对象：

    ```js
    /**
     * @params proto 要继承的原型
     * @params child 子类的构造函数
     */
    function inheritPrototype(proto, Child) {
      Child.prototype = Object.create(proto)
      Child.prototype.constructor = child
    }
    inheritPrototype(Animal.prototype, Cat)
    
    ```

2. 这里是为了修复`constructor`在重置`Cat.prototype`后的指向错误问题，因为一个构造函数的`prototype`就是一个对象，这个对象有一个属性`constructor`，指向构造函数自身。如图：![函数默认原型](function-prototype-constructor.svg)
