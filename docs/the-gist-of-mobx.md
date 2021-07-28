---
title: The gist of MobX
sidebar_label: The gist of MobX
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# Mobx 核心思想

## 核心概念

Mobx 为你的应用引入了以下三个概念：

1. 状态（State）
2. 行为（Actions）
3. 派生（Derivations）

接下里让我们来更详细地了解一下这几个概念，或者，你可以阅读 [10 分钟介绍 Mobx 和 React](https://mobx.js.org/getting-started) 。通过这份教程，你可以交互式地逐步深入了解这些概念并构建一个简单的待办事项列表应用程序。

### 1. 定义状态并使它变成可观察的（`observable`）

**状态**是指驱动你的应用的数据。通常，有**特定于域的状态**，例如待办事项列表，还有**视图**状态，例如当前选择的（页面）元素。
状态就像是电子表格中用于保存值的单元格。

Mobx并不关注你如何维护你的状态，你可以将它们存储在任何你喜欢的数据结构中：普通对象、数组、类、循环数据结构或引用。你唯一需要确保的是所有这些需要随时间而变化的属性都被标记为 `observable` ，以便 MobX 可以跟踪它们。

一个简单的例子：

```javascript
import { makeObservable, observable, action } from "mobx"

class Todo {
    id = Math.random()
    title = ""
    finished = false

    constructor(title) {
        makeObservable(this, {
            title: observable,
            finished: observable,
            toggle: action
        })
        this.title = title
    }

    toggle() {
        this.finished = !this.finished
    }
}
```

**提示**：这个例子可以使用 [`makeAutoObservable`](observable-state.md) 来简化，但是通过明确的定义我们可以更详细地展示不同的概念。

使用 `observable` 就像将对象的属性转换为电子表格的单元格。但与电子表格不同的是，这些值不仅可以是原始值（译者注：既 JavaScrip 中的基础类型），还可以是引用、对象和数组。

但是我们标记为 `action` 的 `toggle` 又是什么呢？

### 2. 使用行为来更新状态

一个**行为**代表着任何一段会改变某个**状态**的代码。例如用户事件、后端数据推送、预定事件等。一个行为就像是用户向一个电子表格的单元格中输入新的值。

在上面的 `Todo` 模型中，你可以看到我们有一个更改 `finished` 值的 `toggle` 方法。而 `finished` 被标记为了 `observable`。我们建议你将任何更改 `observable` 的代码都标记为 [`action`](actions.md)。这样 MobX 就可以自动应用事务以轻松达到其最佳性能。

使用操作可帮助你构建代码并防止你意外更改状态。在 Mobx 术语中，会修改状态的方法被称作 **actions**，这与 **views** 形成对比，后者根据当前状态计算新信息。一个方法应最多只服务于这两个目的中的一个。

### 3. 创建派生以自动响应状态变化

**任何**可以从**状态**中派生而出而无需进一步交互的东西就成为一个派生（Derivation）。

在很多场景中都存在派生：

-   用户接口
-   **派生的数据**，例如剩余 `代办` 数量
-   与后端基层，例如将更改后的数据发送到服务器

Mobx 将派生分为两类：

-   **计算值**（Computed Value），这类派生始终可以使用纯函数从当前可观察状态导出
-   **反馈**（Reaction），这类派生指当状态改变时需要自动发生的副作用（命令式和响应式编程之间的桥梁）

当用户刚开始使用 Mobx 时，他们通常倾向于过度使用反馈。关于何时使用这两者有一个黄金法则，即如果您想根据当前状态创建值，请始终使用 `计算值`。

#### 3.1. 在数据层使用 `computed` 处理派生值

要创建**计算值**，请使用 JS getter 函数 `get` 定义一个属性，并使用 `makeObservable` 将其标记为 `computed`。

```javascript
import { makeObservable, observable, computed } from "mobx"

class TodoList {
    todos = []
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length
    }
    constructor(todos) {
        makeObservable(this, {
            todos: observable,
            unfinishedTodoCount: computed
        })
        this.todos = todos
    }
}
```

当新增一个待办或者修改某个待办的 ` finished` 属性时，Mobx 将会确保 `unfinishedTodoCount` 被自动更新。

这些计算类似于 MS Excel 等电子表格程序中的公式。它们会自动更新，但仅在需要时更新。也就是说，如果某处需要这个计算值时，才会去执行更新。

#### 3.2. 使用反馈处理副作用

为了让你作为用户能够在屏幕上看到状态或计算值的变化，此时需要一个用于需要局部重绘 GUI 的**反馈**（Reaction）。

反馈与计算值类似，但它们不会产生信息，而是产生副作用，例如打印到控制台、发出网络请求、增量更新 React 组件树以修补 DOM 等。

简而言之，反馈连通了 [响应式编程](https://en.wikipedia.org/wiki/Reactive_programming) 和 [命令式编程](https://en.wikipedia.org/wiki/Imperative_programming)。

到目前为止，最用到反馈的场景是 UI 组件。但也应注意到，行为（Action）和反馈中都可能触发副作用。那些具有明确来源，并且知道它们可能在哪儿被触发的副作用应该能从与之相关的事件处理程序中显式触发，例如通过网络请求提交表单。

#### 3.3 响应式的 React 组件

如果你正在使用 React，你可以通过使用你 [在安装时选择](installation.md#installation) 的包中的 [`observer`](react-integration.md) 函数将组件包装起来，从而使您的组件具有反应性。在下面这个例子中，我们将使用更轻量级的 `mobx-react-lite` 包。
```javascript
import * as React from "react"
import { render } from "react-dom"
import { observer } from "mobx-react-lite"

const TodoListView = observer(({ todoList }) => (
    <div>
        <ul>
            {todoList.todos.map(todo => (
                <TodoView todo={todo} key={todo.id} />
            ))}
        </ul>
        Tasks left: {todoList.unfinishedTodoCount}
    </div>
))

const TodoView = observer(({ todo }) => (
    <li>
        <input type="checkbox" checked={todo.finished} onClick={() => todo.toggle()} />
        {todo.title}
    </li>
))

const store = new TodoList([new Todo("Get Coffee"), new Todo("Write simpler code")])
render(<TodoListView todoList={store} />, document.getElementById("root"))
```

`observer` 将 React 组件转换为它们所渲染的数据的派生。当使用 MobX 时，不再有智能组件或愚蠢组件之分。所有组件都能智能地渲染，但以原始的方式定义。 MobX 只是简单地确保组件在总能按需重渲染，仅此而已。

因此，上例中的 `onClick` 事件函数因为使用了 `toggle` 行为，所以能够强制触发正确的 `TodoView` 组件重渲染。但当未完成的任务数量改变时，它只会触发 `TodoListView` 组件的重渲染。并且如果你想要删除 `Tasks left` 行（或将其放入单独的组件中），则在勾选任务时 `TodoListView` 组件将不再重渲染。

如果你想要更多地了解 React 是如何和 Mobx 协同工作的，请阅读 [React integration](react-integration.md) 部分。

#### 3.4. 自定义反馈

您很少需要它们，但可以使用 `autorun`、`reaction` 或 `when` 函数创建自定义反馈以适应你的特殊场景。例如，下面的 `autorun` 会在每次 `unfinishedTodoCount` 的数量发生变化时打印一条日志消息：

```javascript
// 一个自动观察这个状态的函数
autorun(() => {
    console.log("Tasks left: " + todos.unfinishedTodoCount)
})
```

为什么每次更改 unfinishedTodoCount 时都会打印一条新消息？答案是一个这样的经验法则：

MobX 会对在执行跟踪函数时读取的任何现有的 observable 属性做出响应。

如果你想要了解 Mobx 是如何定义哪些可观察对象（译者注：原文为 `observables`，此处译为 `可观察对象`，与对象类型数据（object）无关 ）需要被响应，请阅读 [理解响应式](understanding-reactivity.md) 部分

## 原则

Mobx 遵循『单向数据流』，即**行为**改变**状态**，进而翻过来更新所有受影响的**视图**。

![Action, State, View](assets/action-state-view.png)

1. 当**状态**改变时，所有的**派生**都会**自动地**和**逐个地**（atomically）更新。因此，永远不可能观察到中间值。

2. 所有的派生默认是**同步**更新的。这意味着，例如，**行为** 可以更改**state**后直接且安全的访问一个计算值。

3. **计算值**是懒更新的。任何未主动使用的计算值在某个副作用 (I/O) 需要它之前都不会更新。如果某个视图不再使用它，它​​将自动被 GC。

4. 所有的**计算值**都应该是纯函数，且不应去修改**状态**

如果你想要更多地了解这背后的逻辑，请阅读 [MobX 背后的基本原则](https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8) 部分。

## 尝试一下

你可以在 [CodeSandbox](https://codesandbox.io/s/concepts-principles-il8lt?file=/src/index.js:1161-1252) 上自行尝试上面这个例子。

## 静态检查

如果你发现很难适应 MobX 的思维模型，请将其配置得非常严格，这样一旦你偏离这些模式，它就会在运行时警告你。请查看 [linting MobX](configuration.md#linting-options) 部分。