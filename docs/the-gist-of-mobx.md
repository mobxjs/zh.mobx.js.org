---
title: The gist of MobX
sidebar_label: MobX 主旨
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# MobX 主旨

## 概念

MobX区分了应用程序中的以下三个概念：

1. State(状态)
2. Actions(动作)
3. Derivations(派生)



让我们仔细看看下面的这些概念，或者在[10分钟的MobX和React简介](https://mobx.js.org/getting-started)中，您可以通过交互方式逐步深入了解这些概念，并构建一个简单的待办事项列表(Todo List)应用程序。


### 1. 定义 State 并使其可观察

_State(状态)_ 是驱动你的应用程序的数据。

通常来说，状态有_领域特定状态_（比如 Todo List 中的列表项数据）和_视图状态_ （比如当前选中的列表元素）。



将状态存储在任何您喜欢的数据结构中：普通对象、数组、类、循环数据结构或引用。这与MobX的工作方式无关。

只要确保所有你想随时间改变的属性都被标记为`observable`，这样MobX就可以跟踪它们。

以下是一个简单的示例：

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

**提示**: 在这个例子中我们可以用 [`makeAutoObservable`](observable-state.md) 对其进行简化，但是为了能更详细的展示不同的概念，我们对其进行显式设置。 

使用 `observable` 就像将对象的属性放在Excel表格的单元格中。但是和单元格不同的是，他们的值不仅仅是数值，也可以是引用、对象和数组。

接下来我们看一下被我们标记为 `action` 的`toggle`

### 2. 使用 Action 更新 State

_Action(动作)_ 是任意可以改变 _State(状态)_ 的代码，比如用户事件处理、后端推送数据处理、调度器事件处理等等。

Action 就像用户在Excel单元格中输入了新的值。

在 `Todo` 类中，我们可以看到 `toggle` 方法改变了 `finished` 属性的值，而 `finished` 是被标记为 `observable` 的。建议您将所有修改 `observable` 值的代码标记为 [`action`](actions.md)。这会让 MobX可以自动进行事务处理以便轻松获得最佳性能。




使用 Action 可以帮助您整理代码，并防止您在无意中修改了 State。
在 MobX 术语中，可以修改 State 的方法被称为 _action(动作)_ 。这与基于当前状态来生成新信息的 _view(视图)_ 是不同的。
您代码中的每一个方法只应完成上述两个目标中的一个。


### 3. 创建 Derivations 以便自动对 State 变化进行响应

_任何_ 来源是_State(状态)_ 并且不需要进一步交互的东西都是 Derivation(派生)。

Derivations 包括许多方式:

-   _用户界面_
-   _派生数据_ , 比如剩余未完成`todos`的数量
-   _后端集成_ , 比如发送改变到服务器端

Mobx 区分了两种 Derivation :

-   _Computed values_,总是可以通过纯函数从当前的可观测 State 中派生。
-   _Reactions_, 当 State 改变时需要自动发生的副作用 (命令式编程和反应式编程之间的桥梁)


当最开始使用MobX时，人们倾向于过度使用 _Reaction_。

黄金法则是，如果要基于当前 State 创建值，请始终使用 _computed_。

#### 3.1. 模型中通过 computed 派生值

为了创建一个 _computed_ 值，您需要定义一个 getter 方法并将其用 `makeObservable` 标记为 `computed`

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

Mobx 会确保 `unfinishedTodoCount` 会在一个todos数组发生变化中或者 todos中的一个对象中的 `finished`属性被修改时自动更新。

这些计算类似于 Excel 单元格中的公式。它们会自动更新，但仅在需要时更新。也就是说，如果有有人关心其结果时才会更新。

#### 3.2. Model side effects using reactions

For you as a user to be able to see a change in state or computed values on the screen, a _reaction_ that repaints a part of the GUI is needed.

Reactions are similar to computed values, but instead of producing information, they produce side effects like printing to the console, making network requests, incrementally updating React component tree to patch the DOM, etc.

In short, reactions bridge the worlds of [reactive](https://en.wikipedia.org/wiki/Reactive_programming) and [imperative](https://en.wikipedia.org/wiki/Imperative_programming) programming.

By far the most used form of reactions are UI components.
Note that it is possible to trigger side effects from both actions and reactions.
Side effects that have a clear, explicit origin from which they can be triggered, such
as making a network request when submitting a form, should be triggered explicitly from the relevant event handler.

#### 3.3. Reactive React components

If you are using React, you can make your components reactive by wrapping them with the [`observer`](react-integration.md) function from the bindings package you've [chosen during installation](installation.md#installation). In this example, we're going to use the more lightweight `mobx-react-lite` package.

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

`observer` converts React components into derivations of the data they render.
When using MobX there are no smart or dumb components.
All components render smartly, but are defined in a dumb manner. MobX will simply make sure the components are always re-rendered whenever needed, and never more than that.

So the `onClick` handler in the above example will force the proper `TodoView` component to re-render as it uses the `toggle` action, but will only cause the `TodoListView` component to re-render if the number of unfinished tasks has changed.
And if you would remove the `Tasks left` line (or put it into a separate component), the `TodoListView` component would no longer re-render when ticking a task.

To learn more about how React works with MobX, check out the [React integration](react-integration.md) section.

#### 3.4. Custom reactions

You will need them rarely, but they can be created using the [`autorun`](reactions.md#autorun),
[`reaction`](reactions.md#reaction) or [`when`](reactions.md#when) functions to fit your specific situations.
For example, the following `autorun` prints a log message every time the amount of `unfinishedTodoCount` changes:

```javascript
// A function that automatically observes the state.
autorun(() => {
    console.log("Tasks left: " + todos.unfinishedTodoCount)
})
```

Why does a new message get printed every time the `unfinishedTodoCount` is changed? The answer is this rule of thumb:

_MobX reacts to any existing observable property that is read during the execution of a tracked function._

To learn more about how MobX determines which observables need to be reacted to, check out the [Understanding reactivity](understanding-reactivity.md) section.

## Principles

MobX uses a uni-directional data flow where _actions_ change the _state_, which in turn updates all affected _views_.

![Action, State, View](assets/action-state-view.png)

1. All _derivations_ are updated **automatically** and **atomically** when the _state_ changes. As a result, it is never possible to observe intermediate values.

2. All _derivations_ are updated **synchronously** by default. This means that, for example, _actions_ can safely inspect a computed value directly after altering the _state_.

3. _Computed values_ are updated **lazily**. Any computed value that is not actively in use will not be updated until it is needed for a side effect (I/O).
   If a view is no longer in use it will be garbage collected automatically.

4. All _computed values_ should be **pure**. They are not supposed to change _state_.

To learn more about the background context, check out [the fundamental principles behind MobX](https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8).

## Try it out!

You can play with the above examples yourself on [CodeSandbox](https://codesandbox.io/s/concepts-principles-il8lt?file=/src/index.js:1161-1252).

## Linting

If you find it hard to adopt the mental model of MobX, configure it to be very strict and warn you at runtime whenever you deviate from these patterns. Check out the [linting MobX](configuration.md#linting-options) section.
