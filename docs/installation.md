---
title: 安装
sidebar_label: 安装
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 安装

MobX可在任何ES5环境（包括浏览器和NodeJS）中运行。

有两种类型的React绑定，mobx-react-lite仅支持函数组件，而mobx-react也支持基于类的组件。可以使用Yarn、NPM、CDN集成MobX到您的项目中：

**Yarn:** `yarn add mobx`

**NPM:** `npm install --save mobx`

**CDN:** https://cdnjs.com/libraries/mobx / https://unpkg.com/mobx/dist/mobx.umd.production.min.js

## 类属性使用符合规范进行转换

⚠️ **Warning:** 将MobX与TypeScript和Babel一起使用时，您计划使用类；确保更新您的配置，以将TC-39规范兼容的转换用于类字段，因为这不是默认设置。否则，无法在初始化类字段之前使其可观察。

-   Babel: 请确保至少使用版本号为7.12的babel. 使用[@babel/plugin-proposal-class-properties](https://babel.docschina.org/docs/en/babel-plugin-proposal-class-properties/) plugin, babel针对类属性的配置为 `["@babel/plugin-proposal-class-properties", { "loose": false }]`
-   TypeScript, 设置编译器选项为 `"useDefineForClassFields": true`

## 在较旧的JavaScript环境中使用MobX

默认情况下，MobX使用代理来获得最佳性能和兼容性。但是，在较旧的JavaScript引擎Proxy上不可用 (请查看 [Proxy support](https://kangax.github.io/compat-table/es6/#test-Proxy))。例如Internet Explorer（Edge之前），Node.js <6，iOS <10，RN 0.59之前的Android或iOS上的Android。

在这种情况下，MobX可以回退到与ES5兼容的实现，该实现几乎相同地工作，尽管没有代理支持也有一些限制[limitations without Proxy support](configuration.md#limitations-without-proxy-support)。您将必须通过配置明确启用降级方案 [`useProxies`](configuration.md#proxy-support):

```javascript
import { configure } from "mobx"

configure({ useProxies: "never" }) // Or "ifavailable".
```

## MobX和装饰器

如果您以前使用过MobX，或者如果您遵循了在线教程，则可能会看到MobX支持装饰器，例如@observable。在MobX 6中，我们选择默认情况下远离装饰器，以最大程度地与标准JavaScript兼容。如果您启用了它们，它们仍然可以使用 [enable them](enabling-decorators.md)。

## 其他框架/平台上的MobX

-   [MobX.dart](https://mobx.netlify.app/): 适用于Flutter / Dart的Mobx
-   [lit-mobx](https://github.com/adobe/lit-mobx): 适用于lit-element的MobX
-   [mobx-angular](https://github.com/mobxjs/mobx-angular): 适用于angular的
-   [mobx-vue](https://github.com/mobxjs/mobx-vue): 适用于Vue的Mobx
