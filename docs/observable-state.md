---
title: Creating observable state
sidebar_label: Observable state
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 创建 observable state

属性、整个对象、数组、Map、Set 都可以被设置为 observable。
使对象可观察的基础是使用 `makeObservable` 为每个属性指定一个注解。最重要的注解是:

-   `observable` 定义 store state 的可跟踪字段。
-   `action` 将方法标记为修改状态的操作。
-   `computed` 标记一个 getter，该 getter 将从 state 派生新的事实并缓存其输出

Array、Maps、Sets 之类的集合将自动被观察到。

## `makeObservable`

使用:

-   `makeObservable(target, annotations?, options?)`

它可以用来捕获 _现有_ 对象属性并使它们成为 observable。任何 JavaScript 对象（包括 class 实例）都可以传递到 `target`。
通常，`makeObservable` 是在 class 的 constructor 中使用的，它的第一个参数是 this。
`annotation` 参数将 [注解](#available-annotations) 到每个成员上，使用 [装饰器](enabling-decorators.md) 时，可以省略 `annotation` 参数。

派生信息并接受参数的方法（例如：`findUsersOlderThan(age: number): User[]`） 不需要任何的 `annotation`。当从一个 reaction 调用它们时，它们的读操作任然会被跟踪，但是不会记住它们的输出，以避免内存泄漏。也可以查看 [MobX-utils computedFn {🚀}](https://github.com/mobxjs/mobx-utils#computedfn)

通过 `override annotation` 以 [支持 Subclassing，但有一些限制](subclassing.md)
[Subclassing is supported with some limitations](subclassing.md) via `override` annotation.

<!--DOCUSAURUS_CODE_TABS-->
<!--class + makeObservable-->

```javascript
import { makeObservable, observable, computed, action } from "mobx";

class Doubler {
    value;

    constructor(value) {
        makeObservable(this, {
            value: observable,
            double: computed,
            increment: action,
            fetch: flow,
        });
        this.value = value;
    }

    get double() {
        return this.value * 2;
    }

    increment() {
        this.value++;
    }

    *fetch() {
        const response = yield fetch("/api/value");
        this.value = response.json();
    }
}
```

**所有 annotated** 字段是 **non-configurable**。<br>
**所有 non-observable** (stateless) 字段 (`action`, `flow`) 是 **non-writable**.

<!--factory function + makeAutoObservable-->

```javascript
import { makeAutoObservable } from "mobx";

function createDoubler(value) {
    return makeAutoObservable({
        value,
        get double() {
            return this.value * 2;
        },
        increment() {
            this.value++;
        },
    });
}
```

注意，class 也可以利用 `makeAutoObservable`。
实例中的差异只是演示了如何将 Mobx 应用不同的编程风格。

<!--observable-->

```javascript
import { observable } from "mobx";

const todosById = observable({
    "TODO-123": {
        title: "找到一个体面的任务管理系统",
        done: false,
    },
});

todosById["TODO-456"] = {
    title: "关闭所有两周以上的门票",
    done: true,
};

const tags = observable(["高价", "均价", "廉价"]);
tags.push("价格: 开玩笑的");
```

与第一个例子中的 `makeObservable` 不同，`observable` 支持向对象添加（和删除）_字段_。
这使得 `observable` 非常适合用于动态键 Object、Array、Maps、Sets 之类的集合。

<!--END_DOCUSAURUS_CODE_TABS-->

## `makeAutoObservable`

使用:

-   `makeAutoObservable(target, overrides?, options?)`

`makeAutoObservable` 就像 steroids 上的 `makeObservable`，因为它会默认推断出所有的属性。您仍然可以使用 `overrides` 来覆盖特定 annotations 的默认行为。
特别的，`false` 可以用来排除一个属性或者方法被完全处理。
查看上面的代码选项卡以获得一个实例。
与使用 `makeObservable` 相比，`makeAutoObservable` 函数更紧凑，更容易维护，因为新成员不需要显式地提到。
然而，`makeAutoObservable` 不能用于具有父类或者[子类](subclassing.md)的 class。

推理规则：

-   任何包含函数值的（继承的）成员都将使用 `autoAction` 进行注解。
-   任何 `get`ter 都将使用 `computed` 进行注解。
-   任何其他的 _own_ 字段都会被标记为 `observable`。
-   任何（继承的）生成器函数成员都将使用 `flow` 进行注解。（注意，在某些编译器配置中，生成器函数是检测不到到，如果 `flow` 没有像预期的那样工作，请确保显式指定 `flow`）
-   在 `overrides` 参数中标记为 `false` 的成员将不会被注解。例如，将其用于标识符等只读字段。

## `observable`

使用:

-   `observable(source, overrides?, options?)`

`observable` 注解也可以作为一个函数来调用，让整个对象同时成为可观察对象。
`source` 对象将被克隆，所有成员都将成为可观察对象，类似于 `makeAutoObservable`。
同样，可以提供 `overrides` map 来指定特定成员的注解。
查看上面的代码块作为示例。

`observable` 对象返回的对象将是一个代理，这意味着稍后添加到该对象中的属性也将被拾取并成为可观察对象(除非禁用了[使用代理](configuration.md#proxy-support))。

`observable` 方法也可以通过 [arrays](api.md#observablearray), [Maps](api.md#observablemap) and [Sets](api.md#observableset) 等集合类型来调用。他们也将被克隆，并转换成可观察到的对等体。

<details id="observable-array"><summary>**例子：** observable array<a href="#observable-array" class="tip-anchor"></a></summary>

下面的例子创建了一个可观察对象，并使用 [`autorun`](reactions.md#autorun) 来观察它。
处理 Map 和 Set 集合的工作原理类似。

```javascript
import { observable, autorun } from "mobx";

const todos = observable([
    { title: "泡茶", completed: true },
    { title: "煮咖啡", completed: false },
]);

autorun(() => {
    console.log(
        "剩下的：",
        todos
            .filter((todo) => !todo.completed)
            .map((todo) => todo.title)
            .join(", ")
    );
});
// 打印: '剩下的：煮咖啡'

todos[0].completed = false;
// 打印: '剩下的：泡茶, 煮咖啡'

todos[2] = { title: "打个盹", completed: false };
// 打印: '剩下的：泡茶, 煮咖啡, 打个盹'

todos.shift();
// 打印: '剩下的：煮咖啡, 打个盹'
```

可观察数组还有一些额外的实用功能：

-   `clear()` 从数组中删除所有当前条目。
-   `replace(newItems)` 用新条目替换数组中的所有现有条目。
-   `remove(value)` 按值从数组中移除单个项。如果找到并删除了项目，则返回 `true`。

</details>

<details id="non-convertibles"><summary>**注意:** 原始值 和 class 实例永远不会转换为 observables<a href="#non-convertibles" class="tip-anchor"></a></summary>

原始值不能被 Mobx 观察到，因为它们在 JavaScript 中是不可变的(但它们可以被 [boxed](api.md#observablebox))。
尽管这种机制在 library 之外通常没有用处。

通过将 class 实例传递给 `Observable` 或将其分配给 `Observable` 属性，它们将永远不会自动变为可观察的状态。
使 class 成员可观察是 class constructor 函数的责任。

</details>

<details id="avoid-proxies"><summary>{🚀} **提示:** observable (已代理) 和 makeObservable (未代理)<a href="#avoid-proxies" class="tip-anchor"></a></summary>

`make(Auto)Observable` 和 `observable` 之间的主要区别在于，前端会修改作为第一个参数传递的对象，而 `observable` 会创建一个可观察的 _克隆_。

第二个区别是，`observable` 创建了一个 [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 对象，以便在使用该对象作为动态查找映射时能够捕捉未来添加的属性。
如果你想让可观察的对象具有一个常规的结构，其中所有的成员都是事先已知的，我们建议使用 `makeObservable`，因为非代理对象速度稍快，而且它们更容易在 `debugger` 和 `console.log` 中检查。

因此，建议在工厂函数中使用 `make(Auto)Observable`。请注意，可以将 `{ proxy: false }` 作为选项传递给 O `observable` 以获得非代理克隆。

</details>

## 可用的注解

| 注解                               | 说明                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observable`<br/>`observable.deep` | 定义一个 stores state 的可跟踪字段。如果可能，分配给可观察字段的任何值也将被递归地观察。也就是说，当且仅当值是纯对象、数组、Map、Set 时。                                 |
| `observable.ref`                   | 和 `observable` 类似，但只有重新分配才会被跟踪。所赋值本身不会自动成为可观察值。例如，如果你打算将不可变数据存储在一个可观察字段中，可以使用这个。                        |
| `observable.shallow`               | 类似于 `observable.ref`，但用于集合。分配的所有集合都将变为可观察的，但是集合本身的内容将变得不可观察。                                                                   |
| `observable.struct`                | 与 `Observable` 类似，不同之处在于结构上与当前值相等的赋值将被忽略。                                                                                                      |
| `action`                           | 将方法标记为将修改状态的操作。请查看 [actions](actions.md) 了解更多详细信息。不可写。                                                                                     |
| `action.bound`                     | 与 `action` 相似，但也会将 action 绑定到实例，因此将始终设置 `this`。不可写。                                                                                             |
| `computed`                         | 可用于 [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)，将其声明为可缓存的派生值。查看 [computeds](computeds.md) 获得更多细节。 |
| `computed.struct`                  | 与 `computed` 类似，不同之处在于，如果重新计算后的结果在结构上等于先前的结果，则不会通知任何观察者。                                                                      |
| `true`                             | 推断最佳注释。请查看 [makeAutoObservable](#makeautoobservable) 了解更多详细信息。                                                                                         |
| `false`                            | 显式不注释此属性。                                                                                                                                                        |
| `flow`                             | 创建 `flow` 来管理异步流程。有关更多详细信息，请访问 [flow](actions.md#using-flow-instead-of-async--await-)。请注意，TypeScript 中推断的返回类型可能已关闭。不可写。      |
| `override`                         | [适用于子类覆盖的继承的 `action`, `flow`, `computed`, `action.bound`](subclassing.md).                                                                                    |
| `autoAction`                       | 不应显式使用，而应由 `makemakeObservable` 在幕后使用，以根据其调用来标记可以用作操作或派生的方法                                                                          |

## 局限性

1. `make(Auto)Observable` 仅支持已定义的属性。确保您的[**编译器配置**正确](installation.md#use-spec-compliant-transpilation-for-class-properties)，或者作为解决方案，在使用 `make(Auto)Observable` 之前，先给所有属性赋一个值。如果没有正确的配置，声明但没有初始化的字段（像`class X { y; }`） 将无法正确获取。
2. `makeObservable` 只能注解由其自己的类定义声明的属性。如果子类或超类引入了可观察字段，则必须为这些属性本身调用 `makeObservable`。
3. `options` 参数只能提供一次。传递的 `options` 是 _"sticky"_ 的，不能在以后更改（例如：[子类](subclassing.md)）。
4. **每个字段只能注解一次** (除了 `override`)。字段注解或配置不能在[子类](subclassing.md)中更改。
5. **所有带注解的** 字段都是**不可配置**的，在 非普通对象(**classes**)里。<br>
   [可以通过 `configure({ safeDescriptors: false })` 禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
6. **所有不可观察** (无状态) 的字段 (`action`, `flow`) 都是 **不可写的**。<br>
   [可以通过 `configure({ safeDescriptors: false })` 禁用 {🚀☣️} ](configuration.md#safedescriptors-boolean)。
7. [只有 **`action`, `computed`, `flow`, `action.bound`** 在**原型上**定义的可以被子类**重写**](subclassing.md)。
8. 默认情况下，_TypeScript_ 不允许您注解 **private** 字段。可以通过将相关的私有字段显式传递为通用参数来克服，例如： `makeObservable<MyStore, "privateField" | "privateField2">(this, { privateField: observable, privateField2: observable })`
9. 必须**无条件**地 **调用 `make(Auto)Observable`** 并提供注释，因为这可以缓存推理结果。
10. **不支持**在 **`make(Auto)Observable`** 被调用后**修改原型**。
11. **不支持** _EcmaScript_ **private** 字段（**`#field`**）。使用 _TypeScript_ 时，建议改用 `private` 修饰符。
12. **不支持**在单一继承链中**混合注解和装饰器**。例如，您不能将装饰器用于超类，不能将注释用于子类。
13. `makeObservable`,`extendObservable` 不能在其他内置可观察类型上使用 (如：`ObservableMap`, `ObservableSet`, `ObservableArray`)
14. `makeObservable(Object.create(prototype))` 将属性从 `prototype` 复制到创建的对象，并使它们成为 `observable`。此行为是错误的，不可预期的，因此**已被弃用**，并且在将来的版本中可能会更改。不要依赖它。

## 选项 {🚀}

以上接口都有一个可选的 `options` 参数，该参数是一个支持以下选项的对象：

-   **`autoBind: true`** 默认使用 `action.bound`, 而不是 `action`. 不影响显式注解的成员。
-   **`deep: false`** 默认使用 `observable.ref`, 而不是 `observable`. 不影响显式注解的成员。
-   **`name: <string>`** 为对象提供一个调试名称，该名称将打印在错误消息和反射 API 中。在生产中被忽略。
-   **`proxy: false`** 强制 `observable(thing)` 使用 非[**代理**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 实现. 如果对象的形状不会随时间改变，那么这是一个很好的选择，因为非代理对象更容易调试，也更快。见 [避免代理](#avoid-proxies)。

<details id="one-options-per-target"><summary>**注意:** 选项具有 *sticky*，只能提供一次<a href="#one-options-per-target" class="tip-anchor"></a></summary>
`options` 参数只能为还不能观察到的 `目标` 提供。<br>
一旦可观察对象被初始化，就不可能更改选项。<br>
选项存储在目标上，并通过后续的 `makeObservable` / `extendObservable` 调用来使用。<br>
您不能在[子类](subclassing.md)中传递其他选项。
</details>

## 将 observable 转换回普通的 JavaScript 集合

有时有必要将可观察的数据结构转换回原始的数据结构。
例如，当将可观察对象传递给不能跟踪可观察对象的 React 组件时，或者要获得不应进一步变异的克隆时。

为了简单地转换集合，通常的 JavaScript 机制是这样工作的：

```javascript
const plainObject = { ...observableObject };
const plainArray = observableArray.slice();
const plainMap = new Map(observableMap);
```

要将数据树递归转换为纯对象，可以使用 [`toJS`](api.md#tojs) 实用程序。
对于类，建议实现一个 `toJSON()` 方法，因为它将由 `JSON.stringify` 获取。

## 关于 class 的简短说明

到目前为止，以上大多数示例都倾向于使用 class 语法。
MobX 原则上对此没有限制，并且可能有许多使用普通对象的 MobX 用户。
然而，class 的一个小好处是它们具有更容易发现的 API，例如 TypeScript。
此外，`instanceof` 检查对于类型推断确实非常强大，并且类实例没有包装在 `Proxy` 对象中，从而使它们在调试器中拥有更好的体验。
最后，class 可以从许多引擎优化中受益，因为它们的形状是可以预测的，并且方法在原型上是共享的。
但是繁重的继承模式很容易成为军火库，因此，如果您使用 class，请使其保持简单。
因此，尽管稍微倾向于使用类，但如果更适合您，我们肯定会鼓励您偏离这种风格。
