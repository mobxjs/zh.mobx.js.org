---
title: 启用装饰器语法
sidebar_label: 启用装饰器语法 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# Enabling decorators {🚀}

MobX before version 6 encouraged the use of ES.next decorators to mark things as `observable`, `computed` and `action`. However, decorators are currently not an ES standard, and the process of standardization is taking a long time. It also looks like the standard will be different from the way decorators were implemented previously. In the interest of compatibility we have chosen to move away from them in MobX 6, and recommend the use of [`makeObservable` / `makeAutoObservable`](observable-state.md) instead.

But many existing codebases use decorators, and a lot of the documentation and tutorial material online uses them as well. The rule is that anything you can use as an annotation to `makeObservable`, such as `observable`, `action` and `computed`, you can also use as a decorator. So let's examine what that looks like:

```javascript
import { makeObservable, observable, computed, action } from "mobx"

class Todo {
    id = Math.random()
    @observable title = ""
    @observable finished = false

    constructor() {
        makeObservable(this)
    }

    @action
    toggle() {
        this.finished = !finished
    }
}

class TodoList {
    @observable todos = []

    @computed
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length
    }

    constructor() {
        makeObservable(this)
    }
}
```

MobX before version 6 did not require the `makeObservable(this)` call in the constructor, but because it makes the implementation of decorator simpler and more compatible, it now does. This instructs MobX to make the instances observable following the information in the decorators -- the decorators take the place of the second argument to `makeObservable`.

We intend to continue to support decorators in this form.
Any existing MobX 4/5 codebase can be migrated to use `makeObservable` calls by our [code-mod](https://www.npmjs.com/package/mobx-undecorate).
When migrating from MobX 4/5 to 6, we recommend to always run the code-mod, to make sure the necessary `makeObservable` calls are generated.

Check out the [Migrating from MobX 4/5 {🚀}](migrating-from-4-or-5.md) section.

## 将`observer` 作为装饰器使用

`mobx-react`中的除了可以作为函数来使用，`observer`也可以作为装饰器，用来修饰类组件：

```javascript
@observer
class Timer extends React.Component {
    /* ... */
}
```

## 启用装饰器语法支持

We do not recommend new codebases that use MobX use decorators until the point when they become an official part of the language, but you can still use them. It does require setup for transpilation so you have to use Babel or TypeScript.

### TypeScript

在`tsconfig.json`中启用编译器选项 `"experimentalDecorators": true` 和 `"useDefineForClassFields": true`。

### Babel 7

安装支持装饰器所需要的依赖：`npm i --save-dev @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators`，并在 `.babelrc`文件中启用（注意，插件的顺序很重要）：

```javascript
{
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": false }]
        // In contrast to MobX 4/5, "loose" must be false!    ^
    ]
}
```

### 装饰器语法 和 Create React App (v2)

Decorators are only supported out of the box when using TypeScript in `create-react-app@^2.1.1` and newer. In older versions or when using vanilla JavaScript use eject, or the [customize-cra](https://github.com/arackaf/customize-cra) package.

## 免责声明: 装饰器语法的局限:

_当前编译器所实现的装饰器语法是有一些限制的，而且与实际的装饰器语法表现并非完全一致。 此外，在所有编译器都实现第二阶段的提议之前，许多组合模式目前都无法与装饰器一起使用。 由于这个原因，目前在 MobX 中对装饰器语法支持的范围进行了限定，以确保支持的特性在所有环境中始终保持一致。_

MobX 社区并没有正式支持以下模式：

-   重新定义继承树中的装饰类成员
-   装饰静态类成员
-   将 MobX 提供的装饰器与其他装饰器组合
-   热更新 (HMR) / React-hot-loader 可能不能正常运行
