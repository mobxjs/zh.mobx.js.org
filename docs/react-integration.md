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

`observer` 是由你选择的，[在安装时（during installation）](installation.md#installation)独立提供的 React bindings 包。 在下面的例子中,我们将使用更加轻盈的[`mobx-react-lite` 包](https://github.com/mobxjs/mobx-react-lite).

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

Since it doesn't matter _how_ we got the reference to an observable, we can consume
observables from outer scopes directly (including from imports, etc.):

```javascript
const myTimer = new Timer() // See the Timer definition above.

// No props, `myTimer` is directly consumed from the closure.
const TimerView = observer(() => <span>Seconds passed: {myTimer.secondsPassed}</span>)

ReactDOM.render(<TimerView />, document.body)
```

Using observables directly works very well, but since this typically introduces module state, this pattern might complicate unit testing. Instead, we recommend using React Context instead.

<!--using React context-->

[React Context](https://reactjs.org/docs/context.html) is a great  to share observables with an entire subtree:

```javascript
import {observer} from 'mobx-react-lite'
import {createContext, useContext} from "react"

const TimerContext = createContext<Timer>()

const TimerView = observer(() => {
    // Grab the timer from the context.
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

Note that we don't recommend ever replacing the `value` of a `Provider` with a different one. Using MobX, there should be no need for that, since the observable that is shared can be updated itself.

<!--END_DOCUSAURUS_CODE_TABS-->

### Using local observable state in `observer` components

Since observables used by `observer` can come from anywhere, they can be local state as well.
Again, different options are available for us.

<!--DOCUSAURUS_CODE_TABS-->
<!--`useState` with observable class-->

The simplest way to use local observable state is to store a reference to an observable class with `useState`.
Note that, since we typically don't want to replace the reference, we totally ignore the updater function returned by `useState`:

```javascript
import { observer } from "mobx-react-lite"
import { useState } from "react"

const TimerView = observer(() => {
    const [timer] = useState(() => new Timer()) // See the Timer definition above.
    return <span>Seconds passed: {timer.secondsPassed}</span>
})

ReactDOM.render(<TimerView />, document.body)
```

If you want to automatically update the timer like we did in the original example,
`useEffect` could be used in typical React fashion:

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

As stated before, instead of using classes, it is possible to directly create observable objects.
We can leverage [observable](observable-state.md#observable) for that:

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

The combination `const [store] = useState(() => observable({ /* something */}))` is
quite common. To make this pattern simpler the [`useLocalObservable`](https://github.com/mobxjs/mobx-react#uselocalobservable-hook) hook is exposed from `mobx-react-lite` package, making it possible to simplify the earlier example to:

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

### You might not need locally observable state

In general, we recommend to not resort to MobX observables for local component state too quickly, as this can theoretically lock you out of some features of React's Suspense mechanism.
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
