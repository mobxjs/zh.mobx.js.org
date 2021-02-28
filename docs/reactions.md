---
title: 使用 reactions 处理副作用
sidebar_label: Reactions {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 使用 reactions 处理副作用 {🚀}

reactions 是需要理解的重要概念，因为他可以将 MobX 中所有的特性有机地融合在一起。
reactions 的目的是对自动发生的副作用进行建模。
它们的意义在于每当_关联_的状态发生变化时，总会为你的可观察状态创建消费者，并且_自动_运行副作用。

但是，始终记住我们在这里讨论的 API 一般是很少使用的。
它们经常被抽象到其他的库里面（例如，mobx-react）或者你的应用程序中其他特定的抽象库。

但是，为了理解 MobX，让我们简单地看一下如何创建 reactions。
最简单的方式是使用 [`autorun`](#autorun) 工具函数。
除此之外，还有 [`reaction`](#reaction) 和 [`when`](#when)。

## Autorun

使用：

-   `autorun(effect: (reaction) => void)`

`autorun` 函数接受一个函数作为参数，该函数应该在每次观察到变化时运行。
当你自己创建 `autorun` 时，它也会运行一次。它仅仅对可观察状态的变化做出响应，比如那些你用 `observable` 或者 `computed` 注释的。

### tracking 如何工作

Autorun 通过在 _reactive context_ 中运行 `effect` 来工作。在执行提供的函数时，MobX 会跟踪 effect 直接或间接_读取_的所有可观察对象和计算值。
函数执行完成后，MobX 将收集并订阅所有已经读取的可观察对象，并等待其中任何一个的再次更改。
一旦有更改发生，`autorun` 将会再次触发，重复上面的过程。

![autorun](assets/autorun.png)

这就是下面的示例的工作方式。

### 例子

```javascript
import { makeAutoObservable, autorun } from "mobx"

class Animal {
    name
    energyLevel

    constructor(name) {
        this.name = name
        this.energyLevel = 100
        makeAutoObservable(this)
    }

    reduceEnergy() {
        this.energyLevel -= 10
    }

    get isHungry() {
        return this.energyLevel < 50
    }
}

const giraffe = new Animal("Gary")

autorun(() => {
    console.log("Energy level:", giraffe.energyLevel)
})

autorun(() => {
    if (giraffe.isHungry) {
        console.log("Now I'm hungry!")
    } else {
        console.log("I'm not hungry!")
    }
})

console.log("Now let's change state!")
for (let i = 0; i < 10; i++) {
    giraffe.reduceEnergy()
}
```

运行上面的代码，你将会看到下面的输出：

```
Energy level: 100
I'm not hungry!
Now let's change state!
Energy level: 90
Energy level: 80
Energy level: 70
Energy level: 60
Energy level: 50
Energy level: 40
Now I'm hungry!
Energy level: 30
Energy level: 20
Energy level: 10
Energy level: 0
```

正如你在上面输出的前两行看到的，两个 `autorun` 函数在初始化时都会运行一次。这就是在运行 `for` 循环前可以看到的内容。

一旦我们运行 `for` 循环使用 `reduceEnergy` action 改变 `energyLevel`，
每当 `autorun` 观察到可观察状态的变化时，
我们将会看到一条新的 log 条目被打印出来：

1.  对于_“Energy level”_函数，它总是可以检测到 `energyLevel` 可观察对象的变化，总共发生 10 次。

2.  对于_“Now I'm hungry”_函数，它总是可以检测到 `isHungry` 计算值的变化，
总共发生 1 次。

## Reaction

使用：

-   `reaction(() => value, (value, previousValue, reaction) => { sideEffect }, options?)`.

`reaction` 类似于 `autorun`，但是可以更加精细地控制要跟踪地可观察对象。
它接受两个函数作为参数：第一个，_data_ 函数，其是被跟踪的函数并且其返回值将会作为第二个函数，_effect_ 函数，的输入。
重要的是要注意，副作用_只_对 data 函数中被_访问_的数据做出反应，该数据可能少于 effect 函数中实际使用的数据。

最好的编程范式是在 _data_ 函数中返回你在副作用中需要的所有数据，
并以这种方式更精确地控制副作用触发的时机。
不像 `autorun`，副作用在初始化时不会自动运行，而指挥在数据 data 表达式首次返回新值之后运行。

<details id="reaction-example"><summary>**例子：** 数据和副作用函数<a href="#reaction-example" class="tip-anchor"></a></summary>

在下面的例子中，当 `isHungry` 更改时，反应仅触发一次。
在 _effect_ 函数中使用的 `giraffe.energyLevel` 的更改，并不会触发 _effect_ 函数。如果你想要 `reaction` 也对这个值的变化做出反应，
你需要在 _data_ 函数中访问并返回它。

```javascript
import { makeAutoObservable, reaction } from "mobx"

class Animal {
    name
    energyLevel

    constructor(name) {
        this.name = name
        this.energyLevel = 100
        makeAutoObservable(this)
    }

    reduceEnergy() {
        this.energyLevel -= 10
    }

    get isHungry() {
        return this.energyLevel < 50
    }
}

const giraffe = new Animal("Gary")

reaction(
    () => giraffe.isHungry,
    isHungry => {
        if (isHungry) {
            console.log("Now I'm hungry!")
        } else {
            console.log("I'm not hungry!")
        }
        console.log("Energy level:", giraffe.energyLevel)
    }
)

console.log("Now let's change state!")
for (let i = 0; i < 10; i++) {
    giraffe.reduceEnergy()
}
```

输出：

```
Now let's change state!
Now I'm hungry!
Energy level: 40
```

</details>

## When

使用：

-   `when(predicate: () => boolean, effect?: () => void, options?)`
-   `when(predicate: () => boolean, options?): Promise`

`when` 观察并运行给定的 _predicate_ 函数，直到其返回 `true`。
一旦返回 true，将会执行给定的 _effect_ 函数并且 autorunner 将会被处理。

如果你没有传入 `effect` 函数，`when` 函数返回一个 `Promise` 类型的 disposer，并允许你手动取消。

<details id="when-example">
  <summary>**例子：** 使用 reaction 处理一些事务<a href="#when-example" class="tip-anchor"></a></summary>

`when` 对于以 reaction 的方式处理或取消事务十分有用。
例如：

```javascript
import { when, makeAutoObservable } from "mobx"

class MyResource {
    constructor() {
        makeAutoObservable(this, { dispose: false })
        when(
            // Once...
            () => !this.isVisible,
            // ... then.
            () => this.dispose()
        )
    }

    get isVisible() {
        // 此项目是否可见.
    }

    dispose() {
        // 清理一些资源.
    }
}
```

一旦 `isVisible` 变成 `false`，`dispose` 方法将会被调用，
并对 `MyResource` 做一些清理操作。

</details>

### `await when(...)`

如果没有提供 `effect` 函数，`when` 将会返回一个 `Promise`。你可以将其与 `async / await` 有机地结合在一起，这样就可以等待可观察状态发生改变。

```javascript
async function() {
	await when(() => that.isVisible)
	// etc...
}
```

如果要提前取消 `when`，可以对它返回地 Promise 调用 `.cancel()` 函数。

## 规则

这里是一些 reactive context 需要遵守的规则：

1. 如果可观察对象发生了改变，默认情况下会立即（同步）运行受影响的 reactions。需要注意，它们会在最外层的 (trans)action 执行结束后运行。
2. autorun 仅跟踪同步执行函数在运行过程中读取的可观察对象，不跟踪异步函数中的情况。
3. autorun 不会跟踪在其内部调用的 action 对可观察数据的读取情况，因为 action 始终是_不可跟踪的_。

有关 MobX 不会响应改变的更多示例，请查看 [无法理解的响应](understanding-reactivity.md) 部分。
对于依赖跟踪如何工作的更详细的技术细节，请阅读博客 [Becoming fully reactive: an in-depth explanation of MobX](https://hackernoon.com/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254)。

## Always dispose of reactions

传递给 `autorun`，`reaction` 和 `when` 的函数只有在它们观察的所有对象都被 GC 之后才会被 GC。原则上，它们一直等待可观察对象发生新的变化。
为了阻止 reactions 永远地等待下去，它们总是会返回一个 disposer 函数，该函数可以用来停止执行并且取消订阅所使用的任何可观察对象。

```javascript
const counter = observable({ count: 0 })

// 初始化一个 autorun 并且打印 0.
const disposer = autorun(() => {
    console.log(counter.count)
})

// 打印: 1
counter.count++

// 停止 autorun.
disposer()

// 不会打印消息.
counter.count++
```

我们强烈建议不再需要这些副作用时，调用从这些方法返回的 disposer 函数。
否则可能导致内存泄漏。

作为第二个参数传递给 `reaction` 和 `autorun` 的 effect 函数的 `reaction` 参数也可以通过调用 `reaction.dispose()` 来提前清除 reaction。

<details id="mem-leak-example"><summary>**例子：** 内存泄漏<a href="#mem-leak-example" class="tip-anchor"></a></summary>

```javascript
class Vat {
    value = 1.2

    constructor() {
        makeAutoObservable(this)
    }
}

const vat = new Vat()

class OrderLine {
    price = 10
    amount = 1
    constructor() {
        makeAutoObservable(this)

        // 这个 autorun 将会和本 OrderLine 实例一起进行 GC,
        // 因为它只是用了来自 `this` 的可观察对象.
        // 所以删除 OrderLine 实例后, 不必严格的处理它.
        this.disposer1 = autorun(() => {
            doSomethingWith(this.price * this.amount)
        })

        // 这个 autorun 将不会和本 OrderLine 实例一起进行 GC,
        // 因为 vat 保存了对这个 autorun 的引用用于通知改变,
        // 这样反过来又将 'this' 保存在作用域中.
        this.disposer2 = autorun(() => {
            doSomethingWith(this.price * this.amount * vat.value)
        })
    }

    dispose() {
        // 所以, 为了避免内存问题, 当不再需要 reactions 之后
        // 总是调用 disposers.
        this.disposer1()
        this.disposer2()
    }
}
```

</details>

## 谨慎地使用 reactions！

就像上面已经说过的那样，我们不会经常创建 reactions。
通常情况下我们不会在应用程序中直接使用上面的任何一个 API，我们使用间接的方式构建 reactions，例如，mobx-react 绑定库中的 `observer`。

在新建 reaction 之前，最好检查它是否符合下面的几条原则：

1. **仅在没有直接因果关系的情况下使用 reaction**： 如果副作用仅仅被有限的 events / actions 触发，直接使用确定 actions 触发副作用往往是一个更加明智的选择。例如，按下表单提交按钮应该发送一个网络请求，这很明显应直接响应 `onClick` 事件而触发副作用，而不是通过 reaction 间接响应。相反，如果你对表单状态的一切修改都自动存储在本地，则应该使用 reaction，这样你不必在每个独立的 `onChange` 事件中触发这个副作用。
1. **reactions 不应该更新其他可观察对象**：reaction 是否应该修改其他可观察变量？答案是否定的，通常情况下我们应该将你需要更新的值注解为 [`计算`](computeds.md) 值。例如，如果一个 todos 的集合发生了变化，不要使用 reaction 计算 `remainingTodos` 的数量，将 `remainingTodos` 声明为计算值即可。这将使得代码更清晰，更容易调试。reaction 不应该计算生成新的数据，只处理副作用即可。
1. **reactions 应该是独立的**：你的代码是否依赖其他必须首先运行的 reaction？如果发生这种情况，你可能违反了第一条规则，
你可以选择将你需要创建的新 reaction 合并到它所依赖 reaction 中。MobX 并不能保证 reaction 的执行顺序。

有些实践并不符合上述原则。这就是为什么它们是_原则_，而不是_法则_。
但是，例外情况很少见，只有在万不得已的情况下才违反它们。

## Options {🚀}

上面提到的 `autorun`，`reaction` 和 `when` 都可以通过传递一个 `options` 参数来进一步自定义它们的行为。

### `name`

该字符串在 [Spy event listeners](analyzing-reactivity.md#spy) 和 [MobX developer tools](https://github.com/mobxjs/mobx-devtools) 中用作此 reaction 的调试名称。

### `fireImmediately` _(reaction)_

布尔值，指示在第一次运行 _data_ 函数后立即触发 _effect_ 函数。默认为 `false`。

### `delay` _(autorun, reaction)_

对 effect 函数进行节流的毫秒数。如果是 0（默认值），将不进行节流操作。

### `timeout` _(when)_

设置 `when` 方法最多需要等待的实践。如果过了截止时间，`when` 将会 reject / throw。

### `onError`

默认情况下，将记录 reaction 中引发的任何异常，但不会向上抛出。这样确保了在一个 reaction 中引发异常将不会影响其他按计划执行的不相关的 reaction 的调度。这同样允许 reaction 从异常中恢复。抛出异常不会打断 MobX 所做的依赖跟踪，所以如果消除了引发异常的因素，则后续的 reaction 可能会再次正常完成。此选项允许覆盖该行为。可以使用 [configure](configuration.md#disableerrorboundaries-boolean) 设置全局错误处理程序或完全禁用错误捕获。

### `scheduler` _(autorun, reaction)_

设置自定义调度程序，以确定 autorun 函数重新运行的机制。他带有一个应在将来某个时刻调用的函数，例如：`{ scheduler: run => { setTimeout(run, 1000) }}`。

### `equals`: (reaction)

默认情况下设置为 `comparer.default`。如果指定，则此比较函数用于比较 _data_ 函数产生的上一个值和下一个值。当且仅当此函数返回 false 时，_effect_ 函数才会被执行。

请查看 [内建 comparers](computeds.md#built-in-comparers) 部分。
