---
title: Creating observable state
sidebar_label: Observable state
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建 observable state

属性、整个对象、数组、Map、Set 都可以被设置为 observable。
使对象可观察的基础是使用 `makeObservable` 为每个属性指定一个注解。最重要的注解是:

-   `observable` 定义 store state 的可跟踪字段。
-   `action` 将方法标记为修改状态的操作。
-   `computed` 标记一个 getter，该 getter 将从 state 派生新的事实并缓存其输出

Array、Maps、Sets 之类的集合将自动被观察到。

## `makeObservable`

使用:

-   `makeObservable(target, annotations?, options?)`

它可以用来捕获 _现有_ 对象属性并使它们成为 observable。任何 JavaScript 对象（包括 class 实例）都可以传递到 `target`。
通常，`makeObservable` 是在 class 的 constructor 中使用的，它的第一个参数是 this。
`annotation` 参数将 [注解](#available-annotations) 到每个成员上，使用 [装饰器](enabling-decorators.md) 时，可以省略 `annotation` 参数。

派生信息并接受参数的方法（例如：`findUsersOlderThan(age: number): User[]`） 不需要任何的 `annotation`。当从一个 reaction 调用它们时，它们的读操作任然会被跟踪，但是不会记住它们的输出，以避免内存泄漏。也可以查看 [MobX-utils computedFn {🚀}](https://github.com/mobxjs/mobx-utils#computedfn)

通过 `override annotation` 以 [支持 Subclassing，但有一些限制](subclassing.md)
[Subclassing is supported with some limitations](subclassing.md) via `override` annotation.

<!--DOCUSAURUS_CODE_TABS-->
<!--class + makeObservable-->

```javascript
import { makeObservable, observable, computed, action } from "mobx"

class Doubler {
    value

    constructor(value) {
        makeObservable(this, {
            value: observable,
            double: computed,
            increment: action,
            fetch: flow
        })
        this.value = value
    }

    get double() {
        return this.value * 2
    }

    increment() {
        this.value++
    }

    *fetch() {
        const response = yield fetch("/api/value")
        this.value = response.json()
    }
}
```

**所有 annotated** 字段是 **non-configurable**。<br>
**所有 non-observable** (stateless) 字段 (`action`, `flow`) 是 **non-writable**.

<!--factory function + makeAutoObservable-->

```javascript
import { makeAutoObservable } from "mobx"

function createDoubler(value) {
    return makeAutoObservable({
        value,
        get double() {
            return this.value * 2
        },
        increment() {
            this.value++
        }
    })
}
```

注意，class 也可以利用 `makeAutoObservable`。
实例中的差异只是演示了如何将 Mobx 应用不同的编程风格。

<!--observable-->

```javascript
import { observable } from "mobx"

const todosById = observable({
    "TODO-123": {
        title: "找到一个体面的任务管理系统",
        done: false
    }
})

todosById["TODO-456"] = {
    title: "关闭所有两周以上的门票",
    done: true
}

const tags = observable(["高价", "均价", "廉价"])
tags.push("价格: 开玩笑的")
```

与第一个例子中的 `makeObservable` 不同，`observable` 支持向对象添加（和删除）_字段_。
这使得 `observable` 非常适合用于动态键 Object、Array、Maps、Sets 之类的集合。

<!--END_DOCUSAURUS_CODE_TABS-->

## `makeAutoObservable`

使用:

-   `makeAutoObservable(target, overrides?, options?)`

`makeAutoObservable` 就像 steroids 上的 `makeObservable`，因为它会默认推断出所有的属性。您仍然可以使用 `overrides` 来覆盖特定 annotations 的默认行为。
特别的，`false` 可以用来排除一个属性或者方法被完全处理。
查看上面的代码选项卡以获得一个实例。
与使用 `makeObservable` 相比，`makeAutoObservable` 函数更紧凑，更容易维护，因为新成员不需要显式地提到。
然而，`makeAutoObservable` 不能用于具有父类或者[子类](subclassing.md)的 class。

推理规则：

-   任何包含函数值的（继承的）成员都将使用 `autoAction` 进行注解。
-   任何 `get`ter 都将使用 `computed` 进行注解。
-   任何其他的 _own_ 字段都会被标记为 `observable`。
-   任何（继承的）生成器函数成员都将使用 `flow` 进行注解。（注意，在某些编译器配置中，生成器函数是检测不到到，如果 `flow` 没有像预期的那样工作，请确保显式指定 `flow`）
-   在 `overrides` 参数中标记为 `false` 的成员将不会被注解。例如，将其用于标识符等只读字段。

## `observable`

使用:

-   `observable(source, overrides?, options?)`

`observable` 注解也可以作为一个函数来调用，让整个对象同时成为可观察对象。
`source` 对象将被克隆，所有成员都将成为可观察对象，类似于 `makeAutoObservable`。
同样，可以提供 `overrides` map 来指定特定成员的注解。
查看上面的代码块作为示例。

`observable` 对象返回的对象将是一个代理，这意味着稍后添加到该对象中的属性也将被拾取并成为可观察对象(除非禁用了[使用代理](configuration.md#proxy-support))。

`observable` 方法也可以通过 [arrays](api.md#observablearray), [Maps](api.md#observablemap) and [Sets](api.md#observableset) 等集合类型来调用。他们也将被克隆，并转换成可观察到的对等体。

<details id="observable-array"><summary>**例子：** observable array<a href="#observable-array" class="tip-anchor"></a></summary>

下面的例子创建了一个可观察对象，并使用 [`autorun`](reactions.md#autorun) 来观察它。
处理Map和Set集合的工作原理类似。

```javascript
import { observable, autorun } from "mobx"

const todos = observable([
    { title: "泡茶", completed: true },
    { title: "煮咖啡", completed: false }
])

autorun(() => {
    console.log(
        "剩下的：",
        todos
            .filter(todo => !todo.completed)
            .map(todo => todo.title)
            .join(", ")
    )
})
// 打印: '剩下的：煮咖啡'

todos[0].completed = false
// 打印: '剩下的：泡茶, 煮咖啡'

todos[2] = { title: "打个盹", completed: false }
// 打印: '剩下的：泡茶, 煮咖啡, 打个盹'

todos.shift()
// 打印: '剩下的：煮咖啡, 打个盹'
```

可观察数组还有一些额外的实用功能：

-   `clear()` 从数组中删除所有当前条目。
-   `replace(newItems)` 用新条目替换数组中的所有现有条目。
-   `remove(value)` 按值从数组中移除单个项。如果找到并删除了项目，则返回 `true`。

</details>

<details id="non-convertibles"><summary>**注意:** 原始值 和 class 实例永远不会转换为 observables<a href="#non-convertibles" class="tip-anchor"></a></summary>

原始值不能被 Mobx 观察到，因为它们在 JavaScript 中是不可变的(但它们可以被 [boxed](api.md#observablebox))。
尽管这种机制在 library 之外通常没有用处。

通过将 class 实例传递给 `Observable` 或将其分配给 `Observable` 属性，它们将永远不会自动变为可观察的状态。
使 class 成员可观察是 class constructor 函数的责任。

</details>

<details id="avoid-proxies"><summary>{🚀} **提示:** observable (已代理) 和 makeObservable (未代理)<a href="#avoid-proxies" class="tip-anchor"></a></summary>

`make(Auto)Observable` 和 `observable` 之间的主要区别在于，前端会修改作为第一个参数传递的对象，而 `observable` 会创建一个可观察的 _克隆_。

第二个区别是，`observable` 创建了一个 [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 对象，以便在使用该对象作为动态查找映射时能够捕捉未来添加的属性。
如果你想让可观察的对象具有一个常规的结构，其中所有的成员都是事先已知的，我们建议使用 `makeObservable`，因为非代理对象速度稍快，而且它们更容易在 `debugger` 和 `console.log` 中检查。

因此，建议在工厂函数中使用 `make(Auto)Observable`。请注意，可以将 `{ proxy: false }` 作为选项传递给O `observable` 以获得非代理克隆。

</details>

## 可用的注解

| 注解                         | 说明                                                                                                                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observable`<br/>`observable.deep` | Defines a trackable field that stores state. Any value assigned to an `observable` field will be made recursively observable as well, if possible. That is, if and only if the value is a plain object, array, Map or Set. |
| `observable.ref`                   | Like `observable`, but only reassignments will be tracked. The assigned values themselves won't be made observable automatically. For example, use this if you intend to store immutable data in an observable field.      |
| `observable.shallow`               | Like `observable.ref` but for collections. Any collection assigned will be made observable, but the contents of the collection itself won't become observable.                                                             |
| `observable.struct`                | Like `observable`, except that any assigned value that is structurally equal to the current value will be ignored.                                                                                                         |
| `action`                           | Mark a method as an action that will modify the state. Check out [actions](actions.md) for more details. Non-writable.                                                                                                     |
| `action.bound`                     | Like action, but will also bind the action to the instance so that `this` will always be set. Non-writable.                                                                                                                |
| `computed`                         | Can be used on a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) to declare it as a derived value that can be cached. Check out [computeds](computeds.md) for more details.      |
| `computed.struct`                  | Like `computed`, except that if after recomputing the result is structurally equal to the previous result, no observers will be notified.                                                                                  |
| `true`                             | Infer the best annotation. Check out [makeAutoObservable](#makeautoobservable) for more details.                                                                                                                           |
| `false`                            | Explicitly do not annotate this property.                                                                                                                                                                                  |
| `flow`                             | Creates a `flow` to manage asynchronous processes. Check out [flow](actions.md#using-flow-instead-of-async--await-) for more details. Note that the inferred return type in TypeScript might be off. Non-writable.         |
| `override`                         | [Applicable to inherited `action`, `flow`, `computed`, `action.bound` overriden by subclass](subclassing.md).                                                                                                              |
| `autoAction`                       | Should not be used explicitly, but is used under the hood by `makeAutoObservable` to mark methods that can act as action or derivation, based on their calling context.                                                    |

## Limitations

1. `make(Auto)Observable` only supports properties that are already defined. Make sure your [**compiler configuration** is correct](installation.md#use-spec-compliant-transpilation-for-class-properties), or as work-around, that a value is assigned to all properties before using `make(Auto)Observable`. Without correct configuration, fields that are declared but not initialized (like in `class X { y; }`) will not be picked up correctly.
1. `makeObservable` can only annotate properties declared by its own class definition. If a sub- or superclass introduces observable fields, it will have to call `makeObservable` for those properties itself.
1. `options` argument can be provided only once. Passed `options` are _"sticky"_ and can NOT be changed later (eg. in [subclass](subclassing.md)).
1. **Every field can be annotated only once** (except for `override`). The field annotation or configuration can't change in [subclass](subclassing.md).
1. **All annotated** fields of non-plain objects (**classes**) are **non-configurable**.<br>
   [Can be disabled with `configure({ safeDescriptors: false })` {🚀☣️} ](configuration.md#safedescriptors-boolean).
1. **All non-observable** (stateless) fields (`action`, `flow`) are **non-writable**.<br>
   [Can be disabled with `configure({ safeDescriptors: false })` {🚀☣️} ](configuration.md#safedescriptors-boolean).
1. [Only **`action`, `computed`, `flow`, `action.bound`** defined **on prototype** can be **overriden** by subclass](subclassing.md).
1. By default _TypeScript_ will not allow you to annotate **private** fields. This can be overcome by explicitly passing the relevant private fields as generic argument, like this: `makeObservable<MyStore, "privateField" | "privateField2">(this, { privateField: observable, privateField2: observable })`
1. **Calling `make(Auto)Observable`** and providing annotations must be done **unconditionally**, as this makes it possible to cache the inference results.
1. **Modifying prototypes** after **`make(Auto)Observable`** has been called is **not supported**.
1. _EcmaScript_ **private** fields (**`#field`**) are **not supported**. When using _TypeScript_, it is recommended to use the `private` modifier instead.
1. **Mixing annotations and decorators** within single inheritance chain is **not supported** - eg. you can't use decorators for superclass and annotations for subclass.
1. `makeObservable`,`extendObservable` cannot be used on other builtin observable types (`ObservableMap`, `ObservableSet`, `ObservableArray`, etc)
1. `makeObservable(Object.create(prototype))` copies properties from `prototype` to created object and makes them `observable`. This behavior is wrong, unexpected and therefore **deprecated** and will likely change in future versions. Don't rely on it.

## Options {🚀}

The above APIs take an optional `options` argument which is an object that supports the following options:

-   **`autoBind: true`** uses `action.bound` by default, rather than `action`. Does not affect explicitely annotated members.
-   **`deep: false`** uses `observable.ref` by default, rather than `observable`. Does not affect explicitely annotated members.
-   **`name: <string>`** gives the object a debug name that is printed in error messages and reflection APIs. Ignored on production.
-   **`proxy: false`** forces `observable(thing)` to use non-[**proxy**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) implementation. This is a good option if the shape of the object will not change over time, as non-proxied objects are easier to debug and faster. See [avoiding proxies](#avoid-proxies).

<details id="one-options-per-target"><summary>**Note:** options are *sticky* and can be provided only once<a href="#one-options-per-target" class="tip-anchor"></a></summary>
`options` argument can be provided only for `target` that is NOT observable yet.<br>
It is NOT possible to change options once the observable object was initialized.<br>
Options are stored on target and respected by subsequent `makeObservable`/`extendObservable` calls.<br>
You can't pass different options in [subclass](subclassing.md).
</details>

## Converting observables back to vanilla JavaScript collections

Sometimes it is necessary to convert observable data structures back to their vanilla counterparts.
For example when passing observable objects to a React component that can't track observables, or to obtain a clone that should not be further mutated.

To convert a collection shallowly, the usual JavaScript mechanisms work:

```javascript
const plainObject = { ...observableObject }
const plainArray = observableArray.slice()
const plainMap = new Map(observableMap)
```

To convert a data tree recursively to plain objects, the [`toJS`](api.md#tojs) utility can be used.
For classes, it is recommend to implement a `toJSON()` method, as it will be picked up by `JSON.stringify`.

## A short note on classes

So far most examples above have been leaning towards the class syntax.
MobX is in principle unopinionated about this, and there are probably just as many MobX users that use plain objects.
However, a slight benefit of classes is that they have more easily discoverable APIs, e.g. TypeScript.
Also, `instanceof` checks are really powerful for type inference, and class instances aren't wrapped in `Proxy` objects, giving them a better experience in debuggers.
Finally, classes benefit from a lot of engine optimizations, since their shape is predictable, and methods are shared on the prototype.
But heavy inheritance patterns can easily become foot-guns, so if you use classes, keep them simple.
So, even though there is a slight preference to use classes, we definitely want to encourage you to deviate from this style if that suits you better.
