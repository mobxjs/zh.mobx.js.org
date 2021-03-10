---
title: 拦截器与监听器（Intercept & Observe）
sidebar_label: 拦截器与监听器（Intercept & Observe） {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 拦截器与监听器（Intercept & Observe） {🚀}

_⚠️ **警告**: 拦截器 和 监听器是低等级方法, 他们不应该被应用在正式的开发中。可以考虑使用 [reaction](reactions.md),因为 `observe` 不遵循事务原则也不支持对深层级的对象变动的监听.使用这种方法是一种反面模式（anti-pattern）. 如果你想使用 `observe`来获取新值和旧的值,  请考虑优先使用[`reaction`](reactions.md#reaction)。 ⚠️_

`observe` 和 `intercept` 可以用来监视单个可被观察的对象的变化，但是它们 **_不适合_** 用来跟踪嵌套的可观察对象。
-   `intercept` 可用于在对象在发生变更之前进行拦截，从而做到验证修改，统一变更，取消变更(validating, normalizing or cancelling)。
-   `observe` 允许你在数据发生更改后监听到更改。

## 拦截器（Intercept）

方法声明: `intercept(target, propertyName?, interceptor)`

_请避免使用此API. 大体上讲它提供了一种面向切面编程的方案（aspect-oriented programming）, 它是在数据流任何更新状态  **之前** （而不是在更新过程中）进行数据验证，所以很难进行调试。_

-   `target`: 可被拦截到的对象.
-   `propertyName`: 可选参数，用于指定要拦截的特定的对象属性。请注意，这里`intercept(user.name, interceptor)`与`intercept(user, "name", interceptor)`有本质上的不同。第一种尝试将拦截器添加到 _当前的_ `value`而不是 `user.name`，这可能导致 `user.name` 的变化根本无法被拦截到。后者则是对`user`的`name` 属性进行拦截。 
-   `interceptor`: 回调函数，在可观察对象  _每次 _ 发生变更都会被调用。入参是一个描述具体发生了什么变更的对象。

拦截器 `intercept` 必须告诉MobX如何对当前要发生的变更进行处理，因此，它应该具有下列操作中的一种：

1. 直接返回回调函数的入参`change`对象，这种情况下变更会被接受。
2. 修改回调函数的入参 `change` 对象并返回它, 比如你可以格式化数据. 并非所有的数据都是可以修改的，可以参照下面的代码样例。
3. 返回 `null`, 这意味着变更不会发生，而是会被忽略,这是一个非常强大的概念。他意味着你可以让你的对象变得完全不可变（immutable）。
4. 当发生的变更不符合你的要求的时候，你可以抛出一些异常。

这个方法会返回一个`disposer` 函数，你可以调用这个方法来注销拦截器。
有可能你会注册多个拦截器到一个可观察的对象上，他们将会被按照注册的顺序链式调用。
如果这些拦截器中的一个返回 `null` 或者抛出异常, 那么剩下的拦截器将不会被继续触发。
你有可能同时在父对象（即原型·译者注）和私有属性（实例属性·译者注）上同时注册了拦截器，那么拦截器会先执行注册在父对象上的，再执行私有属性上的。

```javascript
const theme = observable({
    backgroundColor: "#ffffff"
})

const disposer = intercept(theme, "backgroundColor", change => {
    if (!change.newValue) {
        // 忽略未设置的颜色变更.
        return null
    }
    if (change.newValue.length === 6) {
        // 增加忽略的修饰前缀 `#`
        change.newValue = "#" + change.newValue
        return change
    }
    if (change.newValue.length === 7) {
        // oh 这是一个被格式化好的颜色代码!
        return change
    }
    if (change.newValue.length > 10) {
        // 注销拦截器.
        disposer()
    }
    throw new Error("哦我的上帝啊，这看起来不像是一种颜色: " + change.newValue)
})
```

## 监听器(Observe)

方法声明: `observe(target, propertyName?, listener, invokeImmediately?)`

_参阅上述声明, 请避免使用此API 并改用 [`reaction`](reactions.md#reaction) 。_

-   `target`: 可被观察到的对象。
-   `propertyName`: 可选参数，用于指定要监听的特定的对象属性。请注意，这里 `observe(user.name, listener)` 与 `observe(user, "name", listener)`有本质上的不同,
第一种尝试将监听器添加到 _当前的_  `value` 而不是 `user.name`, 这可能导致`user.name` 的变化根本无法被监听到。后者则是对`user`的`name`属性进行监听。
-   `listener`: 回调函数，在可观察对象  _每次 _ 发生变更都会被调用。入参是一个描述具体发生了什么变更的对象。包装对象（boxed observables）除外，它会调用回调函数的两个参数： `newValue, oldValue`
-   `invokeImmediately`: 默认值为 _false_ . 如果你想让监听器 `observe` 的 `listener`回调函数立即执行, 而不是等待监听到第一次变化后触发. 可以将它设置为 _true_ 。
目前（现在）所有的观察对象类型都不支持.

这个方法会返回一个`disposer` 函数，你可以调用这个方法来注销监听器。
请注意，`transaction` 不会影响`observe`方法的工作。
这意味着即使在事务内部，`observe`也会针对每个变更触发监听。因此，通常可以使用更健壮的和声明类型的 [`autorun`](reactions.md#autorun)替代`observe`方法。


_`observe` 会在他们发生 **变更（mutations）** 时产生响应, `autorun` or `reaction` 会对 **新值（new values）** 产生时做出响应。 大多数情况下，这就足够了。_

Example:

```javascript
import { observable, observe } from "mobx"

const person = observable({
    firstName: "Maarten",
    lastName: "Luther"
})

// 监听所有字段.
const disposer = observe(person, change => {
    console.log(change.type, change.name, "from", change.oldValue, "to", change.object[change.name])
})

person.firstName = "Martin"
// 打印: 'update firstName from Maarten to Martin'

// 注销监听器.
disposer()

// 监听单个字段.
const disposer2 = observe(person, "lastName", change => {
    console.log("LastName changed to ", change.newValue)
})
```

相关文章: [Object.observe已死，mobx.observe当立（Object.observe is dead. Long live mobx.observe）](https://medium.com/@mweststrate/object-observe-is-dead-long-live-mobservable-observe-ad96930140c5)

## Event overview

The callbacks of `intercept` and `observe` will receive an event object which has at least the following properties:

-   `object`: the observable triggering the event.
-   `debugObjectName`: the name of the observable triggering the event (for debugging).
-   `observableKind`: the type of the observable (value, set, array, object, map, computed).
-   `type` (string): the type of the current event.

These are the additional fields that are available per type:

| Observable type              | Event type | Property     | Description                                                                                       | Available during intercept | Can be modified by intercept |
| ---------------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| Object                       | add        | name         | Name of the property being added.                                                                 | √                          |                              |
|                              |            | newValue     | The new value being assigned.                                                                     | √                          | √                            |
|                              | update\*   | name         | Name of the property being updated.                                                               | √                          |                              |
|                              |            | newValue     | The new value being assigned.                                                                     | √                          | √                            |
|                              |            | oldValue     | The value that is replaced.                                                                       |                            |                              |
| Array                        | splice     | index        | Starting index of the splice. Splices are also fired by `push`, `unshift`, `replace`, etc.        | √                          |                              |
|                              |            | removedCount | Amount of items being removed.                                                                    | √                          | √                            |
|                              |            | added        | Array with items being added.                                                                     | √                          | √                            |
|                              |            | removed      | Array with items that were removed.                                                               |                            |                              |
|                              |            | addedCount   | Amount of items that were added.                                                                  |                            |                              |
|                              | update     | index        | Index of the single entry being updated.                                                          | √                          |                              |
|                              |            | newValue     | The newValue that is / will be assigned.                                                          | √                          | √                            |
|                              |            | oldValue     | The old value that was replaced.                                                                  |                            |                              |
| Map                          | add        | name         | The name of the entry that was added.                                                             | √                          |                              |
|                              |            | newValue     | The new value that is being assigned.                                                             | √                          | √                            |
|                              | update     | name         | The name of the entry being updated.                                                              | √                          |                              |
|                              |            | newValue     | The new value that is being assigned.                                                             | √                          | √                            |
|                              |            | oldValue     | The value that has been replaced.                                                                 |                            |                              |
|                              | delete     | name         | The name of the entry being removed.                                                              | √                          |                              |
|                              |            | oldValue     | The value of the entry that was removed.                                                          |                            |                              |
| Boxed & computed observables | create     | newValue     | The value that was assigned during creation. Only available as `spy` event for boxed observables. |                            |                              |
|                              | update     | newValue     | The new value being assigned.                                                                     | √                          | √                            |
|                              |            | oldValue     | The previous value of the observable.                                                             |                            |                              |

**Note:** object `update` events won't fire for updated computed values (as those aren't mutations). But it is possible to observe them by explicitly subscribing to the specific property using `observe(object, 'computedPropertyName', listener)`.
