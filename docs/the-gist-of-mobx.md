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



让我们仔细看看下面的这些概念，或者在[10分钟的MobX和React简介](https://zh.mobx.js.org/getting-started.html)中，您可以通过交互方式逐步深入了解这些概念，并构建一个简单的待办事项列表(Todo List)应用程序。


### 1. 定义 State 并使其可观察



_State(状态)_ 是驱动你的应用程序的数据。

通常来说，状态有_领域特定状态_（比如 Todo List 中的列表项数据）和_视图状态_ （比如当前选中的列表元素）。State 就像保存着数据的电子表格单元格一样。

将 State 存储在任何您喜欢的数据结构中：普通对象、数组、类、循环数据结构或引用。这与MobX的工作方式无关。

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

在 `Todo` 类中，我们可以看到 `toggle` 方法改变了 `finished` 属性的值，而 `finished` 是被标记为 `observable` 的。建议您将所有修改 `observable` 值的代码标记为 [`action`](actions.md)。MobX 可以自动进行事务处理以轻松实现最佳性能。



使用 Action 可以帮助您更好地组织代码，并防止您在无意中修改 State。

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
-   _Reactions_, 当 State 改变时需要自动运行的副作用 (命令式编程和响应式编程之间的桥梁)


当最开始使用MobX时，人们容易过度使用 _Reaction_。

黄金法则是，如果要基于当前 State 创建值，请始终使用 _computed_。

#### 3.1. 通过 computed 对派生值进行建模

你可以通过定义 getter 方法并使用 `makeObservable` 将其标记为 `computed` 的方式创建一个 _computed_ 值。

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

Mobx 会确保 `unfinishedTodoCount` 会在todos数组发生变化中或者 todos中的一个对象中的 `finished`属性被修改时自动更新。

这些计算类似于 Excel 单元格中的公式。它们仅在需要时自动更新。也就是说，如果有观察者使用其结果时才会更新。也就是说，如果有有人关心其结果时才会更新。

#### 3.2. 使用 reaction 对副作用建模

作为用户，要想在屏幕上看到状态或计算值的变化，就需要一个重新绘制部分GUI的 _reactions_ 。

Reaction 和 computed 类似，但并不产生信息，而是产生副作用，如打印到控制台、发出网络请求、增量更新 React 组件树以便更新DOM等。

简而言之，_reaction_ 是 [响应式编程](https://en.wikipedia.org/wiki/Reactive_programming)和[指令式编程](https://en.wikipedia.org/wiki/Imperative_programming)之间的桥梁。


到目前为止，最常用的 reaction 形式是UI组件。
注意，action 和 reaction 都可能引起副作用。
副作用应有一个清晰的、显式的起源，例如在提交表单时发出网络请求，应该从相关的事件处理程序显式触发。


#### 3.3. 响应式 React 组件

如果使用 React，你可以将组件用[安装](installation.md#installation)中下载的包中的[`observer`](react-integration.md)函数来包装起来，以便让组件成为响应式的。在这个示例中，我们将用更轻量的 `mobx-react-lite` 包。


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

`observer` 将 React 组件转化为了从数据到渲染的派生过程。
当使用 MobX 的时，不存在“智能组件”和“木偶组件”。所有的组件在渲染时都是智能的，但是在定义时是按照木偶组件的方式去定义的。MobX会简单确定这个组件是否需要进行重绘，并止步于此。

因此，上述示例中的`onClick`事件处理器调用`toggle` Action 后，会使对应的`TodoView`组件重绘，但仅当未完成任务的数量发生更改时才会使 `TodoListView` 组件重绘。

如果移除了`Tasks left`这行代码（或者把他拆分到另一个组件中）,`TodoListView`组件就不再 `toggle` 执行时产生重绘了。

您可以查阅[与 React 集成](react-integration.md)来了解更多有关 React 是如何与 MobX 协同运作的。



#### 3.4. 自定义 Reaction

通常情况下你不需要使用它们，可以使用 [`autorun`](reactions.md#autorun) ,[`reaction`](reactions.md#reaction) 或 [`when`](reactions.md#when) 方法来订制你的特殊业务场景。

比如，下面的 `autorun` 将在`unfinishedTodoCount`的数量发生变化时输出日志。


```javascript
// 一个自动观察state的函数
autorun(() => {
    console.log("Tasks left: " + todos.unfinishedTodoCount)
})
```

为什么每次 `unfinishedTodoCount`发生改变时都会输出日志信息呢？答案是以下法则：

_MobX对在执行跟踪函数期间读取的任何现有可观察属性作出响应_。

要了解更多关于MobX如何确定需要对哪些可观察对象作出响应的信息，请查看 [理解响应性](understanding-reactivity.md) 章节。

## 原则

Mobx 使用单向数据流，利用 _action_ 改变 _state_ ，进而更新所有受影响的 _view_


![Action, State, View](assets/action-state-view.png)

1. 所有的 _derivations_ 将在 _state_ 改变时**自动且原子化地更新**。因此不可能观察中间值。
2. 所有的 _derivations_ 默认将会**同步**更新，这意味着 _action_ 可以在 _state_ 改变 之后安全的直接获得 computed 值。
3. _computed value_ 的更新是**惰性**的，任何 computed value 在需要他们的副作用发生之前都是不激活的。
4. 所有的 _computed value_ 都应是**纯函数**,他们不应该修改 _state_。

想了解更多背景，请查阅 [MobX背后的基本原则](https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8)


## 试一试!

你可以在[CodeSandbox](https://codesandbox.io/s/concepts-principles-il8lt?file=/src/index.js:1161-1252) 上尝试运行上面的示例。


## 提示

如果您发现很难适应 MobX 的心智模型，请将其配置为严格模式，在运行时偏离这些模式的情况下将会发出警告。更多信息请查看[linting MobX](configuration.md#代码lint选项)章节。

