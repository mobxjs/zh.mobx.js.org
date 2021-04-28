---
title: 集成React
sidebar_label: 集成React
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 集成React

Usage:

```javascript
import { observer } from "mobx-react-lite" // Or "mobx-react".

const MyComponent = observer(props => ReactElement)
```

虽然 MobX 可以独立于 React 运行, 但是他们通常是在一起使用, 在 [Mobx的宗旨（The gist of MobX）](the-gist-of-mobx.md) 一文中你会经常看见集成React最重要的一部分:用于包裹React Component的 `observer` [HoC](https://reactjs.org/docs/higher-order-components.html)方法.

`observer` 是由你选择的，[在安装时（during installation）](installation.md#installation)独立提供的 React bindings 包。 在下面的例子中,我们将使用更加轻量的[`mobx-react-lite` 包](https://github.com/mobxjs/mobx-react-lite).

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

//被`observer`包裹的函数式组件会被监听在它每一次调用前发生的任何变化
const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

ReactDOM.render(<TimerView timer={myTimer} />, document.body)

setInterval(() => {
    myTimer.increaseTimer()
}, 1000)
```

**提示:** 你可以在 [在线编译器CodeSandbox](https://codesandbox.io/s/minimal-observer-p9ti4?file=/src/index.tsx)中尝试上面的例子.

 `observer` HoC 将自动订阅 React components 中任何 _在渲染期间_ 被使用的  _可被观察的对象_ 。
因此, 当任何可被观察的对象 _变化_ 发生时候 组件会自动进行重新渲染（re-render）。
它还会确保组件在 _在没有变化_ 发生的时候不会进行重新渲染（re-render）。
因此, 可以通过组件访问的可观察对象, 但是不可读的对象, 也不会触发重新渲染（re-render）.

在实际项目中，这一特性使得MobX应用程序能够很好的进行开箱即用的优化，并且通常不需要任何额外的代码来防止过度渲染.

要想让`observer`生效, 并不需要关心这些对象 _如何到达_ 组件（它们能到达组件即可 ·译者注）, 只需要关心他们是否是可读的。
深层嵌套的可观察对象也无妨, 复杂的表达式类似 `todos[0].author.displayName` 也是开箱即用的.
与其他必须显式声明或预先计算数据依赖关系的框架（例如 selectors）相比，这种发生的订阅机制显得更加精确和高效。


## 本地与外部状态（Local and external state）

在 Mobx 可以非常灵活的组织或管理（state）, 从（技术角度讲）它不关心我们如何读取可观察对象，也不关心他们来自哪里。
下面的例子将通过不同的设计模式去使用被 `observer`包裹的组件。

### `observer` 组件中使用外部状态 （Using external state in `observer` components）

<!--DOCUSAURUS_CODE_TABS-->
<!--使用 props-->

可被观察对象可以通过组件的props属性传入  (在下面的例子中):

```javascript
import { observer } from "mobx-react-lite"

const myTimer = new Timer() // See the Timer definition above.

const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

// 通过props传递myTimer.
ReactDOM.render(<TimerView timer={myTimer} />, document.body)
```

<!-- 使用全局变量 -->

虽然我们不关心是 _如何_ 引用（reference）的可观察对象,但是我们可以使用 （consume）
外部不作用域（outer scopes directly）的可观察对象  (类似通过 import这样的方法, 等等):

```javascript
const myTimer = new Timer() // See the Timer definition above.

// No props, `myTimer` is directly consumed from the closure.
const TimerView = observer(() => <span>Seconds passed: {myTimer.secondsPassed}</span>)

ReactDOM.render(<TimerView />, document.body)
```

直接使用可观察对象效果很好，但是由于这通常会引入模块状态，因此这种模式可能会使单元测试复杂化。 因此，我们建议改为使用React Context。

<!--使用 React context-->

使用[React Context](https://reactjs.org/docs/context.html)共享整个可观察子树是很不错的选择:

```javascript
import {observer} from 'mobx-react-lite'
import {createContext, useContext} from "react"

const TimerContext = createContext<Timer>()

const TimerView = observer(() => {
    // 从context中获取timer.
    const timer = useContext(TimerContext) // See the Timer definition above.
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

需要注意的是我们并不推荐每一个不同的 `值（value）` 都通过不同的 `Provider`来传递 . 在使用Mobx的过程中不需要这样做, 因为共享的可观察对象会更新他自己。

<!--END_DOCUSAURUS_CODE_TABS-->

### 在`observer` components中使用全局可观察对象（Using local observable state in `observer` components）

因为使用 `observer` 的可观察对象可以来自任何地方, 他们也可以使用local state（全局的state·译者注）。
再次声明，不同操作方式对于我们而言都是有价值的。

<!--DOCUSAURUS_CODE_TABS-->
<!--`useState` 和 observable class-->

使用全局可观察对象的最简单的方式就是通过`useState`去存储一个全局可观察对象的引用。
需要注意的是, 因为我们不需要替换全局可观察对象的引用,所以我们其实可以完全不声明`useState`的更新方法:

```javascript
import { observer } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const [timer] = useState(() => new Timer()) // Timer的定义在上面（正如上面所说的那样这里我们忽略了更新方法的定义·译者注）.
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

如果你想要类似我们官方的例子那样自动更新 timer ,
使用`useEffect` 可能是 React 中比较典型的方法:

```javascript
useEffect(() => {
    const handle = setInterval(() => {
        myTimer.increaseTimer()
    }, 1000)
    return () => {
        clearInterval(handle)
    }
}, [myTimer])
```

<!--`useState` 与全局可观察对象-->

如刚才说的那样, 直接创建一个可观察的对象，而不是使用classes（这里的类指的是全局定义的Mobx state，在它们是使用class生命的·）.
我们可以参考 [observable](observable-state.md#observable)这篇文章:

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

<!--`useLocalObservable` hook-->

`const [store] = useState(() => observable({ /* something */}))` 是非常通用的一套写法. 为了简化这个写法我们可以调用`mobx-react-lite` 包中的 [`useLocalObservable`](https://github.com/mobxjs/mobx-react#uselocalobservable-hook) hook ,可以将上面的例子简化成:

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

### 你可能并不需要全局的可观察状态 （You might not need locally observable state）

通常来讲,我们推荐在全局公用组件的时候不要立刻借助于Mobx的可观察能力, 因为从技术角度来讲他可能会使你无法使用一些React 的 Suspense 的方法特性。
大体上将, 使用Mobx的可观察能力会捕获组件间的独立作用域状态（domain data）可能会 (包含子组件的). 像是todo item, users, bookings, 等等（就是说mobx最好不要共享一些组件内的状态·译者注）。

状态类似获取UI state, 类似加载的 state, 选择的 state,等等, 最好还是使用 [`useState` hook](https://reactjs.org/docs/hooks-state.html), 这样可以可以让你使用高级的 React suspense特性。

使用Mobx的可观察能力作为 React components 的一种状态补充，比如出现以下情况： 1) 层级很深, 2) 拥有计算属性 3) 需要共享状态给其它 `observer` components.

## 始终在`observer` 组件中使用可观察能力（Always read observables inside `observer` components）

你可能会感到疑惑, 我应该什么时候使用 `observer`? 大体上说: _ `observer`应用于所有组件的可观察数据_.

`observer` 是使用修饰模式增强你的组件, 而不是它调用你的组件. 所以通常所有的组件都应该用 `observer`. 但是不要担心, 它不会导致性能损失。从另一个角度讲, 更多的 `observer` 组件可以使渲染更高效，因为它们更新数据的颗粒度更细。

### 小贴士: 尽可能让Mobx获得值

`observer` 只要你传递引用就可以很好的运作, 只要获取到内部的属性，基于 `observer` 的组件 就会渲染到 DOM / low-level components（DOM一般是浏览器环境，low-level components 一般是RN环境·译者注）。

换句话说, `observer` 会根据实际情况响应 你定义的对象中的值的'引用'。

上面的例子中, `TimerView` 组件可能 **不会**响应未来的更新,
因为 `.secondsPassed` 在 `observer` component不可读,  因此它 _不会_ 触发:

```javascript
const TimerView = observer(({ secondsPassed }) => <span>Seconds passed: {secondsPassed}</span>)

React.render(<TimerViewer secondPassed={myTimer.secondsPassed} />, document.body)
```

需要注意的一点是它不同于其它的观念模式库像是 `react-redux`那样, redux 中强调尽可能早的获取和传递原始值已获得更好的副作用响应。
如果你还是没有理解, 可以先阅读 [理解响应式（Understanding reactivity）](understanding-reactivity.md) 这篇文章。

### 不要将可观察对象传递到 不是`observer`的组件中（Don't pass observables into components that aren't `observer`）

通过`observer`包裹的组件 _仅仅_ 订阅 在 _他们自己_ 渲染的期间的可观察对象. 如果要将可观察对象 objects / arrays / maps 传递到子组件中, 他们必须被 `observer` 包裹。
通过callback回调的组件也是一样.

如果你非要传递可观察对象到未被`observer`包裹的组件中, 要么是因为它是第三方组件,或者你需要组件对Mobx无感知,你必须 [转换可观察对象为显式convert the observables to plain JavaScript values or structures](observable-state.md#converting-observables-back-to-vanilla-javascript-collections) 在传递前阅读这篇文章.

关于上述的详细描述,
可以看一下下面的使用 `todo` 对象的例子, 一个 `TodoView` (observer)组件  和一个虚构的接受一组对象映射的不是`observer`的`GridRow`组件:

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
   //        因为他不是一个观察者（observer）.
   return <GridRow data={todo} />

   // 正确:在 `TodoView` 中显式的声明相关的`todo` ,
   //         到data中.
   return <GridRow data={{
       title: todo.title,
       done: todo.done
   }} />

   // 正确: 使用 `toJS`也是可以的, 并且是更清晰明白的方式.
   return <GridRow data={toJS(todo)} />
)
```

###  回调组件可能会需要`<Observer>`（ Callback components might require `<Observer>`）

想象一下在同样的例子中,  `GridRow` 携带一个 `onRender`回调函数。
`onRender` 是 `GridRow`渲染生命周期的一部分, 而不是 `TodoView` 的render (甚至在语法层面都能看出来), 我们不得不保证回调组件是一个 `observer` 组件.
或者, 我们可以使用 [`<Observer />`](https://github.com/mobxjs/mobx-react#observer)创建一个匿名观察者:

```javascript
const TodoView = observer(({ todo }: { todo: Todo }) => {
    // 错误: GridRow.onRender 不能获得 todo.title / todo.done 中的改变
    //        因为它不是一个观察者（observer） .
    return <GridRow onRender={() => <td>{todo.title}</td>} />

    // 正确: 将回调组件通过Observer包裹将会正确的获得变化。
    return <GridRow onRender={() => <Observer>{() => <td>{todo.title}</td>}</Observer>} />
})
```

## 小贴士

<details id="static-rendering"><summary>服务器渲染 (SSR)<a href="#static-rendering" class="tip-anchor"></a></summary>
如果 `observer` 是服务器渲染的 rendering context; 请确保调用 `enableStaticRendering(true)`, 这样 `observer` 将不会订阅任何可观察对象, 并且就不会有 GC 问题产生了.
</details>

<details id="react-vs-lite"><summary>**注意:** mobx-react vs. mobx-react-lite<a href="#react-vs-lite" class="tip-anchor"></a></summary>
在本文中我们使用 `mobx-react-lite` 作为默认包.
[mobx-react](https://github.com/mobxjs/mobx-react/) 是他的大兄弟, 它里面也引用了 `mobx-react-lite` 包.
它提供了很多在新项目中不在需要的特性， mobx-react附加的特性有:

1. 对于React class components的支持.
1. `Provider` 和`inject`. MobX的这些东西在有 React.createContext 替代后变得不必要了.
1. 特殊的观察对象 `propTypes`.

要注意 `mobx-react` 是全量包，也会暴露 `mobx-react-lite`包中的任何方法,其中包含对函数组件的支持.
如果你使用 `mobx-react`, 那就不要添加 `mobx-react-lite` 的依赖和引用了.

</details>

<details id="observer-vs-memo"><summary>**注意:** `observer` or `React.memo`?<a href="#observer-vs-memo" class="tip-anchor"></a></summary>
`observer` 会自动的使用 `memo`, 所以 `observer` 不需要再包裹 `memo`.
`memo` 会被 observer 组件安全的使用 ，因为任何在props中的改变(很深的) 都会被`observer`响应。
</details>

<details id="class-comp"><summary>**提示:** 应用`observer` 到基于class的组件<a href="#class-comp" class="tip-anchor"></a>
</summary>
如上所述, class 组件只在`mobx-react`包中得到支持, `mobx-react-lite`并不支持。
简而言之,你可以和函数式组件一样使用 `observer`包裹class 组件 :

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

可以阅读 [mobx-react 文档](https://github.com/mobxjs/mobx-react#api-documentation) 获得更详细的信息.

</details>

<details id="displayname"><summary>**提示:** 给组件起个好名字，方便在React DevTools中查看<a href="#displayname" class="tip-anchor"></a>
</summary>
[React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html) 使用组件名称信息正确显示组件层次结构。

如果你使用:

```javascript
export const MyComponent = observer(props => <div>hi</div>)
```

这样会没有名称在DevTools中可以显示.

![devtools没有显示名字（devtools-noname）](assets/devtools-noDisplayName.png)

以下的手段可以修复这问题:

-   不要使用箭头函数而要使用带有命名的 `function` . `mobx-react` 会根据函数名推断组件名称:

    ```javascript
    export const MyComponent = observer(function MyComponent(props) {
        return <div>hi</div>
    })
    ```

-   调换变量名与组件名，达到通过变量名能推导出组件名的目的 (像是在 Babel 或者 TypeScript中):

    ```javascript
    const _MyComponent = props => <div>hi</div>
    export const MyComponent = observer(_MyComponent)
    ```

-   使用default export 导出, 会通过变量名称推断 :

    ```javascript
    const MyComponent = props => <div>hi</div>
    export default observer(MyComponent)
    ```

-   [**破坏性方法**] 显式的声明 `displayName`:

    ```javascript
    export const MyComponent = observer(props => <div>hi</div>)
    MyComponent.displayName = "MyComponent"
    ```

    这种写法在React 16是有问题的， mobx-react `observer` 使用 React.memo 会出现这个 bug: https://github.com/facebook/react/issues/18026,但是在 React 17 会被修复.

现在你将看见组件名称:

![devtools-withname](assets/devtools-withDisplayName.png)

</details>

<details id="wrap-order"><summary>{🚀} **提示:** 当你想要将`observer` 和其他高阶组件（HOC·译者注）一起使用, 需要首先调用 `observer` <a href="#wrap-order" class="tip-anchor"></a></summary>

当 `observer` 需要和装饰器或者其他高阶组件（HOC）一起使用时, 请确保 `observer` 是最内层的 (最先调用) 装饰器，否则的话它可能不会工作。

</details>

<details id="computed-props"><summary>{🚀} **提示:** 从 props导出计算属性<a href="#computed-props" class="tip-anchor"></a></summary>
在某些情况下你的全局可观察对象（local observables）的计算属性可能依赖于一些你组件接受到的参数（props）.
但是,这一系列从React组件接收到的参数（props）本身并不是可观察对象 , 所以更改这些组件的属性（props）并不会使得计算属性响应.你可能需要手动的从最新的数据来更新全局可观察对象的状态来触发计算属性更新。

```javascript
import { observer, useLocalObservable } from "mobx-react-lite"
import { useEffect } from "react"

const TimerView = observer(({ offset }) => {
    const timer = useLocalObservable(() => ({
        offset, // The initial offset value
        secondsPassed: 0,
        increaseTimer() {
            this.secondsPassed++
        },
        get offsetTime() {
            return this.secondsPassed - this.offset // 'props'没有'偏差'  !
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

`useEffect` 可以被用于触发需要发生的副作用, 它将会被约束在React 组建的生命周期中.
使用 `useEffect`需要指定详细的依赖.
对于 MobX 却不是必须的, 因为 MobX 拥有一种真正的能检查到依赖发发生的方法, `autorun`.
结合 `autorun`可以很轻松的在生命周期组件中使用`useEffect`:

```javascript
import { observer, useLocalObservable, useAsObservableSource } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(({ offset }) => {
    const timer = useLocalObservable(() => ({
        secondsPassed: 0,
        increaseTimer() {
            this.secondsPassed++
        }
    }))

    // 在Effect方法之上触发可观察对象变化.
    useEffect(
        () =>
            autorun(() => {
                if (timer.secondsPassed > 60) alert("Still there. It's a minute already?!!")
            }),
        []
    )

    // 作为demo用途在Effect里定义一个定时器.
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

需要注意的是我们在effect方法返回了一个创建自`autorun` 的清除方法。
这一点是非常重要的, 因为他确保了 `autorun` 在组件卸载的时候被清除了!

依赖数组可以保持为空, 除非是一个不可观察对象的值需要触发autorun重新运行, 你才需要将它添加到这里面。
请确保你的格式正确,你可以创建一个`定时器（timer）` (上面的例子中) 作为依赖。
这是安全并且无副作用的, 因为它引用的依赖根本不会改变。

如果你不想显式的在Effect中定义可观察对象请使用`reaction`而不是`autorun`，他们的传参是完全相同的。

</details>

### 我如何能进一步的优化的我的React组件？（How can I further optimize my React components?）

请查看[React的优化（React optimizations {🚀}） ](react-optimizations.md) 这篇文章 .

## 疑难解答

Help!我的组件没有进行重绘...

1. 请确保你没有遗漏 `observer` (是的，这是最常见的错误).
1. 请检查你传入的对象确定是可观察对象. 可以使用 [`isObservable`](api.md#isobservable)这个工具函数, 如果需要在运行时检查可以使用这个工具函数[`isObservableProp`](api.md#isobservableprop).
1. 请检查在浏览器控制台中的任何错误或者警告.
1. 请确保你大体上是理解Mobx的调用栈. 详细请阅读 [理解响应式（Understanding reactivity）](understanding-reactivity.md) 这篇文章.
1. 请阅读上面提示的常见错误.
1. [配置（Configure）](configuration.md#linting-options) MobX 如何警告你的机制和输出日志.
1. 使用 [追踪（trace）](analyzing-reactivity.md) 来确保你传递给Mobx了正确的东西 ，或者是否正确使用了Mobx的 [spy](analyzing-reactivity.md#spy) /  [mobx-logger](https://github.com/winterbe/mobx-logger) 包.
