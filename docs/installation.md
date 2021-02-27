---
title: Installation
sidebar_label: Installation
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 安装

MobX 可以在任何 ES5 环境中工作，包括浏览器和 NodeJS。

有两种类型的 React 绑定，`mobx-react-lite` 仅支持函数组件，而 `mobx-react` 也支持基于 class 的组件。为您的用例添加适当的绑定到下面的 _Yarn_ 或 _NPM_ 命令中：

**Yarn:** `yarn add mobx`

**NPM:** `npm install --save mobx`

**CDN:** https://cdnjs.com/libraries/mobx / https://unpkg.com/mobx/dist/mobx.umd.production.min.js

## 对 class 属性使用符合规范的转换

⚠️ **注意:** 当与 TypeScript 和 Babel 一起使用 Mobx 时，你计划使用 class；因为这不是默认设置，所以请确保更新您的配置，以便将 TC-39 规范兼容的转换用于 class 字段。否则 class 字段在初始化之前就不能成为可观察对象。

-   对于 Babel: 确保版本至少使用 7.12。 使用插件 `["@babel/plugin-proposal-class-properties", { "loose": false }]`
-   对于 TypeScript, 设置编译选项 `"useDefineForClassFields": true`

## 在旧的 JavaScript 环境中使用 Mobx

默认情况下，Mobx 使用代理来优化性能和兼容性。然而在旧的 JavaScript 引擎上，`Proxy` 是不可用的（请查看 [Proxy 支持](configuration.md#limitations-without-proxy-support) )。例如 Internet Explorer（在 Edge 之前），Node.js < 6，iOS < 10，Android before RN 0.59, or Android on iOS。

在这种情况下，Mobx 可以退回到与 ES5 兼容的实现，该实现几乎相同地工作，尽管在[没有代理支持的情况下会有一些限制](https://zh.mobx.js.org/configuration.html#limitations-without-proxy-support)。您将必须通过配置 [`useProxy`](configuration.md#proxy-support) 显式地启用后备实现。

```javascript
import { configure } from "mobx"

configure({ useProxies: "never" }) // 或 "ifavailable".
```

## MobX 和 装饰器

如果您之前使用过 Mobx，或者如果您关注过在线教程，您可能会看到 Mobx 带有 `@observable` 这样的装饰器。在 Mobx 6 中，我们选择在默认情况下远离装饰器，以最大程度地与标准 JavaScript 兼容。如果您[启动它们](enabling-decorators.md)，他们仍然可以使用。

## 其他框架 / 平台上的 MobX

-   [MobX.dart](https://mobx.netlify.app/): Flutter / Dart 的 MobX
-   [lit-mobx](https://github.com/adobe/lit-mobx): lit-element 的 MobX
-   [mobx-angular](https://github.com/mobxjs/mobx-angular): angular 的 MobX
-   [mobx-vue](https://github.com/mobxjs/mobx-vue): Vue 的 MobX
