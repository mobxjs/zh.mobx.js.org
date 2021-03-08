---
title: 含参数的计算属性
sidebar_label: 含参数的计算属性 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 含参数的计算属性 {🚀}

The `computed` annotation can only be used on getters, which don't take arguments.
`computed`方法仅能用于getters上，然而getters并不接受参数。

What about computations that do take arguments?
那么需要参数的计算要怎么处理呢？

Take the below example of a React component that renders a specific `Item`,
and the application supports multi-selection.

结合下面的例子：一个`Item`组件，用于表示多选组件中单个的选择项。

How can we implement a derivation like `store.isSelected(item.id)`?

那么我们要如何实现一个类似于`store.isSelected(item.id)`的衍生(一个随item.id变化而变化的状态)呢？

```javascript
import * as React from 'react'
import { observer } from 'mobx-react-lite'

const Item = observer(({ item, store }) => (
    <div className={store.isSelected(item.id) ? "selected" : ""}>
        {item.title}
    </div>
)
```
我们有四种方法可以实现它，你可以在[这里](https://codesandbox.io/s/multi-selection-odup1?file=/src/index.tsx)运行这些实现。
There are four ways in which we can approach this. You can try the solutions below in [this CodeSandbox](https://codesandbox.io/s/multi-selection-odup1?file=/src/index.tsx).

## 1. Derivations don't _need_ to be `computed`
## 1. 衍生不一定 _需要_ 用`computed`实现

A function doesn't need to be marked as `computed` in order for MobX to track it.

一个函数不一定要被computed包裹才能被mobx跟踪。

The above example would already work completely fine out of the box.

上面的例子即便不被包裹也能够正常运行。
It is important to realize that computed values are only _caching points_.
意识到计算属性仅仅是 _缓存点_ 非常重要。

If the derivations are pure (and they should be), having a getter or function without `computed` doesn't change the behavior, it is just slightly less efficient.

如果衍生是纯粹的（也应当），那么函数是否被包裹是不会影响其行为的，只是会有一些微小的性能损耗。

The above example works fine despite `isSelected` not being a `computed`. The `observer` component will detect and subscribe to any observables that were read by `isSelected` because the function executes as part of rendering that is tracked.

上面的例子即便 `isSelected` 没有没 `computed`包裹。`observer` 组件会检测并订阅`isSelected`内部的任何observable的变化因为`isSelected`函数的执行是作为被跟踪的渲染函数的一部分。

It is good to realize that all `Item` components, in this case, will respond to future selection changes,
as they all subscribe directly to the observables that capture the selection.

需要意识到，所有的`Item` 组件，都会对未来多选组件发生改变时做出响应，这是由于他们都直接订阅了描述选择项的observables。

This is a worst-case example. In general, it is completely fine to have unmarked functions that derive information, and this is a good default strategy until numbers prove anything else should be done.

这是一个最差情况的例子。一般情况下，使用未包裹的函数来表示衍生信息完全ok，并且这是一种默认的优秀策略，知道有数据证明我们需要做额外的改进。

## 2. 整体作为参数被封装

This is a more efficient implementation compared to the original.
相比之前的例子，下面是一个更高效的实现。

```javascript
import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react-lite'

const Item = observer(({ item, store }) => {
    const isSelected = computed(() => store.isSelected(item.id)).get()
    return (
        <div className={isSelected ? "selected" : ""}>
            {item.title}
        </div>
    )
}
```

We create a fresh computed value in the middle of a reaction. This works fine and does introduce that additional caching point, avoiding all components having to directly respond to every selection change.

我们在对可观测对象的响应中间加入了一段新的计算属性。这样的逻辑是可以正确允许，并且会带来额外的值缓存，从而避免组件直接对每一个选择框的行为作出反馈。

The advantage of this approach is that the component itself will only re-render if the
`isSelected` state toggles, in which case we indeed have to re-render to swap the `className`.

这种做法的优势是，只有在`isSelected`状态变化时，组件本身才会重渲染。这里也就是我们需要重新渲染来替换`className`

The fact that we create a new `computed` in a next render is fine, this one will now become the caching
point and the previous one will be cleaned up nicely.
事实是即便我们在下一次渲染师创建了新的`computed`也没有问题，新创建的会成为缓存点而前一个则会被清理掉。

This is a great and advanced optimization technique.
这是一个很棒的高级优化技巧。

## 3. Move the state
## 3. 改写为状态

In this specific case the selection could also be stored as an `isSelected` observable on the `Item`. The selection in the store could then be expressed as a `computed` rather than an observable: `get selection() { return this.items.filter(item => item.isSelected) }`, and we don't need `isSelected` anymore.

在这个具体的场景下，我们可以把`isSelected`这个属性作为一个可观测对象存储在状态中(作为Item的一个属性)，而不再是作为一个计算属性。这样已选择的值就可以写作一个计算属性而不是一个可观测对象`get selection() { return this.items.filter(item => item.isSelected) }`，于是我们就不再需要`isSelected`计算属性了。

## 4. Use computedFn {🚀}
## 4. 使用 computedFn {🚀}
Finally,
[`computedFn`](https://github.com/mobxjs/mobx-utils#computedfn) from `mobx-utils` can be used in the definition of `todoStore.selected` to automatically memoize `isSelected`.
It creates a function that memoizes the output for every combination of input arguments.

最后,
来自`mobx-utils`的[`computedFn`](https://github.com/mobxjs/mobx-utils#computedfn) 可以被用于定义`todoStore.selected`以便自动记忆`isSelected`的值。它会创建一个函数用于记忆每一种参数组合对应的输出值。


We recommend to not resort to this one too quickly. It is typical for memoization, that you will need to think about how many different arguments the function is going to be called with, before you can reason about the memory consumption.

我们并不推荐你过早的使用它。它更针对记忆化的场景，你需要考虑函数会接收到多少种不同的参数才能客观评估出内存的消耗。

It does however automatically clean up entries if their results aren't observed by any reaction, so it won't leak memory in normal circumstances.

不过，它确实会自动的清理掉哪些没有被观测的属性，所以通常你不需要担心内训泄露。

可以查看 [CodeSandbox链接](https://codesandbox.io/s/multi-selection-odup1?file=/src/index.tsx) 来调试一下这个工具。
