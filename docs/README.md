---
title: 关于 MobX
sidebar_label: 关于 MobX
hide_title: true
---

<img src="https://zh.mobx.js.org/assets/mobx.png" alt="logo" height="120" align="right" />

# MobX

_简单，可扩展的状态管理_

[![Discuss on Github](https://img.shields.io/badge/discuss%20on-GitHub-orange)](https://github.com/mobxjs/mobx/discussions)
[![npm version](https://badge.fury.io/js/mobx.svg)](https://badge.fury.io/js/mobx)
[![OpenCollective](https://opencollective.com/mobx/backers/badge.svg)](backers-sponsors.md#backers)
[![OpenCollective](https://opencollective.com/mobx/sponsors/badge.svg)](backers-sponsors.md#sponsors)

---

## 文档翻译贡献者

> 不再支持的旧版文档链接可以在这里找到：[MobX 5](https://cn.mobx.js.org)、[MobX 4（LTS）](https://github.com/SangKa/MobX-Docs-CN/tree/4.0.0/docs)、[MobX 3](https://github.com/SangKa/MobX-Docs-CN/tree/3.0.0/docs)。\
> 不过请务必[首先阅读当前版本的文档](about-this-documentation.html)。\
> Mobxjs Team 衷心感谢以下参与文档翻译的同学（排名不分先后）

<div style="overflow-x: scroll">
    <table style="width: max-content;">
        <tr>  
            <td align="center">
                <a href="https://github.com/Neo42" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/22409868?s=100&v=4" width="50px">
                    <br />
                    <sup style="font-size: 12px">Neo42</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/BlackHole1" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/8198408?s=100&v=4" width="50px">
                    <br />
                    <sup style="font-size: 12px">Black-Hole</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/lichangwei" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/718802?s=100&v=4" width="50px">
                    <br />
                    <sup style="font-size: 12px">lichangwei</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/njueyupeng" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/13177502?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">njueyupeng</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ai-xiaihai" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/12586770?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">ai-xiaihai</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ObservedObserver" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/22167673?s=100&v=4" width="50px">
                    <br />
                    <sup style="font-size: 12px">ObservedObserver</sup>
                </a>
            </td>
        </tr>
        <tr>
            <td align="center">
                <a href="https://github.com/berber1016 " target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/31471551?s=100&v=4" width="50px">
                    <br />
                    <sup style="font-size: 12px">berber1016</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/BM-laoli" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/60060313?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">BM-laoli</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/wangjq4214" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/35188480?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">wangjq4214</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/WanderWang" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/2238280?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">WanderWang</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/standout-jjc" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/17778067?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">standout-jjc</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/wuxyman" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/34463605?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">wuxyman</sup>
                </a>
            </td>
        </tr>
        <tr>
            <td align="center">
                <a href="https://github.com/newraina" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/10708802?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">newraina</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/YuFengDing" target="_blank">
                    <img src="https://avatars.githubusercontent.com/u/23763023?v=4&s=100" width="50px">
                    <br />
                    <sup style="font-size: 12px">YuFengDing</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/mobxjs/zh.mobx.js.org" target="_blank">
                    <img src="img/placeholder.svg" width="50px">
                    <br />
                    <sup style="font-size: 12px">虚位以待</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/mobxjs/zh.mobx.js.org" target="_blank">
                    <img src="img/placeholder.svg" width="50px">
                    <br />
                    <sup style="font-size: 12px">虚位以待</sup>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/mobxjs/zh.mobx.js.org" target="_blank">
                    <img width="50px" src="https://zh.mobx.js.org/assets/mobx.png">
                    <br />
                    <sup style="font-size: 12px">立即参与翻译 ↗️</sup>
                </a>
            </td>  
        </tr>
    </table>
</div>

## Mobx 项目赞助商

MobX 因为以下赞助商和其他许多[独立资助者](backers-sponsors.md#backers)的慷慨相助而成为可能。赞助直接影响着这个项目的长久发展。

**🥇 金牌赞助商（总赞助 \$3000+）：**<br/>
<a href="https://mendix.com/"><img src="https://zh.mobx.js.org/assets/mendix-logo.png" align="center" width="100" title="Mendix" alt="Mendix" /></a>
<a href="https://frontendmasters.com/"><img src="https://zh.mobx.js.org/assets/frontendmasters.jpg" align="center" width="100" title="Frontend Masters" alt="Frontend Masters"></a>
<a href="https://opensource.facebook.com/"><img src="https://zh.mobx.js.org/assets/fbos.jpeg" align="center" width="100" title="Facebook Open Source" alt="Facebook Open Source" /></a>
<a href="http://auctionfrontier.com/"><img src="https://zh.mobx.js.org/assets/auctionfrontier.jpeg" align="center" width="100" title="Auction Frontier" alt="Auction Frontier"></a>
<a href="https://www.guilded.gg/"><img src="https://zh.mobx.js.org/assets/guilded.jpg" align="center" width="100" title="Guilded" alt="Guilded" /></a>
<a href="https://coinbase.com/"><img src="https://zh.mobx.js.org/assets/coinbase.jpeg" align="center" width="100" title="Coinbase" alt="Coinbase" /></a>
<a href="https://www.canva.com/"><img src="https://zh.mobx.js.org/assets/canva.png" align="center" width="100" title="Canva" alt="Canva" /></a>

**🥇 银牌赞助商（每月 \$100+）：**<br/>
<a href="https://www.codefirst.co.uk/"><img src="https://zh.mobx.js.org/assets/codefirst.png" align="center" width="100" title="CodeFirst" alt="CodeFirst"/></a>
<a href="https://www.dcsl.com/"><img src="https://mobx.js.org/assets/dcsl.png" align="center" width="100" title="DCSL Guidesmiths" alt="DCSL Guidesmiths"/></a>
<a href="https://www.bugsnag.com/platforms/react-error-reporting?utm_source=MobX&utm_medium=Website&utm_content=open-source&utm_campaign=2019-community&utm_term=20190913"><img src="https://zh.mobx.js.org/assets/bugsnag.jpg" align="center" width="100" title="Bugsnag" alt="Bugsnag"/></a>
<a href="https://curology.com/blog/tech"><img src="https://zh.mobx.js.org/assets/curology.png" align="center" width="100" title="Curology" alt="Curology"/></a>
<a href="https://modulz.app/"><img src="https://zh.mobx.js.org/assets/modulz.png" align="center" width="100" title="Modulz" alt="Modulz"/></a>

**🥇 铜牌赞助商（总赞助 \$500+）：**<br/>
<a href="https://mantro.net/jobs/warlock"><img src="https://zh.mobx.js.org/assets/mantro.png" align="center" width="100" title="mantro GmbH" alt="mantro GmbH"></a>
<a href="https://www.algolia.com/"><img src="https://zh.mobx.js.org/assets/algolia.jpg" align="center" width="100" title="Algolia" alt="Algolia" /></a>
<a href="https://talentplot.com/"><img src="https://zh.mobx.js.org/assets/talentplot.png" align="center" width="100" title="talentplot" alt="talentplot"></a>
<a href="https://careers.dazn.com/"><img src="https://zh.mobx.js.org/assets/dazn.png" align="center" width="100" title="DAZN" alt="DAZN"></a>
<a href="https://blokt.com/"><img src="https://zh.mobx.js.org/assets/blokt.jpg" align="center" width="100" title="Blokt" alt="Blokt"/></a>

---

## 入门

_任何可以从应用状态中派生出来的值都应该被自动派生出来。_

MobX 是一个身经百战的库，它通过运用透明的函数式响应编程（Transparent Functional Reactive Programming，TFRP）使状态管理变得简单和可扩展。

<div class="benefits">
    <div>
        <div class="pic">😙</div>
        <div>
            <h5>简单直接</h5>
            <p>
                编写无模板的极简代码来精准描述出你的意图。要更新一个记录字段？使用熟悉的 JavaScript 赋值就行。要在异步进程中更新数据？不需要特殊的工具，响应性系统会侦测到你所有的变更并把它们传送到其用武之地。
            </p>
        </div>
    </div>
    <div>
        <div class="pic">🚅</div>
        <div>
            <h5>轻松实现最优渲染</h5>
            <p>
                所有对数据的变更和使用都会在运行时被追踪到，并构成一个截取所有状态和输出之间关系的依赖树。这样保证了那些依赖于状态的计算只有在真正需要时才会运行，就像 React 组件一样。无需使用记忆化或选择器之类容易出错的次优技巧来对组件进行手动优化。
            </p>
        </div>
    </div>
    <div>
        <div class="pic">🤹🏻‍♂️</div>
        <div>
            <h5>架构自由</h5>
            <p>
                MobX 不会用它自己的规则来限制你，它可以让你在任意 UI 框架之外管理你的应用状态。这样会使你的代码低耦合、可移植和最重要的——容易测试。
            </p>
        </div>
    </div>
</div>

## 一个简单的例子

那么使用 MobX 的代码是什么样的呢？

```javascript
import React from "react"
import ReactDOM from "react-dom"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react"

// 对应用状态进行建模。
class Timer {
    secondsPassed = 0

    constructor() {
        makeAutoObservable(this)
    }

    increase() {
        this.secondsPassed += 1
    }

    reset() {
        this.secondsPassed = 0
    }
}

const myTimer = new Timer()

// 构建一个使用 observable 状态的“用户界面”。
const TimerView = observer(({ timer }) => (
    <button onClick={() => timer.reset()}>已过秒数：{timer.secondsPassed}</button>
))

ReactDOM.render(<TimerView timer={myTimer} />, document.body)

// 每秒更新一次‘已过秒数：X’中的文本。
setInterval(() => {
    myTimer.increase()
}, 1000)
```

围绕 React 组件 `TimerView` 的 `observer` 包装会自动侦测到依赖于 observable `timer.secondsPassed` 的渲染——即使这种依赖关系没有被明确定义出来。
响应性系统会负责在未来*恰好那个*字段被更新的时候将组件重新渲染。

每个事件（`onClick` 或 `setInterval`）都会调用一个用来更新 *observable 状态* `myTimer.secondsPassed` 的 *action*（`myTimer.create` 或 `myTimer.reset`）。Observable 状态的变更会被精确地传送到 `TimerView` 中所有依赖于它们的*计算*和*副作用*里。

<img alt="MobX 单向流" src="https://zh.mobx.js.org/assets/zh.flow.png" align="center" />

除了适用于上面的例子之外，这个概念图也适用于其他任何使用 MobX 的应用。

如果想通过一个更大的例子来了解 MobX 的核心概念，请参阅 [MobX 精要](the-gist-of-mobx.md)部分或查看 [10 分钟交互式入门 MobX 和 React](https://zh.mobx.js.org/getting-started)。这些博客文章 [事后再考虑 UI](https://michel.codes/blogs/ui-as-an-afterthought) 和 [怎样解耦状态和 UI （又名：你不需要 componentWillMount）](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37)也对 MobX 所提供的心智模型做了非常详细的描述。

<div class="cheat"><a href="https://gum.co/fSocU"><button title="Download the MobX 6 cheat sheet and sponsor the project">下载 MobX 6 速查表</button></a></div>

## 其他人都在说……

> 兄 dei 们，#mobx 用的并不是发布订阅，也不是你爷爷的观察者模式。非也，它用的是一个经过精心设计的、由宇宙力量驱动的 observable 维度传送门。它并不会进行变更侦测。它其实是个带着一把灵魂刀的 20 级灵能师，连劈带砍让你的视图模型屈服于其刀下。

> 在个人项目里用了几周 #mobx 之后把它介绍给了团队，感觉很棒。一半的时间，双倍的快乐

> 简单地说，使用 #mobx 就是一个持续的循环，我不停地嘀咕“这也太简单了，肯定行不通”，结果不断证明我错了。

> 我已经用 MobX 写过大型的应用了，比起之前那个用 Redux 写的，用 MobX 写的更容易阅读，理解起来也容易得多。

> #mobx 符合我一直以来想要的事物的样子。真是出人意料的简单快速！非常棒！别错过了！

## 延伸资源和文档

-   [MobX 速查表 (也赞助了本项目)](https://gum.co/fSocU)
-   [十分钟交互式入门 MobX 和 React](https://zh.mobx.js.org/getting-started.html)
-   [Egghead.io 课程，基于 MobX 3](https://egghead.io/courses/manage-complex-state-in-react-apps-with-mobx)

### MobX 书

[<img src="https://zh.mobx.js.org/assets/book.jpg" height="80px"/> ](https://books.google.nl/books?id=ALFmDwAAQBAJ&pg=PP1&lpg=PP1&dq=michel+weststrate+mobx+quick+start+guide:+supercharge+the+client+state+in+your+react+apps+with+mobx&source=bl&ots=D460fxti0F&sig=ivDGTxsPNwlOjLHrpKF1nweZFl8&hl=nl&sa=X&ved=2ahUKEwiwl8XO--ncAhWPmbQKHWOYBqIQ6AEwAnoECAkQAQ#v=onepage&q=michel%20weststrate%20mobx%20quick%20start%20guide%3A%20supercharge%20the%20client%20state%20in%20your%20react%20apps%20with%20mobx&f=false)

由 [Pavan Podila](https://twitter.com/pavanpodila) 和 [Michel Weststrate](https://twitter.com/mweststrate) 编写。

### 视频

-   [MobX 和 React 入门 2020](https://www.youtube.com/watch?v=pnhIJA64ByY) by Leigh Halliday，_17 分钟_。
-   [ReactNext 2016：真实世界中的 MobX](https://www.youtube.com/watch?v=Aws40KOx90U) by Michel Weststrate，_40 分钟_， [slides](https://docs.google.com/presentation/d/1DrI6Hc2xIPTLBkfNH8YczOcPXQTOaCIcDESdyVfG_bE/edit?usp=sharing)。
-   [CityJS 2020：MobX，从可变到不可变, 再到 observable 数据](https://youtu.be/sP7dtZm_Wx0?t=27050) by Michel Weststrate，_30 分钟_。
-   [OpenSourceNorth：上手 React 和 MobX（ES5）](https://www.youtube.com/watch?v=XGwuM_u7UeQ) by Matt Ruby，_42 分钟_。
-   [HolyJS 2019：MobX and the unique symbiosis of predictability and speed](https://www.youtube.com/watch?v=NBYbBbjZeX4&list=PL8sJahqnzh8JJD7xahG5zXkjfM5GOgcPA&index=21&t=0s) by Michel Weststrate，_59 分钟_。
-   [React Amsterdam 2016：状态管理很简单](https://www.youtube.com/watch?v=ApmSsu3qnf0&feature=youtu.be) by Michel Weststrate，_20 分钟_，[slides](https://speakerdeck.com/mweststrate/state-management-is-easy-introduction-to-mobx)。
-   {🚀} [React Live 2019：再造 MobX](https://www.youtube.com/watch?v=P_WqKZxpX8g) by Max Gallo，_27 分钟_。

和一份全面的 [MobX awesome list](https://github.com/mobxjs/awesome-mobx#awesome-mobx).

## 鸣谢

MobX 的灵感来源于在电子表格中被发现的响应式编程原则，也来源于 MeteorJS tracker，knockout 和 Vue.js 之类的 MVVM 框架，但 MobX 将透明的函数式响应编程（Transparent Functional Reactive Programming）推向了一个新的高度，并提供了一个独立的实现。它用一种顺畅、同步、可预测又高效的方式实现了 TFRP。

我们要特别鸣谢 [Mendix](https://github.com/mendix)，他们为 MobX 的维护提供了灵活性和支持，也给了我们一个机会，在一个真实而又复杂的性能关键型应用中证明了 MobX 的理念。
