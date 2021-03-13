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
> 不再支持的旧版文档链接可以在这里找到：[MobX 5](https://cn.mobx.js.org)、[MobX 4（LTS）](https://github.com/SangKa/MobX-Docs-CN/tree/4.0.0/docs)、[MobX 3](https://github.com/SangKa/MobX-Docs-CN/tree/3.0.0/docs)。不过请务必[首先阅读当前版本的文档](about-this-documentation.html)。\
 Mobxjs Team 衷心感谢以下参与文档翻译的同学（排名不分先后）：

<div style="overflow-x: scroll">
    <table style="width: max-content;">
        <tr>  
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

**🥇 黄金赞助商（总赞助 \$3000+）：**<br/>
<a href="https://mendix.com/"><img src="https://zh.mobx.js.org/assets/mendix-logo.png" align="center" width="100" title="Mendix" alt="Mendix" /></a>
<a href="https://frontendmasters.com/"><img src="https://zh.mobx.js.org/assets/frontendmasters.jpg" align="center" width="100" title="Frontend Masters" alt="Frontend Masters"></a>
<a href="https://opensource.facebook.com/"><img src="https://zh.mobx.js.org/assets/fbos.jpeg" align="center" width="100" title="Facebook Open Source" alt="Facebook Open Source" /></a>
<a href="http://auctionfrontier.com/"><img src="https://zh.mobx.js.org/assets/auctionfrontier.jpeg" align="center" width="100" title="Auction Frontier" alt="Auction Frontier"></a>
<a href="https://www.guilded.gg/"><img src="https://zh.mobx.js.org/assets/guilded.jpg" align="center" width="100" title="Guilded" alt="Guilded" /></a>
<a href="https://coinbase.com/"><img src="https://zh.mobx.js.org/assets/coinbase.jpeg" align="center" width="100" title="Coinbase" alt="Coinbase" /></a>
<a href="https://www.canva.com/"><img src="https://zh.mobx.js.org/assets/canva.png" align="center" width="100" title="Canva" alt="Canva" /></a>

**🥇 白银赞助商（每月 \$100+）：**<br/>
<a href="https://www.codefirst.co.uk/"><img src="https://zh.mobx.js.org/assets/codefirst.png" align="center" width="100" title="CodeFirst" alt="CodeFirst"/></a>
<a href="https://www.dcslsoftware.com/"><img src="https://zh.mobx.js.org/assets/dcsl.png" align="center" width="100" title="DCSL Software" alt="DCSL Software"/></a>
<a href="https://www.bugsnag.com/platforms/react-error-reporting?utm_source=MobX&utm_medium=Website&utm_content=open-source&utm_campaign=2019-community&utm_term=20190913"><img src="https://zh.mobx.js.org/assets/bugsnag.jpg" align="center" width="100" title="Bugsnag" alt="Bugsnag"/></a>
<a href="https://curology.com/blog/tech"><img src="https://zh.mobx.js.org/assets/curology.png" align="center" width="100" title="Curology" alt="Curology"/></a>
<a href="https://modulz.app/"><img src="https://zh.mobx.js.org/assets/modulz.png" align="center" width="100" title="Modulz" alt="Modulz"/></a>

**🥇 黄铜赞助商（总赞助 \$500+）：**<br/>
<a href="https://mantro.net/jobs/warlock"><img src="https://zh.mobx.js.org/assets/mantro.png" align="center" width="100" title="mantro GmbH" alt="mantro GmbH"></a>
<a href="https://www.algolia.com/"><img src="https://zh.mobx.js.org/assets/algolia.jpg" align="center" width="100" title="Algolia" alt="Algolia" /></a>
<a href="https://talentplot.com/"><img src="https://zh.mobx.js.org/assets/talentplot.png" align="center" width="100" title="talentplot" alt="talentplot"></a>
<a href="https://careers.dazn.com/"><img src="https://zh.mobx.js.org/assets/dazn.png" align="center" width="100" title="DAZN" alt="DAZN"></a>
<a href="https://blokt.com/"><img src="https://zh.mobx.js.org/assets/blokt.jpg" align="center" width="100" title="Blokt" alt="Blokt"/></a>

---

## 入门

_任何可以从应用状态中派生出来的东西都应该被自动派生出来。_

MobX 是一个身经百战的库，它通过运用透明的函数式响应编程（Transparent Functional Reactive Programming，TFRP）使状态管理变得简单和可扩展。

<div class="benefits">
    <div>
        <div class="pic">😙</div>
        <div>
            <h5>简单直接</h5>
            <p>
                编写没有模板的极简代码来精准描述出你的意图。要更新一个记录字段？用熟悉的 JavaScript 赋值就行。要在异步进程中更新数据？不需要特殊的工具，响应性系统会侦测到你所有的变更并把它们传送到其用武之地。
            </p>
        </div>
    </div>
    <div>
        <div class="pic">🚅</div>
        <div>
            <h5>轻松实现最优渲染</h5>
            <p>
                所有对你数据的变更和使用都会在运行时被追踪到，并构成一个对所有状态和输出之间关系进行捕捉的依赖树。这样保证了依赖于你的状态的计算只有在真正需要时才会运行，就像 React 组件一样。而不需要使用记忆化或选择器之类容易出错的次优技巧来对组件进行手动优化。
            </p>
        </div>
    </div>
    <div>
        <div class="pic">🤹🏻‍♂️</div>
        <div>
            <h5>架构上的自由</h5>
            <p>
                MobX 不会用它自己的规则来限制你，它可以让你在任意 UI 框架之外管理你的应用状态。这样就会使你的代码低耦合、可移植和——最重要的——容易测试。
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

The `observer` wrapper around the `TimerView` React component, will automatically detect that rendering
depends on the `timer.secondsPassed` observable, even though this relationship is not explicitly defined. The reactivity system will take care of re-rendering the component when _precisely that_ field is updated in the future.

Every event (`onClick` / `setInterval`) invokes an _action_ (`myTimer.increase` / `myTimer.reset`) that updates _observable state_ (`myTimer.secondsPassed`).
Changes in the observable state are propagated precisely to all _computations_ and _side effects_ (`TimerView`) that depend on the changes being made.

<img alt="MobX 单向流" src="https://zh.mobx.js.org/assets/flow.zh.png" align="center" />

This conceptual picture can be applied to the above example, or any other application using MobX.

To learn about the core concepts of MobX using a larger example, check out [The gist of MobX](the-gist-of-mobx.md) section, or take the [10 minute interactive introduction to MobX and React](https://zh.mobx.js.org/getting-started).
The philosophy and benefits of the mental model provided by MobX are also described in great detail in the blog posts [UI as an afterthought](https://michel.codes/blogs/ui-as-an-afterthought) and [How to decouple state and UI (a.k.a. you don’t need componentWillMount)](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37).

<div class="cheat"><a href="https://gum.co/fSocU"><button title="Download the MobX 6 cheat sheet and sponsor the project">Download the MobX 6 cheat sheet</button></a></div>

## What others are saying...

> Guise, #mobx isn't pubsub, or your grandpa's observer pattern. Nay, it is a carefully orchestrated observable dimensional portal fueled by the power cosmic. It doesn't do change detection, it's actually a level 20 psionic with soul knife, slashing your viewmodel into submission.

> After using #mobx for lone projects for a few weeks, it feels awesome to introduce it to the team. Time: 1/2, Fun: 2X

> Working with #mobx is basically a continuous loop of me going “this is way too simple, it definitely won’t work” only to be proven wrong

> I have built big apps with MobX already and comparing to the one before that which was using Redux, it is simpler to read and much easier to reason about.

> The #mobx is the way I always want things to be! It's really surprising simple and fast! Totally awesome! Don't miss it!

## Further resources and documentation

-   [MobX cheat sheet (also sponsors the project)](https://gum.co/fSocU)
-   [10 minute interactive introduction to MobX and React](https://zh.mobx.js.org/getting-started)
-   [Egghead.io course, based on MobX 3](https://egghead.io/courses/manage-complex-state-in-react-apps-with-mobx)

### The MobX book

[<img src="https://zh.mobx.js.org/assets/book.jpg" height="80px"/> ](https://books.google.nl/books?id=ALFmDwAAQBAJ&pg=PP1&lpg=PP1&dq=michel+weststrate+mobx+quick+start+guide:+supercharge+the+client+state+in+your+react+apps+with+mobx&source=bl&ots=D460fxti0F&sig=ivDGTxsPNwlOjLHrpKF1nweZFl8&hl=nl&sa=X&ved=2ahUKEwiwl8XO--ncAhWPmbQKHWOYBqIQ6AEwAnoECAkQAQ#v=onepage&q=michel%20weststrate%20mobx%20quick%20start%20guide%3A%20supercharge%20the%20client%20state%20in%20your%20react%20apps%20with%20mobx&f=false)

Created by [Pavan Podila](https://twitter.com/pavanpodila) and [Michel Weststrate](https://twitter.com/mweststrate).

### Videos

-   [Introduction to MobX & React in 2020](https://www.youtube.com/watch?v=pnhIJA64ByY) by Leigh Halliday, _17min_.
-   [ReactNext 2016: Real World MobX](https://www.youtube.com/watch?v=Aws40KOx90U) by Michel Weststrate, _40min_, [slides](https://docs.google.com/presentation/d/1DrI6Hc2xIPTLBkfNH8YczOcPXQTOaCIcDESdyVfG_bE/edit?usp=sharing).
-   [CityJS 2020: MobX, from mutable to immutable, to observable data](https://youtu.be/sP7dtZm_Wx0?t=27050) by Michel Weststrate, _30min_.
-   [OpenSourceNorth: Practical React with MobX (ES5)](https://www.youtube.com/watch?v=XGwuM_u7UeQ) by Matt Ruby, _42min_.
-   [HolyJS 2019: MobX and the unique symbiosis of predictability and speed](https://www.youtube.com/watch?v=NBYbBbjZeX4&list=PL8sJahqnzh8JJD7xahG5zXkjfM5GOgcPA&index=21&t=0s) by Michel Weststrate, _59min_.
-   [React Amsterdam 2016: State Management Is Easy](https://www.youtube.com/watch?v=ApmSsu3qnf0&feature=youtu.be) by Michel Weststrate, _20min_, [slides](https://speakerdeck.com/mweststrate/state-management-is-easy-introduction-to-mobx).
-   {🚀} [React Live 2019: Reinventing MobX](https://www.youtube.com/watch?v=P_WqKZxpX8g) by Max Gallo, _27min_.

And an all around [MobX awesome list](https://github.com/mobxjs/awesome-mobx#awesome-mobx).

## Credits

MobX is inspired by reactive programming principles as found in the spreadsheets. It is inspired by MVVM frameworks like MeteorJS tracker, knockout and Vue.js, but MobX brings _Transparent Functional Reactive Programming_ to the next level and provides a standalone implementation. It implements TFRP in a glitch-free, synchronous, predictable and efficient manner.

A ton of credits goes to [Mendix](https://github.com/mendix), for providing the flexibility and support to maintain MobX and the chance to proof the philosophy of MobX in a real, complex, performance critical applications.
