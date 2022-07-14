---
title: 使用子类
sidebar_label: 使用子类
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 使用子类

对使用子类的支持是有[限制](#limitations)的。 最值得注意的一点是你只能**重新定义原型中的 actions/flows/computeds**——你不能重新定义_[字段声明](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#field_declarations)_。 在子类中请使用 `override` 注释被重新定义的methods/getters - 见下例。 请凡事从简，并优先考虑组合（而非继承）。

```javascript
import { makeObservable, observable, computed, action, override } from "mobx"

class Parent {
    // 被注释的实例字段不可被重新定义
    observable = 0
    arrowAction = () => {}

    // 未被注释的实例字段可以被重新定义
    overridableArrowAction = action(() => {})

    // 被注释的原型methods/getters可以被重新定义
    action() {}
    actionBound() {}
    get computed() {}

    constructor(value) {
        makeObservable(this, {
            observable: observable,
            arrowAction: action
            action: action,
            actionBound: action.bound,
            computed: computed,
        })
    }
}

class Child extends Parent {
    /* --- 继承来的定义 --- */
    // 抛出 - TypeError: Cannot redefine property
    // observable = 5
    // arrowAction = () = {}

    // OK - 未被注释的
    overridableArrowAction = action(() => {})

    // OK - 原型
    action() {}
    actionBound() {}
    get computed() {}

    /* --- 新的定义 --- */
    childObservable = 0;
    childArrowAction = () => {}
    childAction() {}
    childActionBound() {}
    get childComputed() {}

    constructor(value) {
        super()
        makeObservable(this, {
            // 继承来的
            action: override,
            actionBound: override,
            computed: override,
            // 新的
            childObservable: observable,
            childArrowAction: action
            childAction: action,
            childActionBound: action.bound,
            childComputed: computed,
        })
    }
}
```

## Limitations

1. 只有定义在**原型**上的 `action`, `computed`, `flow`, `action.bound` 可以在子类中被**重新定义**。
1. 不能在子类中重新注释字段（`override` 除外）。
1. `makeAutoObservable` 不支持在子类中使用。
1. 不支持扩展内置数据结构（ObservableMap, ObservableArray, 等）。
1. 你不能在子类中给`makeObservable`提供不同选项。
1. 你不能在单个继承链中混合使用注解/装饰器。
1. [所有其他限制均在此适用](observable-state.html#limitations)。

### `TypeError: Cannot redefine property`

如果你遇到这一错误, 你可能正在子类中**重新定义箭头函数**`x = () => {}`。 其不可行的原因是**一切被注释的**类字段都是**不可配置的**([详见限制](observable-state.md#limitations))。 你有以下这两个选择:

<details><summary>1. 将函数移至原型并使用`action.bound`注释</summary>

```javascript
class Parent {
    // action = () => {};
    // =>
    action() {}

    constructor() {
        makeObservable(this, {
            action: action.bound
        })
    }
}
class Child {
    action() {}

    constructor() {
        super()
        makeObservable(this, {
            action: override
        })
    }
}
```

</details>
<details><summary>2. 移除`action`注释并手动将函数包装于action里：`x = action(() => {})`</summary>

```javascript
class Parent {
    // action = () => {};
    // =>
    action = action(() => {})

    constructor() {
        makeObservable(this, {}) // <-- 注释已被移除
    }
}
class Child {
    action = action(() => {})

    constructor() {
        super()
        makeObservable(this, {}) // <-- 注释已被移除
    }
}
```

</details>
