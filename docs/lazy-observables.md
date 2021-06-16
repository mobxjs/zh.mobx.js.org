---
title: Creating lazy observables
sidebar_label: Lazy observables {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建惰性可观察对象 {🚀}

使用：

-   `onBecomeObserved(observable, property?, listener: () => void): (() => void)`
-   `onBecomeUnobserved(observable, property?, listener: () => void): (() => void)`

`onBecomeObserved`可以为已存在的对象添加一种惰性可观察机制。也就是说，只有当传入的属性真正变成可观察状态时，其`listener`回调才会被触发。同样，当传入的属性停止被观察时，`onBecomeUnobserved`函数的`listener`也才会被触发。这两个函数也都会返回`disposer`用于解除此机制

在下面示例中，创建了`city`实例，并在`autorun`中对`temperature`属性进行观察之后。`onBecomeObserved`就会被触发并调用`resume`方法，然后每隔一秒调用`fetchTemperature`方法请求数据。过三秒之后，调用`disposer`取消对`temperature`属性的观察，`onBecomeUnobserved`也会被触发并调用`suspend`方法

```javascript
class City {
  location;
  temperature;
  interval;

  constructor(location) {
    mobx.makeAutoObservable(this, {
      resume: false,
      suspend: false
    });
    this.location = location;
    // Only start data fetching if temperature is actually used!
    mobx.onBecomeObserved(this, "temperature", this.resume);
    mobx.onBecomeUnobserved(this, "temperature", this.suspend);
  }

  resume = () => {
    console.log(`Resuming ${this.location}`);
    this.interval = setInterval(() => this.fetchTemperature(), 1000);
  };

  suspend = () => {
    console.log(`Suspending ${this.location}`);
    this.temperature = undefined;
    clearInterval(this.interval);
  };

  fetchTemperature = mobx.flow(function* () {
    console.log("fetch data...");
  });
}

const city = new City('beijing');
const disposer = mobx.autorun(() => {
  console.log(city.temperature)
})

setTimeout(() => {
  disposer()
}, 3000)
```
