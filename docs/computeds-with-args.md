---
title: 含参数的计算值
sidebar_label: 含参数的计算值 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 含参数的计算值 {🚀}

`computed` 方法仅能用于getters上，然而getters并不接受参数。那么需要参数的计算要怎么处理呢？结合下面的例子：一个 `Item` 组件，用于表示多选组件中单个的选择项。

那么我们要如何实现一个类似于 `store.isSelected(item.id)` 的derivation _（一个订阅item.id变化的状态）_ 呢？

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

> 译者注：衍生(derivation)是指一个订阅了某些observable的行为

## 1. Derivation不一定_需要_ 用`computed`实现


一个函数不一定要被 `computed` 包裹才能被mobx跟踪。上面的例子即便不被包裹也能够正常运行。
我们需要认识到计算值（computed values）仅仅是 _缓存点_ 。
如果derivation是纯粹的（也应当），那么函数是否被包裹是不会影响其行为的，只是会有一些轻微的性能损耗。

> 译者注：纯粹的derivation是指，计算逻辑只依赖函数参数与store中的observable，而不依赖其他外部状态。

上面的例子即便 `isSelected` 没有被 `computed` 包裹。`observer` 组件会检测并订阅 `isSelected` 内部的任何observable的变化因为`isSelected` 函数的执行是作为被跟踪的渲染函数的一部分。

需要意识到，所有的 `Item` 组件，都会对未来多选组件的被选项发生改变时做出响应，这是由于他们都直接订阅了描述选择项的observable。这是一个最差情况的例子。一般情况下，使用未包裹的函数来表示derivation完全ok，并且这是一种默认的优秀策略，直到有数据证明我们需要做额外的改进。

## 2. 整体作为参数被封装

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

我们在对observable的reaction中间加入了一段新的计算值。
这样的逻辑是可以正确允许，并且会带来额外的值缓存，从而避免组件直接对每一个选择框的行为作出反馈。这种做法的优势是，只有在`isSelected` 状态变化时，组件本身才会重渲染。这里也就是我们需要重新渲染来替换 `className`

事实是即便我们在下一次渲染时创建了新的 `computed` 也没有问题，新创的建计算值会成为新的缓存点而前一个则会被清理掉。
这是一个很棒的高级优化技巧。

## 3. 调整状态

在这个具体的场景下，我们可以把 `isSelected` 这个计算值作为一个observable存储在状态中（作为Item的一个属性），而不再是作为一个计算值。这样已选择的值就可以写作一个计算值而不是一个observable `get selection() { return this.items.filter(item => item.isSelected) }`，于是我们就不再需要 `isSelected` 计算值了。

之前的写法，selection作为一个状态，isSelected作为计算值。
```js
interface ItemType {
    id: string;
    title: string;
}
class ItemStore {
  items: ItemType[] = [];
  selection = new Set<string>();

  isSelected(id: string) {
    return this.selection.has(id);
  }
}
```

调整后的写法，`isSelected`作为状态，被选项selection作为计算值。
```js
interface ItemType {
    id: string;
    title: string;
    isSelected: boolean;
}
class ItemStore {
  items: ItemType[] = [];
  selection = new Set<string>();

  get selection() { return this.items.filter(item => item.isSelected) }
}
```

## 4. 使用 computedFn {🚀}

最后，来自 `mobx-utils` 的 [`computedFn`](https://github.com/mobxjs/mobx-utils#computedfn)  可以被用于定义 `todoStore.selected` 以便自动记忆 `isSelected` 的值。它会创建一个函数用于记忆每一种参数组合对应的输出值。

```js
const store = observable({
    a: 1,
    b: 2,
    c: 3,
    m: computedFn(function(x) {
        return this.a * this.b * x
    })
})

const d = autorun(() => {
    // 在autorun运行时，store.m(3) 的值会被缓存
    console.log(store.m(3) * store.c)
})
```

我们并不推荐你过早的使用它。它更针对记忆化的场景，你需要考虑清楚函数会接收到多少种不同的参数才能准确地评估出内存的消耗。
不过，它确实会自动的清理掉那些没有被观测的缓存结果，所以你通常不需要担心内存泄露。
具体用例可以查看 [CodeSandbox链接](https://codesandbox.io/s/multi-selection-odup1?file=/src/index.tsx)。
