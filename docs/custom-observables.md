---
title: 创建一个自定义 observables
sidebar_label: 自定义 observables {}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建一个自定义的 observables {🚀}

## Atoms （原子化设计）

在某些情况下，您可能希望有更多的数据结构或其他东西(如流)，用于响应式计算。
通过使用原子的概念来实现这一点非常简单。
可以使用Atoms向MobX发出信号，表示某些可观察数据源已经被观察到或已经更改，而MobX将在atom被使用或不再使用时，向atom发出信号。

_**Tip**:
在许多情况下，你可以避免创造自己的Atoms，我们只需要创建一个普通的observable就行了，
当MobX开始跟踪它（observable）时，[' onBecomeObserved '](lazy-observables.md)工具有相关提示

下面的例子演示了如何创建一个名为‘Clock’的observable，它返回当前的日期-时间，然后可以在响应式函数中使用它。

这个时钟只有在被观察到时，才会滴答作响。
此示例演示了"Atom"类的完整 API。

```javascript
import { createAtom, autorun } from "mobx"

class Clock {
    atom
    intervalHandler = null
    currentDateTime

    constructor() {
        // 创建一个atom来与MobX进行交互
        
        this.atom = createAtom(
            // 第一个参数是:
            // - Atom的名称 用于在程序debug时便于观察.
            "Clock",
            // 第二个参数是（可选）:
            // - 在unobserved 变到 observed时的回调函数
            () => this.startTicking(),
            // 第三个参数是（可选）:
            // -  在observed 变到 unobserved时的回调函数
            () => this.stopTicking()
            // 同一个atom在多个状态之间来回变化
        )
    }

    getTime() {
        // 通知MobX这个observable 数据源已经被使用。
        //
        // 如果atom当前状态是 正在被观察（observed），reportObserved将返回true
        // 通过 reaction.在需要时，它会被切换成“startTicking”（开始计时）
        // onBecomeObserved处理函数.
        if (this.atom.reportObserved()) {
            return this.currentDateTime
        } else {
            // 调用了getTime函数，但此时没有任何reaction在运行，隐藏没有人依赖此值。所以并且不会触发startTicking和onBecomeObserved处理程序。
            // 在这种情况下，根据atom的性质，其行为可能会有所不同，例如引发错误，返回默认值等。
            return new Date()
        }
    }

    tick() {
        this.currentDateTime = new Date()
        this.atom.reportChanged() // 通知MobX这个数据源已经更改。
    }

    startTicking() {
        this.tick() // 初始化 tick
        this.intervalHandler = setInterval(() => this.tick(), 1000)
    }

    stopTicking() {
        clearInterval(this.intervalHandler)
        this.intervalHandler = null
    }
}

const clock = new Clock()

const disposer = autorun(() => console.log(clock.getTime()))
// 控制台打印输出运行中的“每一秒”

// 如果没有其他人使用同样的“clock”，它也会停止滴答作响。并且停止在控制的输出
disposer()
```
