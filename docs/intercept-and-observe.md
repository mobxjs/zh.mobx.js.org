---
title: 拦截与观察
sidebar_label: 拦截与观察 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 拦截与观察（Intercept & Observe） {🚀}

_⚠️ **警告**: Intercept 和 Observe是低等级方法,，他们不应该被应用在正式的开发中。可以考虑使用 [reaction](reactions.md)，因为 `observe` 不遵循事务原则也不支持对深层级的对象变动的监听。这种方法是反面模式（anti-pattern）。如果你想使用 `observe`来获取新值和旧的值，请考虑优先使用[`reaction`](reactions.md#reaction)。 ⚠️_

`observe` 和 `intercept` 可以用来监视单个可被观察的对象的变化，但是它们 **_不适合_** 用来跟踪深层级的可观察对象。
-   `intercept` 可用于在对象在发生变更之前进行拦截，从而做到验证修改，统一变更，取消变更(validating, normalizing or cancelling)。
-   `observe` 允许你在数据发生更改后观察到更改。

## 拦截（Intercept）

方法声明: `intercept(target, propertyName?, interceptor)`

_请避免使用此API。 大体上讲它提供了一种面向切面编程的方案（aspect-oriented programming），它是在数据流任何更新状态  **之前** （而不是在更新过程中）进行数据验证，所以很难进行调试。_

-   `target`: 可被拦截到的对象。
-   `propertyName`: 可选参数，用于指定要拦截的特定的对象属性。请注意，这里`intercept(user.name, interceptor)`与`intercept(user, "name", interceptor)`有本质上的不同。第一种尝试将拦截添加到 _当前的_ `value`而不是 `user.name`，这可能导致 `user.name` 的变化根本无法被拦截到。后者则是对`user`的`name` 属性进行拦截。 
-   `interceptor`: 回调函数，在可观察对象  _每次 _ 发生变更都会被调用。入参是一个描述具体发生了什么变更的对象。

`intercept` 必须告诉MobX如何对当前要发生的变更进行处理。因此，它应该具有下列操作中的一种：

1. 直接返回回调函数的入参`change`对象，这种情况下发生的变更会被接受。
2. 修改回调函数的入参 `change` 对象并返回它, 比如你可以格式化数据。并非所有的数据都是可以修改的，可以参照下面的代码样例。
3. 返回 `null`, 这意味着变更不会发生，而是会被忽略，这是一个非常强大的概念。他意味着你可以让你的对象变得完全不可变（immutable）。
4. 当发生的变更不符合你的要求的时候，你可以抛出一些异常。

这个方法会返回一个`disposer` 函数，你可以调用这个方法来注销拦截。
有可能你会注册多个拦截 `intercept`到一个可观察的对象上，他们将会被按照注册的顺序链式调用。
如果这些拦截中的一个返回 `null` 或者抛出异常, 那么剩下的拦截 `intercept`将不会被继续触发。
你有可能同时在父对象（即原型·译者注）和私有属性（实例属性·译者注）上同时注册了拦截，那么拦截 `intercept`会先执行注册在父对象上的，再执行私有属性上的。

```javascript
const theme = observable({
    backgroundColor: "#ffffff"
})

const disposer = intercept(theme, "backgroundColor", change => {
    if (!change.newValue) {
        // 忽略未设置的颜色变更。
        return null
    }
    if (change.newValue.length === 6) {
        // 增加忽略的修饰前缀 `#`。
        change.newValue = "#" + change.newValue
        return change
    }
    if (change.newValue.length === 7) {
        // oh 这是一个被格式化好的颜色代码!
        return change
    }
    if (change.newValue.length > 10) {
        // 注销拦截。
        disposer()
    }
    throw new Error("哦我的上帝啊，这看起来不像是一种颜色: " + change.newValue)
})
```

## 观察(Observe)

方法声明: `observe(target, propertyName?, listener, invokeImmediately?)`

_参阅上述声明, 请避免使用此API 并改用 [`reaction`](reactions.md#reaction) 。_

-   `target`: 可被观察到的对象。
-   `propertyName`: 可选参数，用于指定要观察的特定的对象属性。请注意，这里 `observe(user.name, listener)` 与 `observe(user, "name", listener)`有本质上的不同,
第一种尝试将监听添加到 _当前的_  `value` 而不是 `user.name`, 这可能导致`user.name` 的变化根本无法被监听到。因为后者是对`user`的`name`属性进行监听。
-   `listener`: 回调函数，在可观察对象  _每次 _ 发生变更都会被调用。入参是一个描述具体发生了什么变更的对象。包装对象（boxed observables）除外，它会调用回调函数的两个参数： `newValue, oldValue`
-   `invokeImmediately`: 默认值为 _false_ 。如果你想让监听 `observe` 的 `listener`回调函数立即执行， 而不是等待观察到第一次变化后触发， 可以将它设置为 _true_ 。
目前（现在）所有的观察对象类型都不支持。

这个方法会返回一个`disposer` 函数，你可以调用这个方法来注销监听器。
请注意，`transaction` 不会影响`observe`方法的工作。
这意味着即使在事务内部，`observe`也会针对每个变更触发监听。因此，通常可以使用更健壮的和声明类型的 [`autorun`](reactions.md#autorun)替代`observe`方法。


_`observe` 会在他们发生 **变更（mutations）** 时产生响应， `autorun` or `reaction` 会对 **新值（new values）** 产生时做出响应。 大多数情况下，这就足够了。_

例子:

```javascript
import { observable, observe } from "mobx"

const person = observable({
    firstName: "Maarten",
    lastName: "Luther"
})

// 观察所有字段.
const disposer = observe(person, change => {
    console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
})

person.firstName = "Martin"
// 打印: 'update firstName from Maarten to Martin'

// 注销观察.
disposer()

// 监听单个字段.
const disposer2 = observe(person, "lastName", change => {
    console.log("LastName changed to ", change.newValue)
})
```

相关文章: [Object.observe已死，mobx.observe当立（Object.observe is dead. Long live mobx.observe）](https://medium.com/@mweststrate/object-observe-is-dead-long-live-mobservable-observe-ad96930140c5)

## 事件概览 （Event overview）

 `intercept` 和 `observe` 会接受一个事件对象至少包含以下属性:

-   `object`: 可观察到的触发事件。
-   `debugObjectName`: 可观察到的触发事件的名称 (为调试准备)。
-   `observableKind`: 可观察的对象类型 (value, set, array, object, map, computed)。
-   `type` (string):当前的事件类型。

这些是每种类型其他可用的字段:

| 可观察的对象类型              | 事件类型 | 属性     | 描述                                                                                       | 在拦截阶段是否可用 | 在拦截阶段是否可被修改 |
| ---------------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| Object                       | add        | name         | 要添加的属性的名称                                                                                  | √                          |                              |
|                              |            | newValue     | 将要变更成为的新值                                                                                  | √                          | √                            |
|                              | update\*   | name         | 要添加的属性的名称                                                                                  | √                          |                              |
|                              |            | newValue     | 将要变更成为的新值                                                                                  | √                          | √                            |
|                              |            | oldValue     | 将被替换的旧值                                                                                      |                            |                              |
| Array                        | splice     | index        | 通过迭代器触发索引变化的方法， 包括 `push`, `unshift`, `replace`, 等                                   | √                          |                              |
|                              |            | removedCount | 被删除的数量统计                                                                                     | √                          | √                            |
|                              |            | added        | 已经添加的数组元素                                                                                   | √                          | √                            |
|                              |            | removed      | 被移除的数组元素                                                                                     |                            |                              |
|                              |            | addedCount   | 添加的元素数量                                                                                       |                            |                              |
|                              | update     | index        | 被更新的索引                                                                                         | √                          |                              |
|                              |            | newValue     | 将会被合并的新值                                                                                     | √                          | √                            |
|                              |            | oldValue     | 将会被取代的旧值                                                                                   |                            |                              |
| Map                          | add        | name         | 添加的元素的名称                                                                                      | √                          |                              |
|                              |            | newValue     | 被添加的新值                                                                                        | √                          | √                            |
|                              | update     | name         | 正在更新的元素名称                                                                                  | √                          |                              |
|                              |            | newValue     | 被更新的元素值                                                                                       | √                          | √                            |
|                              |            | oldValue     | 被更新取代的旧值                                                                                     |                            |                              |
|                              | delete     | name         | 被删除元素的名称                                                                                     | √                          |                              |
|                              |            | oldValue     | 被删除元素的旧值                                                                                     |                            |                              |
| Boxed & computed observables | create     | newValue     | 在创建过程中分配的值， 仅在boxed observables的 `spy` event 起效                                         |                            |                              |
|                              | update     | newValue     | 将被合并的新值                                                                                         | √                          | √                            |
|                              |            | oldValue     | 可观察的旧值                                                                                         |                            |                              |

**注意:** 对象的 `update` 事件不会触发更新（computed），他们不是变更 (mutations)。但是可以通过使用指定`observe`监听特定属性来监听它们的改变：`observe(object, 'computedPropertyName', listener)`。
