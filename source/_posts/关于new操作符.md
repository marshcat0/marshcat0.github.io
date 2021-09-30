---
title: 关于new操作符
date: 2021-09-30 22:45:41
tags:
---

1. 当一个空函数用`new`执行时，它做了以下的操作：

    * 一个新的对象被创建并且赋值给了`this`
    * 运行函数体，这个函数通常修改`this`，向其中增加新的属性
    * 返回`this`的值
  
    如：

    ```js
    function User(name) {
      // this = {};  (implicitly)

      // add properties to this
      this.name = name;
      this.isAdmin = false;

      // return this;  (implicitly)
    }
    ```

    这样`let user = new User("Jack")`与以下的结果相同：

    ```js
    let user = {
      name: "Jack",
      isAdmin: false
    };
    ```

2. 注意箭头函数不能被`new`调用，因为`new`没有自己的`this`

3. `new.target`可以得知构造函数是否被`new`调用，如下：

   ```js
    function User(name) {
      if (!new.target) { // if you run me without new
        return new User(name); // ...I will add new for you
      }
    
      this.name = name;
    }
    
    let john = User("John"); // redirects call to new User
    alert(john.name); // John
   ```

4. 在构造函数中`return`值时的规则：

    * 若`return`一个对象，则返回该对象
    * 若`return`一个基本数据类型，则忽略它（仍返回`this`）
  
    如：

    ```js
    function BigUser() {
    
      this.name = "John";
    
      return { name: "Godzilla" };  // <-- returns this object
    }
    
    alert( new BigUser().name );  // Godzilla, got that object
    
    function SmallUser() {
    
      this.name = "John";
    
      return; // <-- returns this
    }
    
    alert( new SmallUser().name );  // John
    ```

5. 构造函数无参数时，可省略括号（不推荐），如：

   ```js
    let user = new User; // <-- no  parentheses
    // same as
    let user = new User();
   ```
