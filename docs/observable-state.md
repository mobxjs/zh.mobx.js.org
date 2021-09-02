---
title: Creating observable state
sidebar_label: Observable state
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建可观察状态

属性，完整的对象，数组，Maps 和 Sets 都可以被转化为可观察对象。
使得对象可观察的基本方法是使用 `makeObservable` 为每个属性指定一个注解。
最重要的注解如下：

-   `observable` 定义一个存储 state 的可追踪字段。
-   `action` 将一个方法标记为可以修改 state 的 action。
-   `computed` 标记一个可以由 state 派生出新的值并且缓存其输出的 getter。

像数组，Maps 和 Sets 这样的集合都将被自动转化为可观察对象。

## `makeObservable`

用法：

-   `makeObservable(target, annotations?, options?)`

这个函数可以捕获_已经存在_的对象属性并且使得它们可观察。任何 JavaScript 对象（包括类的实例）都可以作为 `target` 被传递给这个函数。
一般情况下，`makeObservable` 是在类的构造函数中调用的，并且它的第一个参数是 `this` 。
`annotations` 参数将会为每一个成员映射 [注解](#available-annotations)。需要注意的是，当使用 [装饰器](enabling-decorators.md) 时，`annotations` 参数将会被忽略。

派生数据并且接受参数的方法（例如：`findUsersOlderThan(age: number): User[]`）不需要任何注解。
当我们从一个 reaction 中调用它们时，它们的读取操作仍然会被跟踪，但是为了避免内存泄漏，它们的输出将不会被记忆化。更详细的信息可以查看 [MobX-utils computedFn {🚀}](https://github.com/mobxjs/mobx-utils#computedfn)。

Mobx 通过 `override` 注解 [支持子类的使用，但会有一些局限性](subclassing.md)。

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

**所有带注解** 的字段都是 **不可配置的**。<br>
**所有的不可观察**（无状态）的字段（`action`, `flow`）都是 **不可写的**。

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

注意，类也可以跟 `makeAutoObservable` 合用。
示例中的差异就展示了将 MobX 应用于不同编程风格的方法。

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

与第一个例子中的 `makeObservable` 不同，`observable` 支持为对象添加（和删除）字段。
这使得 `observable` 非常适合用于像动态键控的对象、数组、Maps 和 Sets 之类的集合。

<!--END_DOCUSAURUS_CODE_TABS-->

## `makeAutoObservable`

使用：

-   `makeAutoObservable(target, overrides?, options?)`

`makeAutoObservable` 就像是加强版的 `makeObservable`，在默认情况下它将推断所有的属性。你仍然可以使用 `overrides` 重写某些注解的默认行为。
具体来说，`false` 可用于从自动处理中排除一个属性或方法。
查看上面的代码分页获取示例。
与使用 `makeObservable` 相比，`makeAutoObservable` 函数更紧凑，也更容易维护，因为新成员不需要显式地提及。
然而，`makeAutoObservable` 不能被用于带有 super 的类或 [子类](subclassing.md)。

推断规则：

-   所有 _自有_ 属性都成为 `observable`。
-   所有 `get`ters 都成为 `computed`。
-   所有 `set`ters 都成为 `action`。
-   所有 _prototype 中的 functions_ 都成为 `autoAction`。
-   所有 _prototype 中的 generator functions_ 都成为 `flow`。（需要注意，generators 函数在某些编译器配置中无法被检测到，如果 flow 没有正常运行，请务必明确地指定 `flow` 注解。）
-   在 `overrides` 参数中标记为 `false` 的成员将不会被添加注解。例如，将其用于像标识符这样的只读字段。

## `observable`

用法：

-   `observable(source, overrides?, options?)`

`observable` 注解可以作为一个函数进行调用，从而一次性将整个对象变成可观察的。
`source` 对象将会被克隆并且所有的成员都将会成为可观察的，类似于 `makeAutoObservable` 做的那样。
同样，你可以传入一个 `overrides` 对象来为特定的成员提供特定的注解。
查看上面的代码获取示例。

由 `observable` 返回的对象将会使用 Proxy 包装，这意味着之后被添加到这个对象中的属性也将被侦测并使其转化为可观察对象（除非禁用 [proxy](configuration.md#proxy-support)）。

`observable` 方法也可以被像 [arrays](api.md#observablearray)，[Maps](api.md#observablemap) 和 [Sets](api.md#observableset) 这样的集合调用。这些集合也将被克隆并转化为可观察对象。

<details id="observable-array"><summary>**例子：** 可观察数组<a href="#observable-array" class="tip-anchor"></a></summary>

下面的例子创建了一个可观察对象并且使用 [`autorun`](reactions.md#autorun) 观察它。
使用 Map 和 Set 集合时，用法和这里类似。

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

可观察的数组还有一些特别好用的实用函数：

-   `clear()` 从数组中清除所有元素。
-   `replace(newItems)` 将数组中现有的元素全部替换成 newItems。
-   `remove(value)` 根据 value 从数组中删除一个元素。如果找到并删除了元素，返回  `true`。

</details>

<details id="non-convertibles"><summary>**注意：** 原始值和类的实例永远不会被转化为可观察对象<a href="#non-convertibles" class="tip-anchor"></a></summary>

MobX 无法使原始值可观察，因为它们在 JavaScript 中是不可变的（但是 Mobx 可以将它们 [包装](api.md#observablebox)起来）。
尽管在我们不使用库时通常不会用到这样的机制。

我们永远无法通过把类的实例传入 `observable` 或用其给一个 `observable` 属性赋值来将其自动转化成可观察对象。
一般认为应该由类构造函数负责将类成员转化成可观察对象。

</details>

<details id="avoid-proxies"><summary>{🚀} **提示：** observable（使用代理）与 makeObservable（不使用代理）<a href="#avoid-proxies" class="tip-anchor"></a></summary>

`make(Auto)Observable` 和 `observable` 之间最主要的区别在于，`make(Auto)Observable` 会修改你作为第一个参数传入的对象，而 `observable` 会创建一个可观察的 _副本_ 对象。

第二个区别是，`observable` 会创建一个 [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 对象，以便能够在你将该对象当作动态查询映射使用时捕获将要添加的属性。
如果你想把一个对象转化为可观察对象，而这个对象具有一个常规结构，其中所有的成员都是事先已知的，那么我们建议使用 `makeObservable`，因为非代理对象的速度稍快一些，而且它们在调试器和 `console.log` 中更容易检查。

因此，`make(Auto)Observable` 推荐在工厂函数中使用。
值得一提的是，可以将 `{ proxy: false }` 作为 option 传入 `observable` 获取非代理副本。

</details>

## 可用的注解

| 注解                               | 描述                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `observable`<br/>`observable.deep` | 定义一个存储 state 的可跟踪字段。如果可能，任何被赋值给 `observable` 的字段都会基于它自己的类型被（深度）转化为`observable`、`autoAction` 或 `flow`。只有 `plain object`、`array`、`Map`、`Set`、`function`、`generator function` 可以转换，类实例和其他实例不会被影响。 |
| `observable.ref`                   | 类似于 `observable`，但只有重新赋值才会被追踪。所赋的值会被完全忽略，并且将不会主动转化为 `observable`/`autoAction`/`flow`。比方说，在你打算将不可变数据存储在可观察字段中时，可以使用这个注解。 |
| `observable.shallow`               | 类似于 `observable.ref` 但是是用于集合的。任何所赋的集合都会被转化为可观察值，但是其内部的值并不会变为可观察值。 |
| `observable.struct`                | 类似于 `observable`，但是会忽略所赋的值中所有在结构上与当前值相同的值。 |
| `action`                           | 把一个函数标记为会修改 state 的 action。查看 [actions](actions.md) 获取更多信息。不可写。 |
| `action.bound`                     | 类似于 action，但是会将 action 绑定到实例，因此将始终设置 `this`。不可写。 |
| `computed`                         | 可以用在 [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) 上，用来将其声明为可缓存的派生值。查看 [computeds](computeds.md) 获取更多信息。 |
| `computed.struct`                  | 类似于 `computed`，但如果重新计算后的结果在结构上与之前的结果相等，那么观察者将不会收到通知。 |
| `true`                             | 推断最佳注解。查看 [makeAutoObservable](#makeautoobservable) 获取更多信息。 |
| `false`                            | 刻意不为该属性指定注解。                                       |
| `flow`                             | 创建一个 `flow` 管理异步进程。查看 [flow](actions.md#using-flow-instead-of-async--await-) 获取更多信息。需要注意的是，推断出来的 TypeScript 返回类型可能会出错。 不可写。 |
| `flow.bound`                       | 类似于 flow, 但是会将 flow 绑定到实例，因此将始终设置 `this`。 不可写。    |       
| `override`                         | [用于子类覆盖继承的 `action`，`flow`，`computed`，`action.bound`](subclassing.md)。 |
| `autoAction`                       | 不应被显式调用，但 `makeAutoObservable` 内部会对其进行调用，以便根据调用上下文将方法标识为 action 或者派生值。 |

## 局限性

1. `make(Auto)Observable` 仅支持已经定义的属性。请确保你的 [**编译器选项**是正确的](installation.md#use-spec-compliant-transpilation-for-class-properties)，或者，作为权宜之计，确保在你使用 `make(Auto)Observable` 之前已经为所有属性赋了值。如果没有正确的配置，已经声明而未初始化的字段（例如：`class X { y; }`）将无法被正确侦测到。
1. `makeObservable` 只能注解由其本身所在的类定义声明出来的属性。如果一个子类或超类引入了可观察字段，那么该子类或超类就必须自己为那些属性调用 `makeObservable`。
1. `options` 参数只能提供一次。被传入的 `options` 是 _“有粘性”_ 的，之后无法更改（例如，在 [子类](subclassing.md) 中）。
1. **每个字段只能被注解一次**（`override` 除外）。字段注解和配置不能在 [子类](subclassing.md) 中改变。
1. 非普通对象（**类**）中的 **所有被注解过的** 字段都是 **不可配置的**。<br>
   [可以通过 `configure({ safeDescriptors: false })` 来禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
1. **所有不可观察**（stateless）字段（`action`，`flow`）都是 **不可写的**。<br>
   [可以通过 `configure({ safeDescriptors: false })` 来禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
1. [只有定义在**原型**上的 **`action`，`computed`，`flow`，`action.bound`** 可以在子类中被 **overriden**](subclassing.md)。
1. 默认情况下 _TypeScript_ 不会允许你注解**私有**字段。这个问题可以通过将相关私有字段作为泛型参数显式传入来解决，就像这样： `makeObservable<MyStore, "privateField" | "privateField2">(this, { privateField: observable, privateField2: observable })`。
1. **make(Auto)Observable**的调用和注解的提供必须无条件地进行，因为这样才可能对推断结果进行缓存。
1. **不支持** 在调用 **`make(Auto)Observable`** 之后 **修改原型**。
1. **不支持** _EcmaScript_ 中的**私有**字段（**`#field`**）。使用 _TypeScript_ 时，推荐改用 `private` 修饰符。
1. **不支持** 在单个继承链中 **混合使用注解和装饰器** - 例如，在超类中使用了装饰器，就不能再在子类中使用注解。
1. `makeObservable`，`extendObservable` 不能在其它内置可观察类型上使用（`ObservableMap`，`ObservableSet`，`ObservableArray` 等）。
1. `makeObservable(Object.create(prototype))` 将属性从 `prototype` 拷贝到新创建的对象并且使得其是可观察的。此行为是错误的、不可预测的，因此已经**不推荐使用**，并可能会在未来有所变动。不要使用它。

## Options {🚀}

上面的 API 都有一个可选的 `options` 参数，该参数是一个对象，支持以下选项：

-   **`autoBind: true`** 默认使用 `action.bound`/`flow.bound`，而不使用 `action`/`flow`。不影响被显式注释过的成员。
-   **`deep: false`** 默认使用 `observable.ref`，而不使用 `observable`。不影响被显式注释过的成员。
-   **`name: <string>`** 为对象提供一个调试名称，该名称将被打印在错误消息和 reflection API 中。
-   **`proxy: false`** 迫使 `observable(thing)` 使用非 [**proxy**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 的实现。如果对象的结构不会随着时间变化，那么这就是一个很好的选择，因为非代理对象更容易调试并且速度更快。请参见 [避免代理](#avoid-proxies)。

<details id="one-options-per-target"><summary>**注意：** options 是*粘性的*并且只能被提供一次<a href="#one-options-per-target" class="tip-anchor"></a></summary>
`options` 参数可以只被提供给还不是可观察对象的 `target`。<br>
一旦可观察对象被初始化，将无法更改 options。<br>
options 会被保存在 target 中并且不会被之后的 `makeObservable`/`extendObservable` 调用干扰。<br>
你不能在 [子类](subclassing.md) 中传入不同的 options。
</details>

## 将 observable 转换回普通的 JavaScript 集合

有时有必要将可观察的数据结构转换回原生的数据结构。
例如，将可观察对象传入一个无法跟踪可观察对象的 React 组件时，或者想要获取一个不会再被更改的副本时。

要进行浅转换，用常用的 JavaScript 操作就可以做到：

```javascript
const plainObject = { ...observableObject }
const plainArray = observableArray.slice()
const plainMap = new Map(observableMap)
```

要将数据树递归地转换为普通对象，可使用 [`toJS`](api.md#tojs) 工具函数。
对于类，建议实现一个 `toJSON()` 方法，因为这样会被 `JSON.stringify` 识别出来。

## 关于类的说明

到目前为止，以上大多数示例都倾向于使用类进行构建。
MobX 原则上对此没有限制，而且可能有同样多的MobX 用户使用的是普通对象。
但是，使用类的一个好处是更容易被索引以实现自动补全等功能，例如使用 TypeScript。
另外，`instanceof` 检查对于类型推断来说非常强大，并且类实例不会被包装在 `Proxy` 对象中，这一点给了它们更好的调试体验。
最后，使用类会从引擎优化中受益良多，因为它们的形态是可预测的并且方法在原型上是共享的。
但是，复杂的继承模式很容易给您自己带来不必要的麻烦，因此如果您想使用类，请尽量使其保持简单。
因此，尽管稍微倾向于使用类，但如果有更适合您的，我们肯定会鼓励您不采用这种风格。
