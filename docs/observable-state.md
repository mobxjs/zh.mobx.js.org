---
title: 创建可观察状态
sidebar_label: 可观察状态
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建可观察状态

属性，完整的对象，数组，Maps 和 Sets 都可以被转化为可观察对象。
使得对象可观察的关键是使用 `makeObservable` 为每个属性指定特殊的注解。
最重要的注解如下：

-   `observable` 定义一个存储在 state 中的可追踪字段。
-   `action` 将一个可以修改 state 的方法标记为 action。
-   `computed` 标记一个可以由 state 派生处新的值并且缓存输出的 getter。

像数组，Maps 和 Sets 这样的集合都可以被自动地转化为可观察对象。

## `makeObservable`

使用：

-   `makeObservable(target, annotations?, options?)`

这个函数可以捕获_已经存在_的对象属性并且使得他们可观察。任何 JavaScript 对象（包括类的实例）都可以作为 `target` 被传递给这个函数。
一般情况下，在类的构建函数中调用 `makeObservable` 函数，并且将 `this` 作为其第一个参数。
`annotations` 参数将会为每一个成员映射 [注解](#available-annotations)。需要注意的是，当使用 [装饰器](enabling-decorators.md) 时，`annotations` 参数将会被忽略。

派生额外信息和接受参数的方法（例如：`findUsersOlderThan(age: number): User[]`）不需要任何注解。
它们的读取操作被其他副作用调用时仍然会被跟踪，但是它们输出出于避免内存泄漏的目的将不会被记录。更详细的信息可以查看 [MobX-utils computedFn {🚀}](https://github.com/mobxjs/mobx-utils#computedfn)。

通过 `override` 注解 [支持的子类有一些限制](subclassing.md)。

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

**所有带注释** 的字段都是 **不可配置的**。<br>
**所有的不可观察**（stateless）的字段（`action`, `flow`）都是 **不可写的**。

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

注意，类也可以利用 `makeAutoObservable`。
示例中的差异仅说明如何将 MobX 应用于不同的编程风格。

<!--observable-->

```javascript
import { observable } from "mobx"

const todosById = observable({
    "TODO-123": {
        title: "find a decent task management system",
        done: false
    }
})

todosById["TODO-456"] = {
    title: "close all tickets older than two weeks",
    done: true
}

const tags = observable(["high prio", "medium prio", "low prio"])
tags.push("prio: for fun")
```

与第一个使用 `makeObservable` 的示例相反，`observable` 支持向对象添加（删除）字段。
这对于动态对象，数组，Maps 和 Sets 之类的集合而言，极大的提升了它们的 `可观察性`。

<!--END_DOCUSAURUS_CODE_TABS-->

## `makeAutoObservable`

使用：

-   `makeAutoObservable(target, overrides?, options?)`

`makeAutoObservable` 类似于 `makeObservable`，在默认情况下它将推断所有的属性。你仍然可以使用 `overrides` 重写某些注解的默认行为。
特别的，`false` 可用于在自动处理中排除一个属性或方法。
查看上面的代码获取示例。
因为不需要显式地提及新成员，所以使用 `makeAutoObservable` 函数比使用 `makeObservable` 函数，会写更少的代码，且更容易维护。
然而，`makeAutoObservable` 不能被用于具有 super 的 [子类](subclassing.md)。

推断规则：

-   任何（包含继承的）是 `function` 的成员都将使用 `autoAction` 注解标记。
-   任何 `get`ter 都将使用 `computed` 注解标记。
-   任何其他的_自有_字段都将使用 `observable` 注解标记。
-   任何（包含继承的）的 generator 函数都将使用 `flow` 注解标记。（需要注意，在某些编译器配置中无法检测到 generator 函数，如果 flow 不能正常运行，请明确的指定 `flow` 注解。）
-   在 `overrides` 参数中标记为 `false` 的成员将不会被添加注解。例如，将其用于像标识符这样的只读字段。

## `observable`

使用：

-   `observable(source, overrides?, options?)`

`observable` 注解可以作为一个函数进行调用，从而将整个对象立刻变成可观察的。
`source` 对象将会被克隆并且所有的成员都将会成为可观察的，类似于 `makeAutoObservable` 做的那样。
同样的，`overrides` 对象可以为特定的对象提供特定的注解。
查看上面的代码获取示例。

由 `observable` 返回的对象将会使用 Proxy 包装，这意味着之后被添加到这个对象中的属性也将被侦测并使其转化为可观察对象（除非禁用 [proxy](configuration.md#proxy-support)）。

`observable` 方法也可以被像 [arrays](api.md#observablearray)，[Maps](api.md#observablemap) 和 [Sets](api.md#observableset) 这样的集合调用。这些集合也将被克隆并转化为可观察对象。

<details id="observable-array"><summary>**例子：** 可观察数组<a href="#observable-array" class="tip-anchor"></a></summary>

下面的例子创建了一个可观察对象并且使用 [`autorun`](reactions.md#autorun) 观察它。
可以使用类似的方法与 Map 和 Set 等集合一同工作。

```javascript
import { observable, autorun } from "mobx"

const todos = observable([
    { title: "Spoil tea", completed: true },
    { title: "Make coffee", completed: false }
])

autorun(() => {
    console.log(
        "Remaining:",
        todos
            .filter(todo => !todo.completed)
            .map(todo => todo.title)
            .join(", ")
    )
})
// 打印: 'Remaining: Make coffee'

todos[0].completed = false
// 打印: 'Remaining: Spoil tea, Make coffee'

todos[2] = { title: "Take a nap", completed: false }
// 打印: 'Remaining: Spoil tea, Make coffee, Take a nap'

todos.shift()
// 打印: 'Remaining: Make coffee, Take a nap'
```

可观察的数组还有一些额外的使用函数：

-   `clear()` 从数组中清除所有元素。
-   `replace(newItems)` 将数组中现有的成员全部替换成 newItems。
-   `remove(value)` 根据 value 从数组中删除一个元素。如果找到并删除了元素，返回  `true`。

</details>

<details id="non-convertibles"><summary>**注意：** 原始值和类的实例永远不会被转化为可观察对象<a href="#non-convertibles" class="tip-anchor"></a></summary>

MobX 无法使原始值可观察，因为他们在 JavaScript 中是不可变的（但是可以将他们 [包装](api.md#observablebox)）。
尽管在通常情况下不会在 MobX 的外部使用这样的机制。

即使将类的实例传递给 `observable` 或者将其分配给一个 `observable` 属性，类的实例也永远不会成为可观察对象。
在类的构造函数中使得类成员成为可观察对象。

</details>

<details id="avoid-proxies"><summary>{🚀} **提示：** observable（proxied）与 makeObservable（unproxied）<a href="#avoid-proxies" class="tip-anchor"></a></summary>

`make(Auto)Observable` 和 `observable` 之间最主要的区别在于，`make(Auto)Observable` 修改你在第一个参数位传递的对象，而 `observable` 创建一个可观察的 _clone_ 对象。

第二个区别是，`observable` 创建一个 [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 对象， 以便在将该对象用作动态查找图时能够捕获将要添加的属性。
如果将要转化为可观察的对象有既定的结构，换句话说其中的所有成员都是预先知道的，我们推荐使用 `makeObservable`，因为非代理对象具有更快的速度，并且更容易在 debugger 中进行追踪检查，并且可以使用 `console.log` 方便地进行打印。

因此，`make(Auto)Observable` 推荐在工厂函数中使用。
值得一提的是，可以将 `{ proxy: false }` 作为 option 传递给 `observable` 获取非代理的克隆。

</details>

## 可用的注解

| 注解                               | 描述                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `observable`<br/>`observable.deep` | 定义一个存储 state 的可跟踪字段。如果可能，任何被声明为 `observable` 的字段都将是递归可观察的。也就是说，当且仅当值是纯对象，数组，Map 和 Set 时是递归可观察的。 |
| `observable.ref`                   | 类似于 `observable`，但是仅会跟踪重新分配空间的变化。分配的值本身将不会自动变为可观察的。例如，你打算将不可变数据存储在可观察字段中，请使用这个注解。 |
| `observable.shallow`               | 类似于 `observable.ref` 但是是针对集合的。任何集合的声明都会是可观察的，但是他们内容的并不会成为可观察的。 |
| `observable.struct`                | 类似于 `observable`，除了结构上与当前值相同的值，其他的值都将被忽略。 |
| `action`                           | 使得函数成为可以修改 state 的 action。查看 [actions](actions.md) 获取更多信息。不可写。 |
| `action.bound`                     | 类似于 action，但是会将 action 绑定到实例，因此将始终设置 `this`。不可写。 |
| `computed`                         | 可以作为 [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 使用，将其声明为可缓存的派生值。查看 [computeds](computeds.md) 获取更多信息。 |
| `computed.struct`                  | 类似于 `computed`，除了计算之后结果在结构上相当于之前的结果，否则不会通知观察者。 |
| `true`                             | 推断最佳注解。查看 [makeAutoObservable](#makeautoobservable) 获取更多信息。 |
| `false`                            | 不使用注解注释此属性。                                       |
| `flow`                             | 创建一个 `flow` 管理一部进程。查看 [flow](actions.md#using-flow-instead-of-async--await-) 获取更多信息。需要注意的是，在 TypeScript 中的返回类型推断可能无效。 不可写。 |
| `override`                         | [用于子类覆盖继承的 `action`，`flow`，`computed`，`action.bound`](subclassing.md)。 |
| `autoAction`                       | 不应显式使用，而应由 `makeAutoObservable` 自动调用，以根据调用上下文将方法标识为 action 或者派生值。 |

## 限制

1. `make(Auto)Observable` 仅支持已经定义的属性。确保你的 [**编译器选项**是正确的](installation.md#use-spec-compliant-transpilation-for-class-properties)，或者在使用 `make(Auto)Observable` 之前确保已经为所有属性分配了值。如果没有正确的配置，已经声明但是没有初始化的值（例如：`class X { y; }`）将不能被自动侦测到。
1. `makeObservable` 只能注解类定义本身声明的属性。如果在子类或者超类中引入了可观察字段，则必需为那些属性本身调用 `makeObservable`。
1. `options` 参数只能提供一次。传递的 `options` 是 _“sticky”_ 的，以后不能被更改（例如，在 [子类](subclassing.md) 中）。
1. **每个字段只能被注解一次**（`override` 除外）。字段注解和配置不能在 [子类](subclassing.md) 中改变。
1. 非纯对象（**classes**）的 **所有注解** 字段都是 **不可配置的**。<br>
   [可以通过 `configure({ safeDescriptors: false })` 来禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
1. **所有不可观察**（stateless）字段（`action`，`flow`）都是 **不可写的**。<br>
   [可以通过 `configure({ safeDescriptors: false })` 来禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
1. [只有定义在**原型**上的 **`action`，`computed`，`flow`，`action.bound`** 可以在子类中被 **overriden**](subclassing.md)。
1. 默认情况下 _TypeScript_ 不允许注解 **private** 字段。可以通过将相关私有字段显式传递为参数来解决，例如： `makeObservable<MyStore, "privateField" | "privateField2">(this, { privateField: observable, privateField2: observable })`。
1. **优先调用 `make(Auto)Observable`** 并提供注解，这样可以缓存推测结果。
1. **不支持** 在调用 **`make(Auto)Observable`** 之后 **修改原型**。
1. _EcmaScript_ 的 **private** 字段（**`#field`**）**不受支持**。当使用 _TypeScript_ 时，推荐使用 `private` 修饰符。
1. **不支持** 在单个继承链中 **混合使用注解和装饰器** - 例如，在超类中使用了装饰器，不能再子类中使用注解。
1. `makeObservable`，`extendObservable` 不能再其它内置可观察类型上使用（`ObservableMap`，`ObservableSet`，`ObservableArray` 等）。
1. `makeObservable(Object.create(prototype))` 将属性从 `prototype` 拷贝到新创建的对象并且使得其是可观察的。此行为是错误的、不可预测的，因此将会在将来的版本中被 **废弃**。不要使用它。

## Options {🚀}

上面的 API 都有一个可选的 `options` 参数，该参数是包含一下字段的对象：

-   **`autoBind: true`** 默认使用 `action.bound`，而不使用 `action`。不影响显式注释的成员。
-   **`deep: false`** 默认使用 `observable.ref`，而不使用 `observable`。不影响显式注释的成员。
-   **`name: <string>`** 为对象提供一个调试名称，该名称将打印在错误消息和 reflection API 中。在生产中将被忽略。
-   **`proxy: false`** 强制 `observable(thing)` 使用非 [**proxy**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 的实现。如果对象的结构不会随着时间变化，这是一个很好的选择，因为非代理对象更容易调试并且具有更快的是速度。请参见 [避免代理](#avoid-proxies)。

<details id="one-options-per-target"><summary>**注意：** options 是 *sticky* 并且只能被提供一次<a href="#one-options-per-target" class="tip-anchor"></a></summary>
`options` 参数可以在 `target` 还不是可观察对象时提供。<br>
一旦可观察对象被初始化，将无法更改 options。<br>
options 被保存在 target 上并且在之后的 `makeObservable`/`extendObservable` 调用中将会被保持。<br>
你不能在 [subclass](subclassing.md) 子类中传递不同的 options。
</details>

## 将可观察变量转化回原始 JavaScript 集合

有时有必要将可观察的数据结构转换回原始的数据结构。
例如，当将可观察对象传递到无法跟踪可观察对象的 React 组件时，或这想要获得将来不会改变的数据的克隆时。

要进行浅转换，一些常用的 JavaScript 语法糖会非常有用：

```javascript
const plainObject = { ...observableObject }
const plainArray = observableArray.slice()
const plainMap = new Map(observableMap)
```

要将数据树递归地转换为普通对象，可使用 [`toJS`](api.md#tojs) 工具函数。
对于类，建议实现一个 `toJSON()` 方法，将会由 `JSON.stringify`调用。

## 关于类的说明

到目前为止，以上大多数示例都倾向于使用类进行构建。
MobX 原则上对此没有限制，并且可能有许多使用普通对象的 MobX 用户。
但是，使用类的一个好处是更容易被索引以实现自动补全等功能，例如使用 TypeScript。
另外，`instanceof` 非常强大，可以方便的用于类型推断，并且类实例不会被包装在 `Proxy` 对象中，从而提供更好的调试体验。
最后，使用类可以从引擎优化中受益，因为它们是可预测的并且方法在原型上是共享的。
但是，繁重的继承很容易成为 foot-guns，因此如果使用类，请尽量使其保持简单。
因此，即使您并不喜欢使用类，我们也鼓励您尽可能多的使用类的写法。如果其他写法更适合你，也可以使用其他写法。
