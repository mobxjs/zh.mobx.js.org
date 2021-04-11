---
title: 从MobX 4/5迁移
sidebar_label: 从MobX 4/5迁移 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 从MobX 4/5迁移 {🚀}

MobX 6与MobX 5有很大的不同。这一页涵盖了从MobX 4/5到6的迁移指南和所有更改的详细列表。

为了更好地理解，请查看MobX 6.0[CHANGELOG](https://github.com/mobxjs/mobx/blob/main/packages/mobx/CHANGELOG.md#600).

_⚠️ **警告**: 根据你的代码库的大小和复杂性、MobX使用模式和自动化测试的质量等因素，本迁移指南可能会耗费你一小时到几天的时间。如果你对你的持续集成没有信心或者无法有足够的QA /测试应对任何意外的故障，请避免升级。意想不到的行为变化可能是由于MobX本身的变化或者Babel / TypeScript构建配置的变化引起的。 ⚠️_

## 开始

1. 将`mobx`更新到mobx 4/5的最新版本，并处理所有弃用消息。
2. 将`mobx`更新到版本6。
3. 如果你从Mobx 4升级，并且需要兼容不支持Proxy的IE / React Native，请在应用初始化时引入`import { configure } from "mobx"; configure({ useProxies: "never" })`以禁用Proxy实现。 查看 [Proxy Support](configuration.md#proxy-support) 章节以了解更多细节
4. 对于babel用户:
    - 如果你正在使用Babel并启用了类属性，那么请禁用loose字段支持: `["@babel/plugin-proposal-class-properties", { "loose": false }]`
    - (可选) 在MobX 6中，decorators已经变为可选项。如果你不想再使用decorators，从你的babel配置和dependencies中移除`plugin-proposal-decorators`。 查看 [Enabling decorators {🚀}](enabling-decorators.md) 章节以了解更多细节。
5. 对于Typescript用户:
    - 在你的编译器配置中添加`"useDefineForClassFields": true`。
    - (可选) 在MobX 6中，decorators已经变为可选项。 如果你不想再使用decorators，在你的TypeScript配置中移除或者禁用`experimentalDecorators`。 查看 [Enabling decorators {🚀}](enabling-decorators.md) 章节以了解更多细节。
6. MobX默认配置变得更加严格。 我们建议在完成升级后采用新的默认值，查看 [Configuration {🚀}](configuration.md) 章节。 在迁移过程中，我们建议以v4/v5开箱即用的相同方式配置MobX: `import {configure} from "mobx"; configure({ enforceActions: "never" });`。 在完成整个迁移过程并确认您的项目按预期工作之后，请考虑启用`computedRequiresReaction`、`reactionRequiresObservable`和`observableRequiresReaction`以及`enforceActions: "observed"`来编写更符合MobX习惯的代码。

## Upgrading classes to use `makeObservable` 升级类以使用`makeObservable`

由于标准化的JavaScript在如何构造类字段方面的限制，MobX不再可能通过装饰器或`decorate`工具来改变类字段的行为。作为代替，字段必须通过`constructor`定义为observable。有三种不同的实现方式:

1. 移除所有的decorators，并在`constructor`中调用`makeObservable`，并显式地使用对应decorator定义哪个字段应该成为observable。比如: `makeObservable(this, { count: observable, tick: action, elapsedTime: computed })` (注意，第二个参数是传递给`decorate`的内容)。 如果您想在代码库中去掉decorators，并且项目还不是太大，那么推荐使用这种方法。
2. 保留所有的decorators，并在`constructor`中调用`makeObservable(this)`。 这将获取装饰器生成的元数据。如果你想要限制MobX 6迁移的影响，那么推荐使用这种方法。
3. 移除decorators，并在类的`constructor`中调用`makeAutoObservable(this)`。

查看 [makeObservable / makeAutoObservable](observable-state.md) 以了解更多细节.

需要注意的一些细节:

1. 在每个声明MobX的基础成员的类定义中都需要使用`makeObservable` / `makeAutoObservable`。 因此，如果子类和超类都引入了observable成员，它们都必须调用`makeObservable`。
2. `makeAutoObservable`将使用新的decorator`autoAction`标记方法，只有当`action`不在派生上下文中时，它才会应用`action`。这使得从计算属性中调用自动装饰的方法也很安全。

迁移带有许多类的大型代码库可能是令人生畏的。但是不用担心，有一个code-mod可以自动完成上述过程!!

## 使用`mobx-undecorate`codemod 升级你的代码

如果你是一个现有的MobX用户，你的代码使用了许多decorators，或者对`decorate`的等效调用。

[`mobx-undecorate`](https://www.npmjs.com/package/mobx-undecorate) 包提供了一个codemod可以自动更新你的代码，使其更加符合MobX 6。此包无需安装;你只需要下载并使用[`npx`](https://www.npmjs.com/package/npx) 工具，如果你还没有npx工具你必须安装。

如果要弃用所有MobX装饰器的使用，并将它们替换为等效的`makeObservable`调用，请转到包含源代码的目录并运行:

```shell
npx mobx-undecorate
```

MobX会继续支持装饰器语法 -- 因此若你想保留它们并只在需要的地方引入`makeObservable(this)`，你可以使用`--keepDecorators`选项:

```shell
npx mobx-undecorate --keepDecorators
```

查看 [documentation](https://www.npmjs.com/package/mobx-undecorate) 以了解更多选项.

### `mobx-undecorate`的局限性

`mobx-undecorate`命令必须在还没有构造函数的类中引入构造函数。如果构造函数的基类需要参数，则codemod不能为需要升级的子类引入这些参数，而`super`调用也不会传递它们。 你必须手动修复这些问题。
在这些情况下，该工具将生成`// TODO: [mobx-undecorate]`注释。

我们确实有一个React类组件做正确事情的特殊情况
通过`props`传递给超类。
