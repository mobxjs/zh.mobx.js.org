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

### 小贴士: 尽可能晚的获取值

`observer` 只要你传递引用就可以很好的运作, 只要获取到内部的属性，基于 `observer` 的组件 就会渲染到 DOM / low-level components（DOM一般是浏览器环境，low-level components 一般是RN环境·译者注）。

换句话说, `observer` 会根据实际情况响应 你定义的对象中的值的'引用'。

上面的例子中, `TimerView` 组件可能 **不会**响应未来的更新,
因为 `.secondsPassed` 在 `observer` component不可读,  因此它 _不会_ 触发:

```javascript
const TimerView = observer(({ secondsPassed }) => <span>Seconds passed: {secondsPassed}</span>)

React.render(<TimerViewer secondPassed={myTimer.secondsPassed} />, document.body)
```

Note that this is a different mindset from other libraries like `react-redux`, where it is a good practice to dereference early and pass primitives down, to better leverage memoization.
If the problem is not entirely clear, make sure to check out the [Understanding reactivity](understanding-reactivity.md) section.

### Don't pass observables into components that aren't `observer`

Components wrapped with `observer` _only_ subscribe to observables used during their _own_ rendering of the component. So if observable objects / arrays / maps are passed to child components, those have to be wrapped with `observer` as well.
This is also true for any callback based components.

If you want to pass observables to a component that isn't an `observer`, either because it is a third-party component, or because you want to keep that component MobX agnostic, you will have to [convert the observables to plain JavaScript values or structures](observable-state.md#converting-observables-back-to-vanilla-javascript-collections) before passing them on.

To elaborate on the above,
take the following example observable `todo` object, a `TodoView` component (observer) and an imaginary `GridRow` component that takes a column / value mapping, but which isn't an `observer`:

```javascript
class Todo {
    title = "test"
    done = true

    constructor() {
        makeAutoObservable(this)
    }
}

const TodoView = observer(({ todo }: { todo: Todo }) =>
   // WRONG: GridRow won't pick up changes in todo.title / todo.done
   //        since it isn't an observer.
   return <GridRow data={todo} />

   // CORRECT: let `TodoView` detect relevant changes in `todo`,
   //          and pass plain data down.
   return <GridRow data={{
       title: todo.title,
       done: todo.done
   }} />

   // CORRECT: using `toJS` works as well, but being explicit is typically better.
   return <GridRow data={toJS(todo)} />
)
```

### Callback components might require `<Observer>`

Imagine the same example, where `GridRow` takes an `onRender` callback instead.
Since `onRender` is part of the rendering cycle of `GridRow`, rather than `TodoView`'s render (even though that is where it syntactically appears), we have to make sure that the callback component uses an `observer` component.
Or, we can create an in-line anonymous observer using [`<Observer />`](https://github.com/mobxjs/mobx-react#observer):

```javascript
const TodoView = observer(({ todo }: { todo: Todo }) => {
    // WRONG: GridRow.onRender won't pick up changes in todo.title / todo.done
    //        since it isn't an observer.
    return <GridRow onRender={() => <td>{todo.title}</td>} />

    // CORRECT: wrap the callback rendering in Observer to be able to detect changes.
    return <GridRow onRender={() => <Observer>{() => <td>{todo.title}</td>}</Observer>} />
})
```

## Tips

<details id="static-rendering"><summary>Server Side Rendering (SSR)<a href="#static-rendering" class="tip-anchor"></a></summary>
If `observer` is used in server side rendering context; make sure to call `enableStaticRendering(true)`, so that `observer` won't subscribe to any observables used, and no GC problems are introduced.
</details>

<details id="react-vs-lite"><summary>**Note:** mobx-react vs. mobx-react-lite<a href="#react-vs-lite" class="tip-anchor"></a></summary>
In this documentation we used `mobx-react-lite` as default.
[mobx-react](https://github.com/mobxjs/mobx-react/) is it's big brother, which uses `mobx-react-lite` under the hood.
It offers a few more features which are typically not needed anymore in greenfield projects. The additional things offered by mobx-react:

1. Support for React class components.
1. `Provider` and `inject`. MobX's own React.createContext predecessor which is not needed anymore.
1. Observable specific `propTypes`.

Note that `mobx-react` fully repackages and re-exports `mobx-react-lite`, including functional component support.
If you use `mobx-react`, there is no need to add `mobx-react-lite` as a dependency or import from it anywhere.

</details>

<details id="observer-vs-memo"><summary>**Note:** `observer` or `React.memo`?<a href="#observer-vs-memo" class="tip-anchor"></a></summary>
`observer` automatically applies `memo`, so `observer` components never need to be wrapped in `memo`.
`memo` can be applied safely to observer components because mutations (deeply) inside the props will be picked up by `observer` anyway if relevant.
</details>

<details id="class-comp"><summary>**Tip:** `observer` for class based React components<a href="#class-comp" class="tip-anchor"></a>
</summary>
As stated above, class based components are only supported through `mobx-react`, and not `mobx-react-lite`.
Briefly, you can wrap class-based components in `observer` just like
you can wrap function components:

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

Check out [mobx-react docs](https://github.com/mobxjs/mobx-react#api-documentation) for more information.

</details>

<details id="displayname"><summary>**Tip:** nice component names in React DevTools<a href="#displayname" class="tip-anchor"></a>
</summary>
[React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html) uses the display name information of components to properly display the component hierarchy.

If you use:

```javascript
export const MyComponent = observer(props => <div>hi</div>)
```

then no display name will be visible in the DevTools.

![devtools-noname](assets/devtools-noDisplayName.png)

The following approaches can be used to fix this:

-   use `function` with a name instead of an arrow function. `mobx-react` infers component name from the function name:

    ```javascript
    export const MyComponent = observer(function MyComponent(props) {
        return <div>hi</div>
    })
    ```

-   Transpilers (like Babel or TypeScript) infer component name from the variable name:

    ```javascript
    const _MyComponent = props => <div>hi</div>
    export const MyComponent = observer(_MyComponent)
    ```

-   Infer from the variable name again, using default export:

    ```javascript
    const MyComponent = props => <div>hi</div>
    export default observer(MyComponent)
    ```

-   [**Broken**] Set `displayName` explicitly:

    ```javascript
    export const MyComponent = observer(props => <div>hi</div>)
    MyComponent.displayName = "MyComponent"
    ```

    This is broken in React 16 at the time of writing; mobx-react `observer` uses a React.memo and runs into this bug: https://github.com/facebook/react/issues/18026, but it will be fixed in React 17.

Now you can see component names:

![devtools-withname](assets/devtools-withDisplayName.png)

</details>

<details id="wrap-order"><summary>{🚀} **Tip:** when combining `observer` with other higher-order-components, apply `observer` first<a href="#wrap-order" class="tip-anchor"></a></summary>

When `observer` needs to be combined with other decorators or higher-order-components, make sure that `observer` is the innermost (first applied) decorator;
otherwise it might do nothing at all.

</details>

<details id="computed-props"><summary>{🚀} **Tip:** deriving computeds from props<a href="#computed-props" class="tip-anchor"></a></summary>
In some cases the computed values of your local observables might depend on some of the props your component receives.
However, the set of props that a React component receives is in itself not observable, so changes to the props won't be reflected in any computed values. You have to manually update local observable state in order to properly derive computed values from latest data.

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
            return this.secondsPassed - this.offset // Not 'offset' from 'props'!
        }
    }))

    useEffect(() => {
        // Sync the offset from 'props' into the observable 'timer'
        timer.offset = offset
    }, [offset])

    // Effect to set up a timer, only for demo purposes.
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

In practice you will rarely need this pattern, since
`return <span>Seconds passed: {timer.secondsPassed - offset}</span>`
is a much simpler, albeit slightly less efficient solution.

</details>

<details id="useeffect"><summary>{🚀} **Tip:** useEffect and observables<a href="#useeffect" class="tip-anchor"></a></summary>

`useEffect` can be used to set up side effects that need to happen, and which are bound to the life-cycle of the React component.
Using `useEffect` requires specifying dependencies.
With MobX that isn't really needed, since MobX has already a way to automatically determine the dependencies of an effect, `autorun`.
Combining `autorun` and coupling it to the life-cycle of the component using `useEffect` is luckily straightforward:

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

    // Effect that triggers upon observable changes.
    useEffect(
        () =>
            autorun(() => {
                if (timer.secondsPassed > 60) alert("Still there. It's a minute already?!!")
            }),
        []
    )

    // Effect to set up a timer, only for demo purposes.
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

Note that we return the disposer created by `autorun` from our effect function.
This is important, since it makes sure the `autorun` gets cleaned up once the component unmounts!

The dependency array can typically be left empty, unless a non-observable value should trigger a re-run of the autorun, in which case you will need to add it there.
To make your linter happy, you can define `timer` (in the above example) as a dependency.
That is safe and has no further effect, since the reference will never actually change.

If you'd rather explicitly define which observables should trigger the effect, use `reaction` instead of `autorun`, beyond that the pattern remains identical.

</details>

### How can I further optimize my React components?

Check out the [React optimizations {🚀}](react-optimizations.md) section.

## Troubleshooting

Help! My component isn't re-rendering...

1. Make sure you didn't forget `observer` (yes, this is the most common mistake).
1. Verify that the thing you intend to react to is indeed observable. Use utilities like [`isObservable`](api.md#isobservable), [`isObservableProp`](api.md#isobservableprop) if needed to verify this at runtime.
1. Check the console logs in the browsers for any warnings or errors.
1. Make sure you grok how tracking works in general. Check out the [Understanding reactivity](understanding-reactivity.md) section.
1. Read the common pitfalls as described above.
1. [Configure](configuration.md#linting-options) MobX to warn you of unsound usage of mechanisms and check the console logs.
1. Use [trace](analyzing-reactivity.md) to verify that you are subscribing to the right things or check what MobX is doing in general using [spy](analyzing-reactivity.md#spy) / the [mobx-logger](https://github.com/winterbe/mobx-logger) package.
