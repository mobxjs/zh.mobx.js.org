---
title: 与 React 集成
sidebar_label: 与 React 集成
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 与 React 集成

使用方式：

```javascript
import { observer } from "mobx-react-lite" // Or "mobx-react".

const MyComponent = observer(props => ReactElement)
```

虽然 MobX 独立于 React 工作，但是它们通常结合使用。相信你在 [MobX 主旨](the-gist-of-mobx.md) 部分已经看到了与 React 集成最关键的部分：使用 `observer` [HoC](https://reactjs.org/docs/higher-order-components.html) 包裹一个 React 组件。

你可以在 [安装过程](installation.md#installation) 中安装单独的 React 绑定包，`observer` 在其中提供。在这个例子中，我们使用轻量级的 [`mobx-react-lite` 包](https://github.com/mobxjs/mobx-react-lite)。

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

// 使用 `observer` 包裹的函数式组件将会对
// 使用的可观察对象未来的变化做出响应。
const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

ReactDOM.render(<TimerView timer={myTimer} />, document.body)

setInterval(() => {
    myTimer.increaseTimer()
}, 1000)
```

**提示：**你可以在 [CodeSandbox](https://codesandbox.io/s/minimal-observer-p9ti4?file=/src/index.tsx) 中自己运行上面的示例。

`observer` HoC 将会自动订阅在 React 组件_渲染过程_中使用的_任何可观察对象_。
因此，当相关的可观察对象发生变化时，组件将会自动重新渲染。
他同样会确保在_没有相关_更改的情况下，组件不会重新渲染。
因此，那些可以被组件访问但从未真正读取的可观察对象，将不会造成组件重新渲染。

实际上，MobX 提供了开箱即用的优化，所以通常不需要任何额外的代码就可以防止过度渲染。

`observer` 正常工作时，其并不关心可观察对象到达组件的_方式_，只需要组件读取可观察对象的值即可。
读取类似 `todos[0].author.displayName` 的深层嵌套的可观察对象时，MobX 也可以正常工作。
与必须显式声明或预先计算数据依赖的其他框架（例如：selectors）相比，订阅机制更加的精确且高效。

## 局部和外部状态

因为从技术上来讲我们并不关心读取什么样的可观察对象以及可观察对象来自哪里，所以组织状态的方法具有很大的灵活性。
下面的示例演示了在使用 `observer` 包装的组件中使用外部和局部可观察状态的不同方式。

### 在 `observer` 组件中使用外部状态

<!--DOCUSAURUS_CODE_TABS-->
<!--using props-->

可观察对象可以作为 props 传递给组件（如下面的例子所示）：

```javascript
import { observer } from "mobx-react-lite"

const myTimer = new Timer() // 查看上面 Timer 的定义.

const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

// 将 myTimer 作为 props 传递.
ReactDOM.render(<TimerView timer={myTimer} />, document.body)
```

<!--using global variables-->

由于我们并不关心_如何_获得可观察对象的引用，因此我们可以
直接从外部（包括 import 等）导入并使用可观察对象：

```javascript
const myTimer = new Timer() // 查看上面 Timer 的定义.

// 没有 props, `myTimer` 通过闭包直接消费.
const TimerView = observer(() => <span>Seconds passed: {myTimer.secondsPassed}</span>)

ReactDOM.render(<TimerView />, document.body)
```

直接使用可观察对象的效果很好，但是这样通常会引入模块状态，这种设计模式会使得单元测试变得复杂起来。所以我们推荐改用 React Context。

<!--using React context-->

[React Context](https://reactjs.org/docs/context.html) 提供了一个与整棵子树共享可观察对象的机制：

```javascript
import {observer} from 'mobx-react-lite'
import {createContext, useContext} from "react"

const TimerContext = createContext<Timer>()

const TimerView = observer(() => {
    // 从 context 中获取 timer.
    const timer = useContext(TimerContext) // 查看上面的定义.
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

请注意，我们不推荐对 `Provider` 的 `value` 重新赋值。当你使用 MobX 时，不需要这样做，因为共享的可观察对象可以自动更新。

<!--END_DOCUSAURUS_CODE_TABS-->

### 在 `observer` 组件中使用局部状态

由于被 `observer` 使用的可观察对象可以来自任何地方，所以它们也可以被定义为局部状态。
与上面相同，我们也可以有多种不同的使用方式。

<!--DOCUSAURUS_CODE_TABS-->
<!--`useState` with observable class-->

使用局部可观察状态最简单的方式是使用 `useState` 存储可观察对象的引用。
需要注意的是，由于我们通常不需要对可观察对象重新赋值，因此我们完全忽略了 `useState` 返回的 updater 函数。

```javascript
import { observer } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const [timer] = useState(() => new Timer()) // 查看上面的 Timer 定义.
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

如果你想像原始示例中那样自动更新计时器，
你可以通过最常见的 React 风格使用 `useEffect`。

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

<!--`useState` with local observable object-->

如同前面章节提到的，我们可以不使用类，而直接创建可观察对象。
我们可以利用 [observable](observable-state.md#observable)：

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

`const [store] = useState(() => observable({ /* something */}))` 的组合是
十分常见的。可以使用 `mobx-react-lite` 包提供的 [`useLocalObservable`](https://github.com/mobxjs/mobx-react#uselocalobservable-hook) hook 简化这种模式，简化之后的版本如下：

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

### 你或许并不需要局部可观察状态

通常情况下，我们建议不要对本地组件过快地使用 MobX 可观察对象，因为从理论上讲In general, we recommend to not resort to MobX observables for local component state too quickly, as this can theoretically lock you out of some features of React's Suspense mechanism.
As a rule of thumb, use MobX observables when the state captures domain data that is shared among components (including children). Such as todo items, users, bookings, etc.

State that only captures UI state, like loading state, selections, etc, might be better served by the [`useState` hook](https://reactjs.org/docs/hooks-state.html), since this will allow you to leverage React suspense features in the future.

Using observables inside React components adds value as soon as they are either 1) deep, 2) have computed values or 3) are shared with other `observer` components.

## Always read observables inside `observer` components

You might be wondering, when do I apply `observer`? The rule of thumb is: _apply `observer` to all components that read observable data_.

`observer` only enhances the component you are decorating, not the components called by it. So usually all your components should be wrapped by `observer`. Don't worry, this is not inefficient. On the contrary, more `observer` components make rendering more efficient as updates become more fine-grained.

### Tip: Grab values from objects as late as possible

`observer` works best if you pass object references around as long as possible, and only read their properties inside the `observer` based components that are going to render them into the DOM / low-level components.
In other words, `observer` reacts to the fact that you 'dereference' a value from an object.

In the above example, the `TimerView` component would **not** react to future changes if it was defined
as follows, because the `.secondsPassed` is not read inside the `observer` component, but outside, and is hence _not_ tracked:

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
