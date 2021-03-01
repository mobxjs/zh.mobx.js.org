---
title: 创建一个自定义 observables
sidebar_label: 自定义 observables {}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建一个自定义的 observables {}

## Atoms （原子化设计）

在某些情况下，您可能希望有更多的数据结构或其他东西(如流)，用于响应式计算。
通过使用原子的概念来实现这一点非常简单。
可以使用Atoms向MobX发出信号，表示某些可观察数据源已经被观察或更改，而MobX将在atom被使用或不再使用时向atom发出信号。

_**Tip**: in many cases you can avoid the need to create your own atoms just by creating a normal observable, and using
the [`onBecomeObserved`](lazy-observables.md) utility to be notified when MobX starts tracking it._

The following example demonstrates how you can create an observable `Clock` that returns the current date-time, which can then be used in reactive functions.
This clock will only actually tick if it is being observed by someone.

The complete API of the `Atom` class is demonstrated by this example.

```javascript
import { createAtom, autorun } from "mobx"

class Clock {
    atom
    intervalHandler = null
    currentDateTime

    constructor() {
        // Creates an atom to interact with the MobX core algorithm.
        this.atom = createAtom(
            // 1st parameter:
            // - Atom's name, for debugging purposes.
            "Clock",
            // 2nd (optional) parameter:
            // - Callback for when this atom transitions from unobserved to observed.
            () => this.startTicking(),
            // 3rd (optional) parameter:
            // - Callback for when this atom transitions from observed to unobserved.
            () => this.stopTicking()
            // The same atom transitions between these two states multiple times.
        )
    }

    getTime() {
        // Let MobX know this observable data source has been used.
        //
        // reportObserved will return true if the atom is currently being observed
        // by some reaction. If needed, it will also trigger the startTicking
        // onBecomeObserved event handler.
        if (this.atom.reportObserved()) {
            return this.currentDateTime
        } else {
            // getTime was called, but not while a reaction was running, hence
            // nobody depends on this value, and the startTicking onBecomeObserved
            // handler won't be fired.
            //
            // Depending on the nature of your atom it might behave differently
            // in such circumstances, like throwing an error, returning a default
            // value, etc.
            return new Date()
        }
    }

    tick() {
        this.currentDateTime = new Date()
        this.atom.reportChanged() // Let MobX know that this data source has changed.
    }

    startTicking() {
        this.tick() // Initial tick.
        this.intervalHandler = setInterval(() => this.tick(), 1000)
    }

    stopTicking() {
        clearInterval(this.intervalHandler)
        this.intervalHandler = null
    }
}

const clock = new Clock()

const disposer = autorun(() => console.log(clock.getTime()))
// Prints the time every second.

// Stop printing. If nobody else uses the same `clock`, it will stop ticking as well.
disposer()
```
