---
title: 启用装饰器语法
sidebar_label: 启用装饰器语法 {🚀}
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

## 启用装饰器

历经多年改造，ES 装饰器终于到达 TC39 流程的 Stage 3，意味着它们已经非常稳定，并不再有装饰器提案早期版本的不兼容变更。MobX 已实现对“2022.3/Stage 3”新装饰器语法的支持。有了现代装饰器，我们不再需要调用 `makeObservable`、`makeAutoObservable`。

2022.3 版装饰器支持情况：

-   TypeScript（5.0 及更新，并确保 `experimentalDecorators` 选项是**禁用**的）。[示例提交][1]。
-   对于 Babel，确保 [`proposal-decorators`][2] 插件以最高版本启用 （当前是 `2023-05`）。[示例提交][3].

```json
// tsconfig.json
{
    "compilerOptions": {
        "experimentalDecorators": false /* 或直接移除该选项 */
    }
}

// babel.config.json（或等价的）
{
    "plugins": [
        [
            "@babel/plugin-proposal-decorators",
            {
                "version": "2023-05"
            }
        ]
    ]
}
```

## 使用装饰器

```javascript
import { observable, computed, action } from "mobx";

class Todo {
    id = Math.random();
    @observable accessor title = "";
    @observable accessor finished = false;

    @action
    toggle() {
        this.finished = !this.finished;
    }
}

class TodoList {
    @observable accessor todos = [];

    @computed
    get unfinishedTodoCount() {
        return this.todos.filter((todo) => !todo.finished).length;
    }
}
```

注意在使用 `@observable` 时的 `accessor` 新关键字用法。它是 2022.3 版规范的一部分，也是你使用现代装饰器的必需品。

<details>
<summary>使用旧版装饰器</summary>

我们不推荐代码库使用 TypeScript / Babel 旧版装饰器，因为它们永远不会成为语言的正式部分，但你仍可使用它们。它确实需要特定的转译设置：

MobX 6 之前的版本鼓励使用旧版装饰器，并将事物标记为 `observable`、`computed` 和 `action`。虽然 MobX 6 建议不要使用这些装饰器（而是使用现代装饰器或 [`makeObservable`、`makeAutoObservable`][4]），但它在当前大版本依然可用。对旧版装饰器的支持将在 MobX 7 被移除。

```javascript
import { makeObservable, observable, computed, action } from "mobx";

class Todo {
    id = Math.random();
    @observable title = "";
    @observable finished = false;

    constructor() {
        makeObservable(this);
    }

    @action
    toggle() {
        this.finished = !this.finished;
    }
}

class TodoList {
    @observable todos = [];

    @computed
    get unfinishedTodoCount() {
        return this.todos.filter(todo => !todo.finished).length;
    }

    constructor() {
        makeObservable(this);
    }
}
```

</details>

<details>
<summary>从旧版装饰器迁移</summary>

从旧版装饰器迁移到现代装饰器，需执行以下步骤:

1.  从你的 TypeScript 配置（或 Babel 等价配置）中禁用或删除 `experimentalDecorators` 选项
2.  从使用装饰器的类的构造函数中移除所有 `makeObservable(this)` 调用
3.  将 `@observable`（及其变体）的所有实例替换为 `@observable accessor`
</details>

<details>
<summary>装饰器变更、陷阱</summary>

MobX 2022.3 装饰器与 MobX 5 的非常相似，所以大多数用法是相同的，但是有一些陷阱：

-   `@observable accessor` 装饰器是 _不可_ 枚举的。`accessor` 没有一个与过去直接等价的事物 —— 它们是一个语言中的新概念。我们使它们成为不可枚举、非自有属性，以便更好地遵循 ES 语言的精神和 `accessor` 的含义。可枚举性的主要案例似乎是围绕序列化和剩余解构的。
    -   关于序列化，隐式序列化所有属性在 OOP 世界中可能并不理想，因此这似乎不是一个重大问题（考虑实现 `toJSON` 或使用 `serializer` 作为可能的替代方案）
    -   至于解决剩余解构，这在 MobX 中是一个反模式 —— 这么做会（非预期地）触及所有可观察数据并让观察者过度反应。
-   _如果_ `makeObservable()` 被启用，`@action some_field = () => {}` 曾是并仍是可用的。然而，`@action accessor some_field = () => {}` 从不可用。
</details>

## 将 `observer` 用作装饰器

来自 `mobx-react` 的 `observer` 函数既是一个普通函数，又是一个可用在类组件的装饰器：

```javascript
@observer
class Timer extends React.Component {
    /* ... */
}
```

[1]: https://github.com/mweststrate/currencies-demo/commit/acb9ac8c148e8beef88042c847bb395131e85d60
[2]: https://babeljs.io/docs/babel-plugin-proposal-decorators
[3]: https://github.com/mweststrate/currencies-demo/commit/4999d2228208f3e1e10bc00a272046eaefde8585
[4]: observable-state
