---
title: 使用 actions 更新 state
sidebar_label: Actions
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 使用 actions 更新 state

用法：

-   `action` _（注解）_
-   `action(fn)`
-   `action(name, fn)`

所有的应用程序都有 actions。action 就是任意一段修改 state 的代码。原则上，actions 总会为了对一个事件做出响应而发生。例如，点击了一个按钮，一些输入被改变了，一个 websocket 消息被送达了，等等。 

尽管 [`makeAutoObservable`](observable-state.md#makeautoobservable) 可以自动帮你声明一部分 actions，但是 MobX 还是要求你声明你的 actions。Actions 可以帮助你更好的组织你的代码并提供以下性能优势：

1. 它们在 [transactions](api.md#transaction) 内部运行。任何可观察对象在最外层的 action 完成之前都不会被更新，这一点保证了在 action 完成之前，action 执行期间生成的中间值或不完整的值对应用程序的其余部分都是不可见的。

2. 默认情况下，不允许在 actions 之外改变 state。这有助于在代码中清楚地对状态更新发生的位置进行定位。

`action` 注解应仅用于_修改_ state 的函数。派生其他信息（执行查询或者过滤数据）的函数_不应该_被标记为 actions，以允许 MobX 跟踪其调用。 带有 `action` 注解的成员是不可枚举的。

## 例子

<!--DOCUSAURUS_CODE_TABS-->
<!--makeObservable-->

```javascript
import { makeObservable, observable, action } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeObservable(this, {
            value: observable,
            increment: action
        })
    }

    increment() {
        // 观察者不会看到中间状态.
        this.value++
        this.value++
    }
}
```

<!--makeAutoObservable-->

```javascript
import { makeAutoObservable } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeAutoObservable(this)
    }

    increment() {
        this.value++
        this.value++
    }
}
```

<!--action.bound-->

```javascript
import { makeObservable, observable, action } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeObservable(this, {
            value: observable,
            increment: action.bound
        })
    }

    increment() {
        this.value++
        this.value++
    }
}

const doubler = new Doubler()

// 这样调用 increment 是安全的, 因为它已经被绑定了。
setInterval(doubler.increment, 1000)
```

<!--action(fn)-->

```javascript
import { observable, action } from "mobx"

const state = observable({ value: 0 })

const increment = action(state => {
    state.value++
    state.value++
})

increment(state)
```

<!--runInAction(fn)-->

```javascript
import { observable, runInAction } from "mobx"

const state = observable({ value: 0 })

runInAction(() => {
    state.value++
    state.value++
})
```

<!--END_DOCUSAURUS_CODE_TABS-->

## 使用 `action` 包装函数

为了尽可能地利用 MobX 的事务性，应该尽可能地对外暴露 actions。如果类方法将会修改 state，最好将其标记为 actions。事件处理函数是最常见的事务，最好将其标识为 actions。因为一个未被标记为 actions 的事件处理函数调用两个 actions 将会生成两个事务。

为了更容易地创建事件处理函数，`action` 不仅仅是一个注解，更是一个高阶函数。可以使用函数作为参数来调用它，在这种情况下它将会返回具有相同签名的使用 `action` 包装过的函数。

例如在 React 中，可以按照下面的方式包装 `onClick` 事件处理函数。

```javascript
const ResetButton = ({ formState }) => (
    <button
        onClick={action(e => {
            formState.resetPendingUploads()
            formState.resetValues()
            e.stopPropagation()
        })}
    >
        Reset form
    </button>
)
```

为了更好的调试体验，我们推荐为被包装的函数命名，或者将名称作为 `action` 的第一个参数进行传递。

<details id="actions-are-untracked"><summary>**注意：** actions 不会被追踪<a href="#actions-are-untracked" class="tip-anchor"></a></summary>

actions 的另一个特征是它们是 [不可追踪](api.md#untracked) 的。当从副作用或者计算值（非常罕见）中调用 action 时，该 action 读取的可观察对象将不会算作该 derivation 的依赖项。

`makeAutoObservable`，`extendObservable` 和 `observable` 使用一种特殊的 `action`， 叫做  `autoAction`，
它会在运行时确定函数是 derivation 还是 action。

</details>

## `action.bound`

用法：

-   `action.bound` _（注解）_

`action.bound` 注解可用于将方法自动绑定到正确的实例，这样 `this` 会始终被正确绑定在函数内部。

<details id="auto-bind"><summary>**提示：** 使用 `makeAutoObservable(o, {}, { autoBind: true })` 自动绑定所有的 actions<a href="#avoid-bound" class="tip-anchor"></a></summary>

```javascript
import { makeAutoObservable } from "mobx"

class Doubler {
    value = 0

    constructor(value) {
        makeAutoObservable(this)
    }

    increment = () => {
        this.value++
        this.value++
    }
}
```

</details>

## `runInAction`

用法：

-   `runInAction(fn)`

使用这个工具函数来创建一个会被立即调用的临时 action。在异步进程中非常有用。
请查看 [上面代码块](#examples) 中的实例。

## Actions 和继承

只有定义在**原型**上的函数可以被子类**覆盖**：

```javascript
class Parent {
    // on instance
    arrowAction = () => {}

    // on prototype
    action() {}
    boundAction() {}

    constructor() {
        makeObservable(this, {
            arrowAction: action
            action: action,
            boundAction: action.bound,
        })
    }
}
class Child {
    // THROWS: TypeError: Cannot redefine property: arrowAction
    arrowAction = () => {}

    // OK
    action() {}
    boundAction() {}

    constructor() {
        super()
        makeObservable(this, {
            arrowAction: override,
            action: override,
            boundAction: override,
        })
    }
}
```

想要将单个的 _action_ **绑定** 到 `this`，可以使用 `action.bound` 代替箭头函数。<br>
查看 [**subclassing**](subclassing.md) 获取更多信息。

## 异步 actions

从本质上讲，异步进程在 MobX 中不需要任何特殊处理，因为不论是何时引发的所有 reactions 都将会自动更新。
而且因为可观察对象是可变的，因此在 action 执行过程中保持对它们的引用一般是安全的。
然而，在异步进程中更新可观察对象的每个步骤（tick）都应该被标识为 `action`。
我们可以通过利用上述的 API 以多种方式实现这一点，如下所示。

例如，在处理 Promise 时，更新 state 的处理程序应该被 `action` 包装起来，或者被标记为 actions，如下所示。

<!--DOCUSAURUS_CODE_TABS-->
<!--Wrap handlers in `action`-->

Promise 的处理程序是内联的，但是会在原始的 action 执行完成之后运行，因此需要使用 `action` 进行包装：

```javascript
import { action, makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        fetchGithubProjectsSomehow().then(
            action("fetchSuccess", projects => {
                const filteredProjects = somePreprocessing(projects)
                this.githubProjects = filteredProjects
                this.state = "done"
            }),
            action("fetchError", error => {
                this.state = "error"
            })
        )
    }
}
```

<!--Handle updates in separate actions-->

如果 Promise 的处理函数是类的字段，它们将由 `makeAutoObservable` 自动包装为 `action`：

```javascript
import { makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        fetchGithubProjectsSomehow().then(this.projectsFetchSuccess, this.projectsFetchFailure)
    }

    projectsFetchSuccess = projects => {
        const filteredProjects = somePreprocessing(projects)
        this.githubProjects = filteredProjects
        this.state = "done"
    }

    projectsFetchFailure = error => {
        this.state = "error"
    }
}
```

<!--async/await + runInAction-->

`await` 之后的任何操作都不与其同在一个 tick 中，因此它们需要使用 action 包装。
在这里，我们可以利用 `runInAction`：

```javascript
import { runInAction, makeAutoObservable } from "mobx"

class Store {
    githubProjects = []
    state = "pending" // "pending", "done" or "error"

    constructor() {
        makeAutoObservable(this)
    }

    async fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        try {
            const projects = await fetchGithubProjectsSomehow()
            const filteredProjects = somePreprocessing(projects)
            runInAction(() => {
                this.githubProjects = filteredProjects
                this.state = "done"
            })
        } catch (e) {
            runInAction(() => {
                this.state = "error"
            })
        }
    }
}
```

<!--`flow` + generator function -->

```javascript
import { flow, makeAutoObservable, flowResult } from "mobx"

class Store {
    githubProjects = []
    state = "pending"

    constructor() {
        makeAutoObservable(this, {
            fetchProjects: flow
        })
    }

    // 注意星号, 这是一个 generator 函数!
    *fetchProjects() {
        this.githubProjects = []
        this.state = "pending"
        try {
            // Yield 代替 await.
            const projects = yield fetchGithubProjectsSomehow()
            const filteredProjects = somePreprocessing(projects)
            this.state = "done"
            this.githubProjects = filteredProjects
        } catch (error) {
            this.state = "error"
        }
    }
}

const store = new Store()
const projects = await flowResult(store.fetchProjects())
```

<!--END_DOCUSAURUS_CODE_TABS-->

## 使用 flow 代替 async / await {🚀}

用法：

-   `flow` _（注解）_
-   `flow(function* (args) { })`

`flow` 包装器是一个可选的 `async` / `await` 替代方案，它让 MobX action 使用起来更加容易。

`flow` 将 [generator 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) 作为唯一输入。
在 generator 内部，你可以使用 yield 串联 Promise（使用 `yield somePromise` 代替 `await somePromise`）。
flow 机制将会确保 generator 在 Promise resolve 之后继续运行或者抛出错误。

所以 `flow` 是 `async` / `await` 的一个替代方法，它不需要 `action` 的包装。它可以按照下面的方式工作：

1. 使用 `flow` 包装你的异步函数。
2. 使用 `function *` 代替 `async`。
3. 使用 `yield` 代替 `await`。

以上 [`flow` + generator 函数](#asynchronous-actions) 的示例展示了实际情况中的用法。

需要注意的是，当使用 TypeScript 时才需要使用 `flowResult` 函数。
由于使用 `flow` 包装方法，他将把返回的 generator 包裹在 Promise 中。
然而，TypeScript 并不知道这种转换，因此使用 `flowResult` 确保 TypeScript 可以知道这种类型的改变。

`makeAutoObservable` 将自动推断 generators 为 `flow`。带有 `flow` 注解的成员是不可枚举的。

<details id="flow-wrap"><summary>{🚀} **注意：** 将 flow 作为对象字段<a href="#flow-wrap" class="tip-anchor"></a></summary>
像 `action` 一样，`flow` 也可以直接作为包装函数使用。上面的例子可以改写成下面的样子：

```typescript
import { flow } from "mobx"

class Store {
    githubProjects = []
    state = "pending"

    fetchProjects = flow(function* (this: Store) {
        this.githubProjects = []
        this.state = "pending"
        try {
            // yield 代替 await.
            const projects = yield fetchGithubProjectsSomehow()
            const filteredProjects = somePreprocessing(projects)
            this.state = "done"
            this.githubProjects = filteredProjects
        } catch (error) {
            this.state = "error"
        }
    })
}

const store = new Store()
const projects = await store.fetchProjects()
```

这样做的好处是我们不再需要 `flowResult` 了，但是需要传入 `this` 来确保正确的类型推断。

</details>

## 取消 flows {🚀}

flow 的另一个好处就是它可以被取消。
`flow` 的返回值是一个 Promise，在 generator 函数运行完成时它将会被 resolve。
返回的 Promise 中有一个额外的 `cancel()` 方法，该方法可以中断正在运行的 generator 并取消它。
`try` / `finally` 字句仍将运行。

## 关闭强制使用 action {🚀}

默认情况下，MobX 6 和更高版本要求您使用 action 来更改 state。
然而，你可以配置 MobX 来关闭这个行为。查看 [`enforceActions`](configuration.md#enforceactions)。
例如，这在单元测试中非常有用，因为警告并不总是有价值的。
