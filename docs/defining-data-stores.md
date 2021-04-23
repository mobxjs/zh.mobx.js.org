---
title: 定义数据存储
sidebar_label: 定义数据存储
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 定义数据存储

本章是我们在 Mendix 使用 MobX 工作时，发现的一些构建大规模可维护项目的最佳实践。
这一章是出于个人见解，你完全不必强行应用这些实践。有很多种使用 MobX 和 React 的方式，这里写出的仅仅只是其中一个。

本章主要介绍一种不唐突的使用 MobX 的方式，它可以和已有的代码库或者经典的 MVC 模式配合得很好。或者，还有一种组织 stores 更专用的方式：使用 [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) 和 [mobx-keystone](https://mobx-keystone.js.org/)，它们都自带一些很酷的功能: 结构共享快照、action 中间件、JSON 补丁支持等等，开箱即用。

## Stores

Stores 可以在任何 Flux 架构中找到，并且可以和 MVC 模式中的 controllers 做类比。
Stores 的主要职责是将 _逻辑_ 和 _状态_ 从组件中移至一个可独立测试的单元，并能同时在前后端的 JavaScript 中使用。

大多数应用都可以从定义这两个 stores 中得到好处：一个用于 _领域状态_，另一个用于 _UI 状态_。区分这两类的好处是：你可以跨前后端重用和测试 _领域状态_，并且可以很好地在其他应用中重用它。

## 领域 Stores

你的应用可以包含一个或多个 _领域_ stores。
这些 stores 存储着应用的所有数据。
待办事项、用户、书籍、电影、订单、还有各种你能叫出名字来的东西。
大多数时候，你的应用至少有一个领域 store。

领域 store 应该和应用中的业务概念一一对应。一个 store 通常被组织成一个树状结构，里面有多个领域对象。

举例来说：你的产品对应一个领域 store，订单和订单线对应另一个。根据经验：如果两个东西之间是包含关系，它们通常应该在一个 store 里。
因此，store 只是在管理 _领域对象_。

Store 的职责:

-   实例化领域对象，确保领域对象知道它们所属的 store。
-   确保每个领域对象只有一个实例。
    同一个用户、订单或者待办事项不应该在内存中存储两次。
    这样，你可以可以安全地使用引用，并确保正在查看的实例是最新的，而无需解析引用。
    这一点在调试的时候十分快速、简单、方便。
-   提供后端集成，当需要时存储数据。
-   如果从后端接收到更新，则更新现有实例。
-   为应用提供一个独立、通用、可测试的组件。
-   要确保 store 是可测试的并且可以在服务端运行，你可能需要将实际的 websocket / http 请求移到单独的对象中，以便你可以抽象出通信层。
-   Store 应该只有一个实例。

### 领域对象

每个领域对象都应该用它自己的类（或构造函数）来表达。
没有必要把客户端应用的状态当作某种数据库。
真实引用、循环数据结构和实例方法是 JavaScript 中强大的概念。
领域对象可以直接引用其他 store 中的领域对象。
请记住：我们想让我们的操作和视图尽可能的简单，需要管理引用和自己做垃圾回收可能是一种退步。
与 Redux 等许多 Flux 架构不同，MobX 不需要对你的数据进行标准化处理，这使得业务规则、操作和用户界面这些在构建应用时 _本质上_ 最复杂的部分变得简单得多。


只要适合你的应用，领域对象可以将它们的所有逻辑委托给 store。
将领域对象表达为普通对象是可能的，但相比普通对象，类有一些重要的优势：

-   它们可以有方法。
    这使得领域概念更容易独立使用，并减少应用所需感知的上下文的数量。
    只传递对象。
    不需要到处传递 store。如果它们只是作为实例方法可用，那你也不需要弄清楚哪些操作可以在对象上使用。
    这一点在大型应用中尤为重要。
-   它们对属性和方法的可见性提供精细的控制。
-   使用构造函数创建的对象可以自由地混合 observable 属性和函数、以及非 observable 属性和函数。
-   它们很容易辨认，并且可以进行严格的类型检查。

### 领域 store 示例

```javascript
import { makeAutoObservable, autorun, runInAction } from "mobx"
import uuid from "node-uuid"

export class TodoStore {
    authorStore
    transportLayer
    todos = []
    isLoading = true

    constructor(transportLayer, authorStore) {
        makeAutoObservable(this)
        this.authorStore = authorStore // 可以提供 author 的 store
        this.transportLayer = transportLayer // 可以发起服务端请求的东西
        this.transportLayer.onReceiveTodoUpdate(updatedTodo =>
            this.updateTodoFromServer(updatedTodo)
        )
        this.loadTodos()
    }

    // 从服务端拉取所有的 todo 数据
    loadTodos() {
        this.isLoading = true
        this.transportLayer.fetchTodos().then(fetchedTodos => {
            runInAction(() => {
                fetchedTodos.forEach(json => this.updateTodoFromServer(json))
                this.isLoading = false
            })
        })
    }

    // 用来自服务器的信息更新一个 Todo。保证一个 Todo 只存在一次
    // 可以构建一个新的 Todo，更新一个现有的 Todo
    // 如果一个 Todo 在服务器上被删除，则删除该 Todo
    updateTodoFromServer(json) {
        let todo = this.todos.find(todo => todo.id === json.id)
        if (!todo) {
            todo = new Todo(this, json.id)
            this.todos.push(todo)
        }
        if (json.isDeleted) {
            this.removeTodo(todo)
        } else {
            todo.updateFromJson(json)
        }
    }

    // 在客户端和服务器上创建一个新的 Todo
    createTodo() {
        const todo = new Todo(this)
        this.todos.push(todo)
        return todo
    }

    // 一个 Todo 被删除了，就从客户端内存中清除掉
    removeTodo(todo) {
        this.todos.splice(this.todos.indexOf(todo), 1)
        todo.dispose()
    }
}

// Todo 的领域对象
export class Todo {
    id = null // todo 的唯一 id, 不可改变。
    completed = false
    task = ""
    author = null // 引用一个 author 对象 (来自 authorStore)
    store = null
    autoSave = true // 指示此对象的更改是否应提交到服务器
    saveHandler = null // 为自动保存 Todo 的副作用提供的清理方法 (dispose)

    constructor(store, id = uuid.v4()) {
        makeAutoObservable(this, {
            id: false,
            store: false,
            autoSave: false,
            saveHandler: false,
            dispose: false
        })
        this.store = store
        this.id = id

        this.saveHandler = reaction(
            () => this.asJson, // 观察在 JSON 中使用了的任何东西:
            json => {
                // 如果 autoSave 为 true, 把 json 发送到服务端
                if (this.autoSave) {
                    this.store.transportLayer.saveTodo(json)
                }
            }
        )
    }

    // 在客户端和服务端中删除此 Todo
    delete() {
        this.store.transportLayer.deleteTodo(this.id)
        this.store.removeTodo(this)
    }

    get asJson() {
        return {
            id: this.id,
            completed: this.completed,
            task: this.task,
            authorId: this.author ? this.author.id : null
        }
    }

    // 使用服务端信息更新此 Todo
    updateFromJson(json) {
        this.autoSave = false // 确保变更不会保存到服务器
        this.completed = json.completed
        this.task = json.task
        this.author = this.store.authorStore.resolveAuthor(json.authorId)
        this.autoSave = true
    }

    // 清理 observer
    dispose() {
        this.saveHandler()
    }
}
```

## UI stores

_UI 状态 store_ 通常对应用来说非常具体，但一般也很简单。这类 store 通常没有太多的逻辑，但会存储大量关于 UI 的松散耦合的信息。
这一点很棒，因为大多数应用在开发过程中会经常改变 UI 状态。

通常可以在 UI stores 中找到:

-   Session 信息
-   应用加载阶段的信息
-   不会存储到后端的信息
-   影响全局 UI 的信息
    -   Window 尺寸
    -   可访问性信息
    -   当前语言
    -   当前主题
-   会影响多个无关组件的界面状态：
    -   当前选中项
    -   工具栏可见性等等
    -   向导的状态
    -   全局遮罩层的状态

这些信息很可能一开始只是某个组件的内部状态（例如一个工具条的可见性），但过了一段时间，你发现在应用的其他地方也需要这些信息。
在这种情况下，你不需要像在普通的 React 应用中那样，把状态往组件树的上级移动，只需要把状态移到 _UI 状态 store_ 中。

对于同构应用，你可能还想为 store 提供一个默认值，以便组件能正常渲染。
你可以通过 React context 把 _UI 状态 store_ 在应用中传递下去。

store 示例（使用 ES6 语法）：

```javascript
import { makeAutoObservable, observable, computed, asStructure } from "mobx"

export class UiState {
    language = "en_US"
    pendingRequestCount = 0

    // .struct 确保对象只有以 deepEqual 的方式更新时，才会触发 observer
    windowDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    constructor() {
        makeAutoObservable(this, { windowDimensions: observable.struct })
        window.onresize = () => {
            this.windowDimensions = getWindowDimensions()
        }
    }

    get appIsInSync() {
        return this.pendingRequestCount === 0
    }
}
```

## 组合多个 stores

一个经常被问到的问题是：如何在不使用单例的情况下组合多个 stores，stores 之间如何相互通信？

创建一个 `RootStore` 是解决这个问题的有效模式：把所有 stores 实例化，并共享引用。这种模式的优点如下：

1. 易于设置
2. 支持强类型
3. 因为只需要实例化一个 root store，复杂的单元测试会变得简单一点

示例：

```javascript
class RootStore {
    constructor() {
        this.userStore = new UserStore(this)
        this.todoStore = new TodoStore(this)
    }
}

class UserStore {
    constructor(rootStore) {
        this.rootStore = rootStore
    }

    getTodos(user) {
        // 通过 root store 来访问 todoStore
        return this.rootStore.todoStore.todos.filter(todo => todo.author === user)
    }
}

class TodoStore {
    todos = []
    rootStore

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false })
        this.rootStore = rootStore
    }
}
```

使用 React 时，root store 一般通过 React context 插入到组件树中。
