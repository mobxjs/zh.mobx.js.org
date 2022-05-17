---
title: 分析响应性
sidebar_label: 分析响应性 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 分析响应性 {🚀}

# 使用 `trace` 进行调试

`trace` 是一个可以帮你发现 `computed`, `reaction` 或 component 为什么会重新计算的小工具。

通过  `import { trace } from "mobx"` 导入 `trace`，然后在 `computed` 或 `reaction` 函数内部调用它，它就会打印出当前派生值为什么会重新计算。

你也可以选择把 `true` 作为最后一个参数传入 `trace` 从而自动进入调试模式。这样以来引起 `reaction` 重新计算的那个变动就还会停留在调用栈中，通常处于往上大约 8 个栈帧的位置，请看下图。

在调试模式中，调试信息中会展示出影响当前 computation 或 reaction 的完整的派生树。

![trace](assets/trace-tips2.png)

![trace](assets/trace.gif)

## 在线示例

[CodeSandbox `trace` 示例](https://codesandbox.io/s/trace-dnhbz?file=/src/index.js:309-338)

[这个部署在 now.sh 上的例子](https://csb-nr58ylyn4m-hontnuliaa.now.sh/) 可以用来研究调用堆栈，请务必尝试一下 Chrome 调试器的 blackbox 特性！
【译者注：该示例已经失效，此处提到的 Chrome 调试器的 blackbox 现已更名为 Ignore List，可以在调试时跳过某些库，让调试更有效率】

## 用法示例

`trace()` 有几种用法，下面是些例子:

```javascript
import { observer } from "mobx-react"
import { trace } from "mobx"

const MyComponent = observer(() => {
    trace(true) // 当某个可监听值发生变化导致组件重新运行时进入调试模式
    return <div>{this.props.user.name}</name>
})
```

通过 `reaction` 或 `autorun` 函数的参数 `reaction` 来启用 `trace`：

```javascript
mobx.autorun("logger", reaction => {
    reaction.trace()
    console.log(user.fullname)
})
```

在 `trace` 函数中传入对象和它的 `computed` 属性名：

```javascript
trace(user, "fullname")
```

# 内部检查 API

如果你在调试时想检查 Mobx 的内部状态，或基于 Mobx 实现一些很酷的工具，下面的这些方法就会派上用场。还有各种相关的[`isObservable*` API](api.md#isobservable).

### `getDebugName`

用法：

-   `getDebugName(thing, property?)`

为可监听对象，属性，`reaction`等返回一个（生成的）便于调试的名字。比如，这个方法就被 [MobX 开发者工具](https://github.com/mobxjs/mobx-devtools)所使用。

### `getDependencyTree`

用法：

-   `getDependencyTree(thing, property?)`.

返回指定 reaction 或 computation 当前所依赖的所有可监听值所组成的树结构。

### `getObserverTree`

用法：

-   `getObserverTree(thing, property?)`.

返回正在监听指定可监听对象的所有 `reaction` 和 
所组成的树结构。

### `getAtom`

用法：

-   `getAtom(thing, property?)`.

返回指定可监听对象，属性或 `reaction` 背后的 _Atom_.

# Spy

用法：

-   `spy(listener)`

注册一个全局的 spy 监听器来监听 Mobx 里发生的所有事件，相当于一次性给**所有**可监听对象添加了 `observe` 监听器，但也会通知到运行着的 transaction, reaction 和 computation。
比如，这个方法就被 [MobX 开发者工具](https://github.com/mobxjs/mobx-devtools)所使用。

这是一个监视所有 action 的例子：

```javascript
spy(event => {
    if (event.type === "action") {
        console.log(`${event.name} with args: ${event.arguments}`)
    }
})
```

`spy`监听器始终接收一个对象，这个对象一般至少带有一个`type`字段。下面的事件都是 `spy` 默认触发的：

| 类型                             | 可监听类型      | 其他字段                                                        | 是否嵌套 |
| ------------------------------- | -------------- | -------------------------------------------------------------- | ------ |
| action                          |                | name, object (scope), arguments[]                              | yes    |
| scheduled-reaction              |                | name                                                           | no     |
| reaction                        |                | name                                                           | yes    |
| error                           |                | name, message, error                                           | no     |
| add,update,remove,delete,splice |                | 参考 [Intercept & observe {🚀}](intercept-and-observe.md)       | yes    |
| report-end                      |                | spyReportEnd=true, time? (毫秒单位的总执行时间)                   | no     |

`report-end` 事件是一个先前触发的、带有 `spyReportStart: true` 属性的事件的一部分，这个事件表示一个事件的结束，而这样一来，几个由若干子事件组成的事件组就被创建出来了。这个事件也可能会报告总执行时间。

可监听值的 `spy` 事件和传递给 `observe` 的事件相同。在 Mobx 的生产版本中，`spy` API 会在压缩过程中被删除，因而变成一个 no-op 语句。

更多信息请参考 [Intercept & observe {🚀}](intercept-and-observe.md#event-overview) 章节。
