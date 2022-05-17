---
title: Installation
sidebar_label: 安装
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 安装

MobX可在任何ES5环境（包括浏览器和NodeJS）中运行。

MobX 有两种 React 绑定方式，其中 mobx-react-lite仅支持函数组件，mobx-react 还支持基于类的组件。可以使用Yarn、NPM、CDN集成MobX到您的项目中：

**Yarn:** `yarn add mobx`

**NPM:** `npm install --save mobx`

**CDN:** https://cdnjs.com/libraries/mobx / https://unpkg.com/mobx/dist/mobx.umd.production.min.js

## 对类属性使用符合规范的转换

⚠️ **Warning:** 当 MobX 与 TypeScript 或者 Babel一起使用时，且计划使用类；因为 TC-39 不是默认配置，请检查你的配置文件，确保使用 TC-39 规范兼容的配置转换类字段。否则，无法在初始化类字段之前使其可观察。

-   Babel: 请确保至少使用版本号为7.12的babel. 使用[@babel/plugin-proposal-class-properties](https://babel.docschina.org/docs/en/babel-plugin-proposal-class-properties/) plugin, babel针对类属性的配置为 `["@babel/plugin-proposal-class-properties", { "loose": false }]`
-   TypeScript, 设置编译器选项为 `"useDefineForClassFields": true`

## 在较旧的JavaScript环境中使用MobX

默认情况下，MobX使用`Proxy`来获得最佳性能和兼容性。但是在较旧的JavaScript引擎`Proxy`上不可用 (请查看 [Proxy support](https://kangax.github.io/compat-table/es6/#test-Proxy))。例如Internet Explorer（Edge之前），Node.js <6，iOS <10，RN 0.59之前的Android或iOS上的Android。

在这种情况下，MobX可以回退到与ES5兼容的实现，该实现几乎相同地工作，尽管不使用`Proxy`有一些限制[limitations without Proxy support](configuration.md#limitations-without-proxy-support)。您将必须通过配置明确启用降级方案 [`useProxies`](configuration.md#proxy-support):

```javascript
import { configure } from "mobx"

configure({ useProxies: "never" }) // Or "ifavailable".
```

## MobX和装饰器

如果你以前使用过 Mobx，或者你看过在线教程，你可能会看到  Mobx 可以使用带有 `@observable` 这样的装饰器。在 Mobx 6中，为了与标准 JavaScript 的最大兼容性，我们在默认情况下放弃了装饰器。但如果[启用](enabling-decorators.md)它们，它们仍然可以使用。

**译者注**: 如果好奇放弃原因，可以到👉🏻[官方 issue](https://github.com/mobxjs/mobx/issues/2325) 和 [TC39 Class](https://github.com/tc39/proposal-class-fields#public-fields-created-with-objectdefineproperty) 查看了解更多信息。

## 其他框架/平台上的MobX

-   [MobX.dart](https://mobx.netlify.app): 适用于Flutter / Dart的Mobx
-   [lit-mobx](https://github.com/adobe/lit-mobx): 适用于lit-element的MobX
-   [mobx-angular](https://github.com/mobxjs/mobx-angular): 适用于angular的MobX
-   [mobx-vue](https://github.com/mobxjs/mobx-vue): 适用于Vue的Mobx
