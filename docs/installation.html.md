---
title: 安装
authorURL: ""
originalURL: https://mobx.js.org/installation.html
translator: ""
reviewer: ""
---

MobX 可在任何 ES 5 环境中工作，包括浏览器和 Node.js。

共有两种 React 绑定，`mobx-react-lite` 只支持函数组件，而 `mobx-react` 还支持类组件。适合您用例的绑定的 _Yarn_ 或 _NPM_ 命令附在下面:

**Yarn:** `yarn add mobx`

**NPM:** `npm install --save mobx`

**CDN:** https://cdnjs.com/libraries/mobx / https://unpkg.com/mobx/dist/mobx.umd.production.min.js

# 转义设置

## MobX 和装饰器

MobX 是否和装饰器一起使用可取决于您的偏好，当前旧版实现和标准化的 TC-39 版本装饰器都被支持。关于如何启用它们，可查看 [/enabling-decorators.html][1] 中的更多细节。旧版装饰器支持将在 MobX 7 中被移除，以支持标准。

## 为类属性使用符合规范的转译

当配合 TypeScript 或 Babel 使用 MobX，并且你计划使用类，一定要更新你的配置，才能为类字段启用一个符合 TC-39 规范的转译，因为这不总是默认值。没有这个，类字段无法在它们被初始化前成为可观察数据。

-   **TypeScript**：设置编译器选项 `"useDefineForClassFields": true`。
-   **Babel**：一定要用至少 7.12 版，并有以下配置:

    ```json
    {
        // Babel < 7.13.0
        "plugins": [
            ["@babel/plugin-proposal-class-properties", { "loose": false }]
        ],

        // Babel >= 7.13.0 (https://babeljs.io/docs/en/assumptions)
        "plugins": [["@babel/plugin-proposal-class-properties"]],
        "assumptions": {
            "setPublicClassFields": false
        }
    }
    ```

将以下代码插入你源码的开头（如 `index.js`）以便校验：

```javascript
if (
    !new (class {
        x;
    })().hasOwnProperty("x")
)
    throw new Error("转译器配置错误");
```

## 在旧 JavaScript 环境中的 MobX

默认情况下，MobX 使用 `Proxy` 对象来实现最佳性能与兼容性。然而，在旧 JavaScript 引擎中 `Proxy` 不可用（查看 [Proxy 支持][2]）。例如 Internet Explorer（Edge 之前）、Node.js < 6、iOS < 10、Android 或 iOS（RN 0.59 之前）.

在这些情况下，MobX 可以回退到 ES 5 兼容实现，其工作原理几乎相同， 尽管它有一些[缺少 Proxy 支持的限制][3]。你必须配置 [`useProxies`][4] 来显示启用后备实现：

```javascript
import { configure } from "mobx";

configure({ useProxies: "never" }); // Or "ifavailable".
```

这个选项将在 MobX 7 中被移除。

## 在其它框架、平台中的 MobX

-   [MobX.dart][5]：MobX 的 Flutter / Dart 实现
-   [lit-mobx][6]：MobX 的 LitElement 适配
-   [mobx-angular][7]：MobX 的 Angular 适配
-   [mobx-vue][8]：MobX 的 Vue 适配

[1]: /enabling-decorators.md
[2]: https://compat-table.github.io/compat-table/es6/#test-Proxy
[3]: /configuration.html#limitations-without-proxy-support
[4]: /configuration.html#proxy-support
[5]: https://mobx.netlify.app/
[6]: https://github.com/adobe/lit-mobx
[7]: https://github.com/mobxjs/mobx-angular
[8]: https://github.com/mobxjs/mobx-vue
