---
title: 启用装饰器语法
sidebar_label: 启用装饰器语法 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 启用装饰器语法 {🚀}

在版本6之前，Mobx鼓励使用ES.next中的decorators,将某个对象标记为`observable`, `computed` 和 `action`。然而，装饰器语法尚未定案以及未被纳入ES标准，标准化的过程还需要很长时间，且未来制定的标准可能与当前的装饰器实现方案有所不同。出于兼容性的考虑，我们在MobX 6中放弃了它们，并建议使用[`makeObservable` / `makeAutoObservable`](observable-state.md)代替。

鉴于目前仍有很多代码库，在线文档和教程在使用decorator，我们的规则是，任何可以使用`observable`, `action` 和 `computed`等注解的地方，你也可以使用decorator。 下面是示例：
 
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
        this.finished = !this.finished
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

版本6之前的Mobx,不需要在构造函数中调用`makeObservable(this)`。在版本6中，为了让装饰器的实现更简单以及保证装饰器的兼容性，必须在构造函数中调用`makeObservable(this)`。Mobx可以根据 `makeObservable`第二个参数提供的装饰器信息，将实例设置为observable。

我们打算以这种方式来继续支持decorators。通过使用[代码转换工具](https://www.npmjs.com/package/mobx-undecorate) ,你可以将任何现有的 MobX 4/5 项目，转换成使用`makeObservable`的项目。 当你将你的项目从 MobX4/5 迁移到 MobX6 时，我们建议你始终运行[代码转换工具](https://www.npmjs.com/package/mobx-undecorate) ，以确保生成了必要的`makeObservable`。

查看 [MobX 4/5 升级指南 {🚀}](migrating-from-4-or-5.md) 

## 将`observer` 作为装饰器使用

`mobx-react`中的`observer`除了可以作为函数来使用，也可以作为装饰器，用来修饰类组件：

```javascript
@observer
class Timer extends React.Component {
    /* ... */
}
```

## 启用装饰器语法支持

在装饰器语法被正式纳入JavaScript官方规范之前，我们不建议你在使用MobX的项目里使用它。如果要使用装饰器语法，你必须使用Babel或Typescript对它进行转译。

### TypeScript

在`tsconfig.json`中启用编译器选项 `"experimentalDecorators": true` 和 `"useDefineForClassFields": true`。

### Babel 7

安装支持装饰器所需要的依赖：`npm i --save-dev @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators`，并在 `.babelrc`文件中启用（注意，插件的顺序很重要）：

```javascript
{
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": false }]
        // 与MobX 4/5不同的是, "loose" 必须为 false!    ^
    ]
}
```

### 装饰器语法 和 Create React App (v2)

只有使用`create-react-app@^2.1.1`及更新版本创建的Typescript项目，才开箱即用地支持装饰器语法。如果你的项目是使用旧版本`create-react-app`创建的或者是创建的Javascript项目，可以使用`eject`命令或者使用[customize-cra](https://github.com/arackaf/customize-cra) 。

## 免责声明: 装饰器语法的局限:

_当前编译器所实现的装饰器语法是有一些限制的，而且与实际的装饰器语法表现并非完全一致。 此外，在所有编译器都实现第二阶段的提议之前，许多组合模式目前都无法与装饰器一起使用。 由于这个原因，目前在 MobX 中对装饰器语法支持的范围进行了限定，以确保支持的特性在所有环境中始终保持一致。_

MobX 社区并没有正式支持以下模式：

-   重新定义继承树中的装饰类成员
-   装饰静态类成员
-   将 MobX 提供的装饰器与其他装饰器组合
-   热更新 (HMR) / React-hot-loader 可能不能正常运行
