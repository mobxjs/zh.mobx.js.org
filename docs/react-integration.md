---
title: 集成React（react-integration）
sidebar_label: 集成React（react-integration）
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 集成React（react-integration）

用法:

```javascript
import { observer } from "mobx-react-lite" // 或者 "mobx-react".

const MyComponent = observer(props => ReactElement)
```

虽然 MobX 可以独立于 React 运行, 但他们通常结合在一起使用。在 [Mobx宗旨（The gist of MobX）](the-gist-of-mobx.md) 一文中你已经了解过这种结合的最重要的部分：包裹React组件的 `observer` [HOC](https://reactjs.org/docs/higher-order-components.html)。

`observer` 由单独[安装](installation.md#installation)的React Bindings包提供。 在下面的例子中,我们将使用更轻量的[`mobx-react-lite` 包](https://github.com/mobxjs/mobx/tree/main/packages/mobx-react-lite)。

```javascript
import React from "react"
import ReactDOM from "react-dom"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

class Timer {
    secondsPassed = 0

    constructor() {
        makeAutoObservable(this)
    }

    increaseTimer() {
        this.secondsPassed += 1
    }
}

const myTimer = new Timer()

// 被`observer`包裹的函数式组件会对它使用过的可观察对象的任何改变做出响应
const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

ReactDOM.render(<TimerView timer={myTimer} />, document.body)

setInterval(() => {
    myTimer.increaseTimer()
}, 1000)
```

**提示:** 你可以在 [在线编译器CodeSandbox](https://codesandbox.io/s/minimal-observer-p9ti4?file=/src/index.tsx)中尝试上面的例子。

 `observer` HOC 将自动订阅 React 组件中所有 _在渲染期间_ 被使用的 _可观察的对象_ (observables)。因此, 当与之关联的可观察的对象发生 _变化_ 时，组件会自动重新渲染。它还会确保组件在 _没有关联的变化_ 发生时，不会重新渲染。所以，当组件能够访问的、但实际没有被组件读取的可观察对象发生变化时，组件不会重新渲染。

在实践中，这一特性使得MobX应用程序能够被很好地开箱即用地优化，并且通常不需要任何额外代码来防止过度渲染。

要想让`observer`生效, 并不需要关心这些对象是 _如何触达到_ 组件的（译者注：即无需关心组件如何访问这些可观察对象）, 只需要关心他们是否被读取。读取深层嵌套的可观察对象也没有问题, 复杂的表达式类似 `todos[0].author.displayName` 也是可以使用的。与其他必须显式声明或预先计算数据依赖关系的框架（例如 selectors）相比，这种发生的订阅机制就显得更加精确和高效。


## 本地与外部状态（Local and external state）

在 Mobx 可以非常灵活的组织或管理状态, 从（技术角度讲）它不关心我们如何读取可观察对象，也不关心他们来自哪里。
下面的例子将通过不同的设计模式去展示如何在 `observer` 包裹的组件中使用外部或本地状态。

### `observer` 组件中使用外部状态 （Using external state in `observer` components）

<!--DOCUSAURUS_CODE_TABS-->
<!--使用 props-->

可被观察对象可以通过组件的props属性传入  (在下面的例子中):

```javascript
import { observer } from "mobx-react-lite"

const myTimer = new Timer() // 请参考之前Timer的定义.

const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

// 将myTimer作为props传递.
ReactDOM.render(<TimerView timer={myTimer} />, document.body)
```

<!-- 使用全局变量 -->

因为我们不关心 _如何_ 引用（reference）可观察对象, 所以我们可以使用 （consume）
外部作用域（outer scopes directly）中的可观察对象  (类似通过 import这样的方法, 等等)：

```javascript
const myTimer = new Timer() //  请参考之前Timer的定义.

// 没有props, `myTimer` 直接从作为闭包中的变量使用。
const TimerView = observer(() => <span>Seconds passed: {myTimer.secondsPassed}</span>)

ReactDOM.render(<TimerView />, document.body)
```

直接使用可观察对象的效果很好，但是这通常会引入模块状态，这种写法可能会使单元测试变得复杂。 因此，我们建议使用React Context。

<!--使用 React context-->

使用[React Context](https://reactjs.org/docs/context.html)共享整个可观察子树是一种很不错的选择：

```javascript
import {observer} from 'mobx-react-lite'
import {createContext, useContext} from "react"

const TimerContext = createContext<Timer>()

const TimerView = observer(() => {
    // 从context中获取timer.
    const timer = useContext(TimerContext) // 可以在上面查看 Timer的定义。
    return (
        <span>Seconds passed: {timer.secondsPassed}</span>
    )
})

ReactDOM.render(
    <TimerContext.Provider value={new Timer()}>
        <TimerView />
    </TimerContext.Provider>,
    document.body
)
```

需要注意的是我们不推荐用不同的值替换掉同一个 `Provider` 的 `value` （译者注：例如每次状态更新之后都更新 `Provider` 的 `value` , 通常开发者这样做意在使子树拿到最新的状态，从而更新视图）. 在使用Mobx的过程中不需要这样做, 因为共享的可观察对象会自己更新。

<!--END_DOCUSAURUS_CODE_TABS-->

### 在`observer` 组件中使用本地可观察对象（Using local observable state in `observer` components）

因为被 `observer` 使用的可观察对象可以来自任何地方, 它们当然也可以是来自本地（译者注：即来自本组件）。
当然，这几种不同的使用方式对于MobX而言都是可行的。

<!--DOCUSAURUS_CODE_TABS-->
<!-- useState 和 observable class-->

使用本地可观察对象的最简单的方式就是通过`useState`去存储一个本地可观察对象的引用。需要注意的是, 因为我们不需要替换本地可观察对象的引用, 所以我们其实可以完全不声明`useState`的更新方法:

```javascript
import { observer } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const [timer] = useState(() => new Timer()) // Timer的定义在上面。
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

如果你想像最开始那样自动更新 timer, 可以使用`useEffect` 这种在React中的经典写法：

```javascript
useEffect(() => {
    const handle = setInterval(() => {
        timer.increaseTimer()
    }, 1000)
    return () => {
        clearInterval(handle)
    }
}, [timer])
```

<!-- useState 与局部可观察对象-->

如之前说的那样, 可以直接创建可观察的对象，而不用classes。可以参考 [observable](observable-state.md#observable)：

```javascript
import { observer } from "mobx-react-lite"
import { observable } from "mobx"
import { useState } from "react"

const TimerView = observer(() => {
    const [timer] = useState(() =>
        observable({
            secondsPassed: 0,
            increaseTimer() {
                this.secondsPassed++
            }
        })
    )
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

<!-- useLocalObservable hook -->

`const [store] = useState(() => observable({ /* something */}))` 是非常通用的一套写法， 为了简化这个写法我们可以调用`mobx-react-lite` 包中的 [`useLocalObservable`](https://github.com/mobxjs/mobx-react#uselocalobservable-hook) hook ,可以将上面的例子简化成：

```javascript
import { observer, useLocalObservable } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const timer = useLocalObservable(() => ({
        secondsPassed: 0,
        increaseTimer() {
            this.secondsPassed++
        }
    }))
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

<!--END_DOCUSAURUS_CODE_TABS-->

### 你可能并不需要本地的可观察状态 （You might not need locally observable state）

通常来讲，我们不推荐在编写本地组件的时候立刻使用Mobx的可观察能力， 因为从技术角度来看，这可能会使你无法使用一些React Suspense 的方法特性。根据经验，当包含业务数据的State（the state captures domain data）需要在组件间（包括后代组件）共享时再去使用 `Mobx`，比如 todo 项、用户信息、书籍列表等。

仅包含UI的state, 例如加载的 state, 选择的 state,等等, 最好还是使用 [`useState` hook](https://reactjs.org/docs/hooks-state.html), 因为这样可以让你在未来使用高级的 React suspense特性。

在React组件中使用可观察的对象能够创造加价值，只要： 1) 层级很深, 2) 拥有计算属性 3) 需要共享状态给其它 `observer` 组件。

## 永远在`observer` 组件中读取可观察对象（Always read observables inside `observer` components）

你可能想问, 我应该什么时候使用 `observer`? 大体上说:  _ 给所有读取可观察对象的组件上包裹上`observer`_ 。

`observer` 只会增强被它装饰的组件, 而非被它调用的组件. 所以通常你所有的组件都应该被 `observer` 包裹。但是不要担心， 它不会导致性能损失。相反, 更多的 `observer` 组件可以使渲染更高效，因为它们更新数据的颗粒度更细。

### 小贴士: 尽可能晚地从对象中获取值

只要你传递对象引用，并且只从基于 `observer` 的组件中读取对象的属性并渲染到 DOM / low-level组件，`observer` 就可以很好的工作。 另外， `observer` 也会对从对象上解引用到的值做出反应。

下面的例子中, `TimerView` 组件**不会**响应未来的更新，因为`.secondsPassed`不是在 `observer`组件内部读取的而是在外部读取的,因此它_不会_被追踪到：

```javascript
const TimerView = observer(({ secondsPassed }) => <span>Seconds passed: {secondsPassed}</span>)

React.render(<TimerView secondsPassed={myTimer.secondsPassed} />, document.body)
```

需要注意的一点是不同于其它的观念模式库，比如 `react-redux`那样, redux 中强调尽可能早的获取和传递原始值以获得更好的副作用响应。如果你还是没有理解, 可以先阅读 [理解响应式（Understanding reactivity）](understanding-reactivity.md) 这篇文章。

### 不要将可观察对象传递到没有用`observer`包裹的组件（Don't pass observables into components that aren't `observer`）

通过`observer`包裹的组件 _只可以_ 订阅到在 _他们自己_ 渲染的期间的可观察对象. 所以，如果要将可观察对象 objects / arrays / maps 传递到子组件中, 子组件必须被 `observer` 包裹。这也同样适用于任何基于回调的组件（译者注：如RenderProps）。

如果你非要传递可观察对象到未被`observer`包裹的组件中， 要么是因为它是第三方组件，要么你需要组件对Mobx无感知，那你必须在传递前 [转换可观察对象为普通的JavaScript值或集合 （convert the observables to plain JavaScript values or structures）](observable-state.md#将-observable-转换回普通的-javascript-集合) 。

关于上述的详细描述,可以看一下下面的使用 `todo` 对象的例子， 一个 `TodoView` (observer)组件和一个虚构的接收一组对象映射入参的不是`observer`的`GridRow`（但并未被 `observer` 包裹）组件：

```javascript
class Todo {
    title = "test"
    done = true

    constructor() {
        makeAutoObservable(this)
    }
}

const TodoView = observer(({ todo }: { todo: Todo }) =>
   // 错误: GridRow 不能获取到 todo.title/ todo.done 的变更
   //       因为他不是一个观察者（observer。
   return <GridRow data={todo} />

   // 正确:在 `TodoView` 中显式的声明相关的`todo` ，
   //      到data中。
   return <GridRow data={{
       title: todo.title,
       done: todo.done
   }} />

   // 正确: 使用 `toJS`也是可以的, 并且是更清晰直白的方式。
   return <GridRow data={toJS(todo)} />
)
```

###  回调组件可能会需要`<Observer>`（ Callback components might require `<Observer>`）

想象一下在同样的例子中,  `GridRow` 携带一个 `onRender`回调函数。因为`onRender` 是 `GridRow`渲染生命周期的一部分, 而不是 `TodoView` 的render (甚至在语法层面都能看出来)，我们必须保证回调组件是一个 `observer` 组件。或者，我们可以使用 [`<Observer />`](https://github.com/mobxjs/mobx-react#observer)创建一个匿名观察者：

```javascript
const TodoView = observer(({ todo }: { todo: Todo }) => {
    // 错误: GridRow.onRender 不能获得 todo.title / todo.done 中的改变
    //        因为它不是一个观察者（observer） 。
    return <GridRow onRender={() => <td>{todo.title}</td>} />

    // 正确: 将回调组件通过Observer包裹将会正确的获得变化。
    return <GridRow onRender={() => <Observer>{() => <td>{todo.title}</td>}</Observer>} />
})
```

## 小贴士

<details id="static-rendering"><summary>服务器渲染 (SSR)<a href="#static-rendering" class="tip-anchor"></a></summary>
如果 `observer` 是服务器渲染的 rendering context；请确保调用 `enableStaticRendering(true)`， 这样 `observer` 将不会订阅任何可观察对象， 并且就不会有 GC 问题产生了。
</details>

<details id="react-vs-lite"><summary>**注意:** mobx-react vs. mobx-react-lite<a href="#react-vs-lite" class="tip-anchor"></a></summary>
在本文中我们使用 `mobx-react-lite` 作为默认包。
[mobx-react](https://github.com/mobxjs/mobx-react/) 是他的大兄弟，它里面也引用了 `mobx-react-lite` 包。
它提供了很多在新项目中不再需要的特性， mobx-react附加的特性有：

1. 对于React class components的支持。
1. `Provider` 和`inject`. MobX的这些东西在有 React.createContext 替代后变得不必要了。
1. 可观察对象的具体 `propTypes`。

要注意 `mobx-react` 是全量包，会暴露 `mobx-react-lite`包中的所有方法,包括对函数组件的支持。
如果你使用 `mobx-react`，那就不要添加 `mobx-react-lite` 的依赖和引用了。

</details>

<details id="observer-vs-memo"><summary>**注意:** `observer` or `React.memo`?<a href="#observer-vs-memo" class="tip-anchor"></a></summary>
`observer` 会自动的使用 `memo`, 所以 `observer` 不需要再包裹 `memo`。
`memo` 可以被安全地包裹 observer 组件，因为任何在props中的改变(很深的) 都会被`observer`响应。
</details>

<details id="class-comp"><summary>**提示:** 应用`observer` 到class组件<a href="#class-comp" class="tip-anchor"></a>
</summary>
如上所述，class 组件只在`mobx-react`包中得到支持， `mobx-react-lite`并不支持。
简而言之，你可以和函数式组件一样使用 `observer`包裹class 组件：

```javascript
import React from "React"

const TimerView = observer(
    class TimerView extends React.Component {
        render() {
            const { timer } = this.props
            return <span>Seconds passed: {timer.secondsPassed} </span>
        }
    }
)
```

可以阅读 [mobx-react 文档](https://github.com/mobxjs/mobx-react#api-documentation) 获得更详细的信息。

</details>

<details id="displayname"><summary>**提示：** 给组件起个好名字，以便在React DevTools中查看<a href="#displayname" class="tip-anchor"></a>
</summary>
[React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html) 使用组件名称信息正确显示组件层次结构。

如果你使用:

```javascript
export const MyComponent = observer(props => <div>hi</div>)
```

这样会导致组件名无法在DevTools中显示。

![devtools没有显示名字（devtools-noname）](assets/devtools-noDisplayName.png)

以下的手段可以修复这问题:

-   不要使用箭头函数，而是使用带有命名的 `function` . `mobx-react` 会根据函数名推断组件名称：

    ```javascript
    export const MyComponent = observer(function MyComponent(props) {
        return <div>hi</div>
    })
    ```

-   从变量名称中推论组件名称（例如Babel或Typescript）：

    ```javascript
    const _MyComponent = props => <div>hi</div>
    export const MyComponent = observer(_MyComponent)
    ```

-   再次从变量名来推断，使用默认导出：

    ```javascript
    const MyComponent = props => <div>hi</div>
    export default observer(MyComponent)
    ```

-   [**破坏性方法**] 显式的声明 `displayName`：

    ```javascript
    export const MyComponent = observer(props => <div>hi</div>)
    MyComponent.displayName = "MyComponent"
    ```

    这种写法在React 16是有问题的， mobx-react `observer` 使用 React.memo 会出现这个 bug: https://github.com/facebook/react/issues/18026, 但是在 React 17 会被修复。

现在你应该可以看见组件名了：

![devtools-withname](assets/devtools-withDisplayName.png)

</details>

<details id="wrap-order"><summary>{🚀} **提示：** 当你想要将`observer` 和其他高阶组件（HOC·译者注）一起使用, 需要首先调用 `observer` <a href="#wrap-order" class="tip-anchor"></a></summary>

当 `observer` 需要和装饰器或者其他高阶组件（HOC）一起使用时，请确保 `observer` 是最内层的 (最先调用的) 装饰器，否则的话它可能不会工作。

</details>

<details id="computed-props"><summary>{🚀} **提示：** 从 props派生计算属性<a href="#computed-props" class="tip-anchor"></a></summary>
在某些情况下你的组件本地可观察对象（local observables）的计算属性可能依赖于一些你组件接受到的参数（props）。
然而,React组件接收到的参数（props）本身并不是可观察对象，所以更改这些组件的属性（props）并不会使得计算属性响应。你需要手动更新本地的可观察对象的状态，以便正确地从最新的数据中派生出计算属性。

```javascript
import { observer, useLocalObservable } from "mobx-react-lite"
import { useEffect } from "react"

const TimerView = observer(({ offset }) => {
    const timer = useLocalObservable(() => ({
        offset, // 初始化offset
        secondsPassed: 0,
        increaseTimer() {
            this.secondsPassed++
        },
        get offsetTime() {
            return this.secondsPassed - this.offset // 这里的'offset'不是'props'传入的那个
        }
    }))

    useEffect(() => {
        //同步来自 'props' 的偏差到可观察对象 'timer'
        timer.offset = offset
    }, [offset])

    //作为demo用途，初始化一个定时器.
    useEffect(() => {
        const handle = setInterval(timer.increaseTimer, 1000)
        return () => {
            clearInterval(handle)
        }
    }, [])

    return <span>Seconds passed: {timer.offsetTime}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

在实际项目中你可能很少需要这种写法, 因为
`return <span>Seconds passed: {timer.secondsPassed - offset}</span>`
更加简单, 虽然是稍微低效率的解决方案。

</details>

<details id="useeffect"><summary>{🚀} **Tip:** useEffect 与 可观察对象<a href="#useeffect" class="tip-anchor"></a></summary>

`useEffect` 可以被用于设置需要发生的副作用, 它将会被约束在React 组件的生命周期中。
使用 `useEffect`需要指定详细的依赖。
对于 MobX 却不是必须的, 因为 MobX 已经有一种自动判断effect依赖地方法，`autorun`。
使用 `autorun` 并将其与组件的生命周期 `useEffect` 配合是非常符合直觉的：

```javascript
import { observer, useLocalObservable, useAsObservableSource } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const timer = useLocalObservable(() => ({
        secondsPassed: 0,
        increaseTimer() {
            this.secondsPassed++
        }
    }))

    // 在Effect方法之上触发可观察对象变化。
    useEffect(
        () =>
            autorun(() => {
                if (timer.secondsPassed > 60) alert("Still there. It's a minute already?!!")
            }),
        []
    )

    // 作为demo用途在Effect里定义一个定时器。
    useEffect(() => {
        const handle = setInterval(timer.increaseTimer, 1000)
        return () => {
            clearInterval(handle)
        }
    }, [])

    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

需要注意的是我们在effect方法返回了一个创建自`autorun` 的清除方法。
这一点是非常重要的, 因为他确保了 `autorun` 在组件卸载的时候被清除了！

依赖数组可以保持为空，除非是一个不可观察对象的值需要触发autorun重新运行，你才需要将它添加到这里面。
请确保你的格式正确,你可以创建一个`定时器（timer）` (上面的例子中) 作为依赖。
这是安全并且无副作用的， 因为它引用不会改变。

如果你想显式地定义哪些可观察对象可以触发effect，请使用`reaction`而不是`autorun`，他们的设计模式是完全相同的。

</details>

### 我如何能进一步的优化的我的React组件？（How can I further optimize my React components?）

请查看[React的优化（React optimizations {🚀}） ](react-optimizations.md) 这篇文章。

## 疑难解答

Help！我的组件没有进行重绘...

1. 请确保你没有遗漏 `observer` (是的，这是最常见的错误)。
1. 请检查你传入的对象确定是可观察对象. 可以在运行时使用 [`isObservable`](api.md#isobservable)或[`isObservableProp`](api.md#isobservableprop)这些工具函数检查。
1. 请检查在浏览器控制台中的任何错误或者警告。
1. 请确保你大体上是理解Mobx的调用栈. 详细请阅读 [理解响应式（Understanding reactivity）](understanding-reactivity.md) 这篇文章。
1. 请阅读上面小贴士中提及的常见错误。
1. [配置（Configure）](configuration.md#linting-options) MobX 如何警告你的机制和输出日志。
1. 使用 [追踪（trace）](analyzing-reactivity.md) 来确保你传递给Mobx了正确的东西，或者是否正确使用了Mobx的 [spy](analyzing-reactivity.md#spy) /  [mobx-logger](https://github.com/winterbe/mobx-logger) 包。
