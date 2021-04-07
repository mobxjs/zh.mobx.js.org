---
title: 创建惰性 observables
sidebar_label: 惰性 observables {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建惰性 observables {🚀}

Usage:

-   `onBecomeObserved(observable, property?, listener: () => void): (() => void)`
-   `onBecomeUnobserved(observable, property?, listener: () => void): (() => void)`

`onBecomeObserved`和`onBecomeUnobserved`方法可以给现有的可观察对象附加惰性行为或副作用。它们是MobX可观察系统的钩子并且
当可观察对象_开始_和_停止_被观察时，它们会得到通知。它们都返回一个用来取消_listener_的_disposer_函数。

在下面的示例中，我们只在实际使用被观察值时才使用它们来执行网络获取。

```javascript
export class City {
    location
    temperature
    interval

    constructor(location) {
        makeAutoObservable(this, {
            resume: false,
            suspend: false
        })
        this.location = location
        // 只有在实际使用温度时才开始获取数据!
        onBecomeObserved(this, "temperature", this.resume)
        onBecomeUnobserved(this, "temperature", this.suspend)
    }

    resume = () => {
        log(`Resuming ${this.location}`)
        this.interval = setInterval(() => this.fetchTemperature(), 5000)
    }

    suspend = () => {
        log(`Suspending ${this.location}`)
        this.temperature = undefined
        clearInterval(this.interval)
    }

    fetchTemperature = flow(function* () {
        // 数据获取逻辑...
    })
}
```
