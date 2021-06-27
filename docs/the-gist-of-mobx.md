---
title: The gist of MobX
sidebar_label: The gist of MobX
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# MobX的主旨

## 概念

在你的应用中, MobX区分出了以下三个概念:

1. State
2. Actions
3. Derivations

下面让我们仔细看看的这些概念, 或者在[10分钟介绍MobX和React](https://mobx.js.org/getting-started)中进一步了解这些概念, 并且在这里你可以一步一步地深入研究这些概念，并构建一个简单的`Todo list`应用程序。

### 1. 定义state并让其可观察

简而言之: `State`是驱动应用程序变化的数据.

通常来说, 就是有一个特定范围的`State`，比如一个待办事项列表. 也会有视图`State`, 例如当前选中的元素, 或者说`State`像保存值的单元格.

可以使用任何你喜欢的数据结构在`State`中: 普通的对象, 数组, 类, 循环数据结构或其他引用类型, 这与MobX的工作方式无关.

只要确保所有你想要更改的属性都被标记为`observable`, 这样MobX就可以追踪到它们.

一个简单的例子:

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

**提醒**: 这个例子可以使用[`makeAutoObservable`](observable-state.md)进行简化, 并且通过这样我们可以了解更多的细节并展示不同的概念.

使用`observable`就像是将对象的属性转换为单元格. 但又不完全像表格, 因为这些值不仅可以是原始值, 也可以是引用, 对象, 数组. 

那么如何触发状态更新呢? 是不是我们下面要介绍的`Actions`

### 2. 使用actions更新状态

`action`是一段改变`state`的代码, 它可以是用户事件, 后端数据推送, 定时事件等等...
形象点说: `action`就类似于向单元格输入新值的用户

在上面的`Todo`模型中, 你可以看到我们有一个更改`finished`值的`toggle`方法. `finished`被标记为了`observable`. 推荐你将任何改变`observable`的代码作为`action`(actions.md), 这样的话, MobX就可以自动的使用事务, 毫不费力地获得最佳性能.

使用actions帮助你组织代码, 并防止你无意中更改状态的情况发生. 在Mobx术语中, 修改状态的方法被叫做`actions`,  与`views`相反, `actions`是基于当前状态计算出新的状态. 每一种方法最多只能服务于这两个目标中的一个。

### 3. 创建自动响应状态更改的派生

可以从没有任何更深相互影响的`state`导出`Anything`是派生行为

派生以多种形式存在:

-   用户接口
-   派生的数据, such as the number of remaining `todos` 比如剩余待办事项的数量
-   后端集成, 例如: 发送更改到服务器端

MobX区分了两种派生:

-   `computed values`, 它总是可以从当前`observable`状态使用纯函数提取.
-   `Reactions`, 它是当状态改变时自动去触发副作用(连接命令式编程和反应式编程)

当开始使用MobX时, 人们往往会过度使用`reactions`. 其实黄金法则是: 如果你想基于当前状态创建一个新值时, 总是使用`computed`

#### 3.1. 使用computed建立模型

要创建一个`computed`值, 使用JavaScript的getter函数`get`定义一个属性, 并使用`makeObservable`将其标记为`computed`

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

当待办事项被添加或者`finished`某个属性被修改时, MobX将确保`unfinishedTodoCount`自动更新

这些计算类似Excel中单元格程序公式, 它们只在需要的时候自动更新.

#### 3.2. 使用reactions模拟副作用

为了使你作为一个用户也能够在屏幕上看到`state`或`computed`的更改, 重绘`reaction`一部分的GUI是有必要的

`Reactions` 与 `computed`是相似的, 但不是生成信息的. 它会引发一些副作用, 比如打印到控制台的副作用, 发送网络请求, 增量更新React组件树来修补DOM等等...

总之, `reactions`架起了`reactive`[reactive](https://en.wikipedia.org/wiki/Reactive_programming)世界的桥梁和[imperative](https://en.wikipedia.org/wiki/Imperative_programming) 的程序

到目前为止，最常用的`reactions`形式是UI组件。

注意: `actions`和`reactions`都有可能会触发副作用

副作用有明显的, 它们可以被触发的来源是清晰的, 例如当提交表单时发送一个网络请求, 应该在相关的事件句柄中明确地触发.

#### 3.3. 响应式的React组件

如果你正在使用React, 你可以通过包裹绑定包里的`observer`函数[`observer`](react-integration.md)让你的组件变的可响应, 你已经选择了[chosen during installation](installation.md#installation), 在这个例子中, 我们将使用更轻量级的`mobx-react-lite`包

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
`observer`将React组件转为它们渲染的数据的派生, 当使用MobX时，没有智能或低级的组件
所有组件的渲染都很巧妙, 但是被定义为一种愚蠢的方式. MobX只不过是确保组件每当需要的更新的时候总被重渲染, 不会做超出此范围的事情

所以上面例子中的`onClick`将强制`TodoView`组件重渲染, 因为它使用了`toggle`动作, 如果`unfinished`的数量发生了改变, 这将只会导致`TodoListView` 组件重渲染
如果你想移除`Tasks left`这一行(或者把它分成单独的组件), 那么当勾选一个任务时`TodoListView`组件将不再重渲染

想了解更多React如何与MobX一起工作, 去查看[React集成](react-integration.md)这部分内容

#### 3.4. 定制的reactions

你很少会用到它们, 但它们可以使用[`autorun`](reactions.md#autorun)被创建
[`reaction`](reactions.md#reaction)或者[`when`](reactions.md#when)函数可以去适配你特定的场景

例如: 当`unfinishedTodoCount`数量改变时, 下面的`autorun`每次打印一行日志信息

```javascript
// A function that automatically observes the state.
autorun(() => {
    console.log("Tasks left: " + todos.unfinishedTodoCount)
})
```
为什么每次更改' unfinishedTodoCount '时都会打印一条新消息? 答案就是这条经验法则: 
MobX对被跟踪函数执行过程中读取的所有现有可观察属性并做出反应

要了解更多关于MobX如何决定哪些可观察对象需要做出反应的信息，请查看 [了解反应](understanding-reactivity.md)一节。

## 原则

MobX使用单向数据流，其中actions更改state，这反过来更新所有受影响的views。

![Action, State, View](assets/action-state-view.png)

1. 当`state`发生变化时，所有的派生都会**自动**更新。因此，永远不可能观察到中间值.

2. 默认情况下，所有derivations都是同步更新的。这意味着，`actions`可以在修改`state`之后直接安全地检查一个`computed`值
   
3. `Computed value`是**惰性**更新的。任何不积极使用的`computed value`都不会更新，直到出现副作用(I/O)时才会更新。如果一个视图不再使用，它将被自动垃圾收集。

4. 所有`computed values`应该是纯的。它们不应该改变`state`。

要了解更多关于背景背景的知识，请查看[MobX背后的基本原理](https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8)。

## 尝试!

你可以自己在[CodeSandbox](https://codesandbox.io/s/concepts-principles-il8lt?file=/src/index.js:1161-1252)上尝试上面的例子。

## 校验

如果你觉得很难采用MobX的思维模式，可以将其配置得非常严格，并在运行时每当你偏离这些模式时都会警告你。查看[linting MobX](configuration.md#linting-options)一节。
