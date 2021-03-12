---
title: MobX API 参考
sidebar_label: MobX API 参考
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# MobX API 参考

用 {🚀} 标记的函数是进阶部分，通常不需要使用。请考虑下载我们的速查表，它用一页篇幅解释了所有重要的 API:

<div class="cheat"><a href="https://gum.co/fSocU"><button title="Download the MobX 6 cheat sheet and sponsor the project">下载 MobX 6 速查表</button></a></div>

## 核心 API

_这些是 MobX 中最重要的 API。_

> 理解 [`observable`](#observable), [`computed`](#computed), [`reaction`](#reaction) 和 [`action`](#action) 就足够你掌握 MobX 并在你的应用中使用它了！

## 创建 observables

_把事物变得可观察。_

### `makeObservable`

[**用法**](observable-state.md#makeobservable)：`makeObservable(target, annotations?, options?)`

属性、整个对象、数组、Maps 和 Sets 都可以变得可观察。

### `makeAutoObservable`

[**用法**](observable-state.md#makeautoobservable)：`makeAutoObservable(target, overrides?, options?)`

自动把属性、对象、数组、Maps 和 Sets 变得可观察。

### `extendObservable`

{🚀} 用法：`extendObservable(target, properties, overrides?, options?)`

可以用来在 `target` 对象上引入新属性并立即把它们全都变得可观察。基本上就是 `Object.assign(target, properties); makeAutoObservable(target, overrides, options);` 的简写。但它不会变动 `target` 上已有的属性。

老式的构造器函数可以很好地跟 `extendObservable` 结合起来使用:

```javascript
function Person(firstName, lastName) {
    extendObservable(this, { firstName, lastName })
}

const person = new Person("Michel", "Weststrate")
```

使用 `extendObservable` 在一个对象实例化之后再为其添加可观察字段也是可以的，但要注意，以这种方式添加可观察属性这一行为本身并不能被 MobX 观察到。

### `observable`

[**用法**](observable-state.md#observable)：`observable(source, overrides?, options?)` 或 `observable`_（注解）_

克隆一个对象并使其可观察。`source` 可以是一个普通的对象、数组、Map 或 Set。默认情况下， `observable` 会被递归调用。如果遇到的值中有一个是对象或数组，那么那个值也会被传入 `observable`。

### `observable.object`

{🚀} [**用法**](observable-state.md#observable)：`observable.object(source, overrides?, options?)`

`observable(source, overrides?, options?)` 的别名。创建一个被传入对象的副本并使它的所有属性可观察。

### `observable.array`

{🚀} 用法：`observable.array(initialValues?, options?)`

根据被传入的 `initialValues` 创建一个新的可观察数组。如果要把可观察数组转化回普通的数组，就请使用 `.slice()` 方法，或者参阅 [toJS](#tojs) 进行递归转化。除了语言中内置的所有数组方法之外，可观察数组中还有以下好东西可用：

-   `clear()` 删除数组中所有现存的元素。
-   `replace(newItems)` 用新元素替换数组中所有现存的元素。
-   `remove(value)` 从数组中删除一个值为 `value` 的元素，在找到并删除该元素后返回 `true`。

如果数组中的值不能被自动转化为 observable，则可使用 `{ deep: false }` 选项对该数组进行浅转化。

### `observable.map`

{🚀} 用法：`observable.map(initialMap?, options?)`

根据被传入的 `initialMap` 创建一个新的可观察的 [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)。如果你不仅想对特定值的改变作出反应，还想对其添加和删除做出反应的话，那么它们就会变得非常有用。如果你没有[启用代理](configuration.md#代理支持)，那么推荐你使用创建可观察 Maps 的方式来创建动态键控集合。

除了语言内置的所有 Map 方法之外，可观察 Maps 中还有以下好东西可用：

-   `toJSON()` 返回该 Map 的浅层普通对象表示（使用 [toJS](#tojs) 进行深拷贝）。
-   `merge(values)` 将被传入的 `values` （普通的对象、数组或以字符串为键的 ES6 Map ）的所有条目复制到该 Map 中。
-   `replace(values)` 用被传入的 `values` 替换该 Map 的全部内容。

如果 Map 中的值不能被自动转化为 observable，则可使用 `{ deep: false }` 选项对该 Map 进行浅转化。

### `observable.set`

{🚀} 用法：`observable.set(initialSet?, options?)`

根据提供的 `initialSet` 创建一个新的可观察的 [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)。每当你想创建一个动态集合，并需要观察值的添加和删除，但每个值在整个集合中只能出现一次时，就可以使用它。

如果 Set 中的值不能被自动转化为 observable，则可使用 `{ deep: false }` 选项对该 Set 进行浅转化。

### `observable.ref`

[**用法**](observable-state.md#可用的注解)：`observable.ref`_（注解）_

和 `observable` 注解类似，但只会追踪重新赋值。所赋的值本身并不会被自动转化为 observable。比如你可以在你要把不可变的数据储存在一个可观察字段中时使用它。

### `observable.shallow`

[**用法**](observable-state.md#可用的注解)：`observable.shallow`_（注解）_

和 `observable.ref` 注解类似，但它是用在集合上的。所赋的所有集合都会被转为 observable，但是集合本身的内容不会变为 observable。

### `observable.struct`

{🚀} [**用法**](observable-state.md#可用的注解)：`observable.struct`_（注解）_

忽略所赋的值中所有在结构上与当前值相等的值，除此之外和 `observable` 注解类似。

### `observable.deep`

{🚀} [**用法**](observable-state.md#可用的注解)：`observable.deep`_（注解）_

[`observable`](#observable) 注解的别名。

### `observable.box`

{🚀} 用法：`observable.box(value, options?)`

JavaScript 中的所有原始值都是不可变的，所以它们当然也都是不可观察的。这一点通常没什么问题，因为 MobX 可以使包含该值的*属性*可观察。在少数情况下，如果能有独立于对象的可观察*原始值*的话会很方便。对于这种情况，可以创建一个可观察的 _box_ 来管理这种*原始值*。

`observable.box(value)` 接受任意值并将其存储在一个 box 中。当前值可以通过 `.get()` 访问到，并使用 `.set(newValue)` 进行更新。

```javascript
import { observable, autorun } from "mobx"

const cityName = observable.box("Vienna")

autorun(() => {
    console.log(cityName.get())
})
// Prints: 'Vienna'

cityName.set("Amsterdam")
// Prints: 'Amsterdam'
```

如果 box 中的值不能被自动转化为 observable，则可使用 `{ deep: false }` 对该 box 进行浅转化。

---

## Actions

_Action 就是任何一段修改状态的代码。_

### `action`

[**用法**](actions.md)：`action(fn)` 或 `action`_(注解)_

用于会修改状态的函数。

### `runInAction`

{🚀} [**用法**](actions.md#runinaction)：`runInAction(fn)`

创建一个立即被调用的一次性 action。

### `flow`

[**用法**](actions.md#使用-flow-代替-async--await-)：`flow(fn)`or`flow`_（注解）_

对 MobX 友好的 `async`/`await` 替代品，支持取消。

### `flowResult`

[**用法**](actions.md#使用-flow-代替-async--await-)：`flowResult(flowFunctionResult)`

仅供 TypeScript 用户使用。将 generator 的输出结果转化为 promise 的实用程序。这只是一个针对 `flow` 做的 promise 包装所进行的类型上的更正。它在运行时会直接返回被输入的值。

---

## 计算值

_计算值可以用来从其他 observables 中派生出数据。_

### `computed`

[**用法**](computeds.md)：`computed(fn, options?)` 或 `computed(options?)`_（注解）_

创建一个从其他 observables 中派生出来的可观察值。但只要底层 observables 不变，这个值就不会被重新计算。

## 与 React 的整合

_来自 `mobx-react` 或 `mobx-react-lite` 包。_

### `observer`

[**用法**](react-integration.md)：`observer(component)`

可以用来使一个函数式或基于类的 React 组件在 observables 发生改变时重新渲染的高阶组件。

### `Observer`

[**用法**](react-integration.md#回调组件可能需要观察者)：`<Observer>{() => rendering}</Observer>`

渲染被传入的 render 函数，并在 render 函数使用的 observables 之一发生改变时将其重新渲染。

### `useLocalObservable`

[**用法**](react-integration.md#在观察者组件中使用局部可观察状态)：`useLocalObservable(() => source, annotations?)`

使用 `makeObservable` 创建一个新的可观察对象，并在组件的整个生命周期内将其保留在组件中。

## Reactions

_Reactions 用来对自动发生的副作用进行建模。_

### `autorun`

[**用法**](reactions.md#autorun)：`autorun(() => effect, options?)`

每当其观察的任意一个值发生改变时重新执行一个函数。

### `reaction`

[**用法**](reactions.md#reaction)：`reaction(() => data, data => effect, options?)`

当任何一个被选中的数据发生改变时重新执行一个副作用。

### `when`

[**用法**](reactions.md#when)：`when(() => condition, () => effect, options?)` 或 `await when(() => condition, options?)`

在一个可观察条件变为真时将一个副作用执行一次。

---

## 实用程序

_这些实用程序可能会使得对可观察对象或计算值的处理更加方便。你在 [mobx-utils](https://github.com/mobxjs/mobx-utils) 包中也可以找到更复杂的实用程序。_

### `onReactionError`

{🚀} 用法：`onReactionError(handler: (error: any, derivation) => void)`

绑定一个全局错误监听函数，每当一个 _reaction_ 抛出错误时都会调用该监听函数。可以用于监控或测试。

### `intercept`

{🚀} [**用法**](intercept-and-observe.md#intercept)：`intercept(propertyName|array|object|Set|Map, listener)`

在一个可观察的 API 发生改变之前将变化拦截。返回一个阻止拦截的处置函数。

### `observe`

{🚀} [**用法**](intercept-and-observe.md#observe)：`observe(propertyName|array|object|Set|Map, listener)`

可用于观察单个可观察值的底层 API。返回一个阻止拦截的处置函数。

### `onBecomeObserved`

{🚀} [**用法**](lazy-observables.md)：`onBecomeObserved(observable, property?, listener: () => void)`

在某个值开始被监控时使用的钩子函数。

### `onBecomeUnobserved`

{🚀} [**用法**](lazy-observables.md)：`onBecomeUnobserved(observable, property?, listener: () => void)`

在某个值停止被监控时使用的钩子函数。

### `toJS`

[**用法**](observable-state.md#把-observables-转化回原生JavaScript集合)：`toJS(value)`

将一个可观察对象递归转化为一种 JavaScript _数据结构_。支持可观察数组、对象、Maps 和原始值。
对于更加复杂的（反）序列化使用场景，建议为类添加一个（计算）方法 `toJSON`，或者使用一个类似 [serializr](https://github.com/mobxjs/serializr) 的序列化库。

```javascript
const obj = mobx.observable({
    x: 1
})

const clone = mobx.toJS(obj)

console.log(mobx.isObservableObject(obj)) // true
console.log(mobx.isObservableObject(clone)) // false
```

---

## 配置

_对你的 MobX 实例进行微调。_

### `configure`

[**用法**](configuration.md)：对正在使用的 MobX 实例进行全局行为设置。用它来改变 MobX 整体的行为方式。

---

## 用于集合的实用程序 {🚀}

_这些实用程序可以让我们用同一个通用 API 对可观察数组、对象和 Maps 进行处理。这一点在没有 `Proxy` 支持的环境中很有用。_

### `values`

{🚀} [**用法**](collection-utilities.md)：`values(array|object|Set|Map)`

以数组形式返回集合中的所有值。

### `keys`

{🚀} [**用法**](collection-utilities.md)：`keys(array|object|Set|Map)`

以数组形式返回集合中所有的键或索引。

### `entries`

{🚀} [**用法**](collection-utilities.md)：`entries(array|object|Set|Map)`

以数组形式返回集合中每个条目的 `[key, value]` 对。

### `set`

{🚀} [**用法**](collection-utilities.md)：`set(array|object|Map, key, value)`

更新集合。

### `remove`

{🚀} [**用法**](collection-utilities.md)：`remove(array|object|Map, key)`

从集合中删除项目。

### `has`

{🚀} [**用法**](collection-utilities.md)：`has(array|object|Map, key)`

检查集合中是否存在 `key`。

### `get`

{🚀} [**用法**](collection-utilities.md)：`get(array|object|Map, key)`

使用键从集合中获取值。

## 用于检查的实用程序 {🚀}

_如果你想检查 MobX 的内部状态或者想在 MobX 的基础上打造酷炫的工具，这些实用程序可能会派上用场。_

### `isObservable`

{🚀} 用法：`isObservable(array|object|Set|Map)`

该对象或集合有没有被 MobX 转为 observable?

### `isObservableProp`

{🚀} 用法：`isObservableProp(object, propertyName)`

该属性是否是可观察的？

### `isObservableArray`

{🚀} 用法：`isObservableArray(array)`

该值是否是一个可观察数组？

### `isObservableObject`

{🚀} 用法：`isObservableObject(object)`

该值是否是一个可观察对象？

### `isObservableSet`

{🚀} 用法：`isObservableSet(set)`

该值是否是一个可观察 Set？

### `isObservableMap`

{🚀} 用法：`isObservableMap(map)`

该值是否是一个可观察 Map？

### `isBoxedObservable`

{🚀} 用法：`isBoxedObservable(value)`

该值是否是一个用 `observable.box` 创建的可观察 box？

### `isAction`

{🚀} 用法：`isAction(func)`

该函数是否被标记为 `action`？

### `isComputed`

{🚀} 用法：`isComputed(boxedComputed)`

该值是否是一个用 `computed(() => expr)` 创建的 box 计算值？

### `isComputedProp`

{🚀} 用法：`isComputedProp(object, propertyName)`

这是不是一个计算属性？

### `trace`

{🚀} [**用法**](analyzing-reactivity.md)：`trace()`, `trace(true)` _(enter debugger)_ 或 `trace(object, propertyName, enterDebugger?)`

应在 observer 、 action 或计算值中使用。在被传入的 derivation 失效时打印日志，或者用 _true_ 调用这个方法来设置调试器断点。

### `spy`

{🚀} [**用法**](analyzing-reactivity.md#spy)：`spy(eventListener)`

注册一个全局 spy 监听函数，该函数会监听所有在 MobX 内部发生的事件。

### `getDebugName`

{🚀} [**用法**](analyzing-reactivity.md#getdebugname)：`getDebugName(reaction|array|Set|Map)` 或 `getDebugName(object|Map, propertyName)`

为一个 observable 或 reaction 返回其（被生成出来的）友好的调试名称。

### `getDependencyTree`

{🚀} [**用法**](analyzing-reactivity.md#getdependencytree)：`getDependencyTree(object, computedPropertyName)`

返回一个树形结构，其中包含被传入的 reaction 或计算值当前依赖的所有 observable。

### `getObserverTree`

{🚀} [**用法**](analyzing-reactivity.md#getobservertree)：`getObserverTree(array|Set|Map)` 或 `getObserverTree(object|Map, propertyName)`

返回一个树形结构，其中包含正在观察给定 observable 的所有 reactions 或计算值。

---

## 扩展 MobX {🚀}

_少数情况下，你会想要扩展 MobX 本身。_

### `createAtom`

{🚀} [**用法**](custom-observables.md)：`createAtom(name, onBecomeObserved?, onBecomeUnobserved?)`

创建你自己的可观察数据结构并将其接入 MobX。 所有可观察的数据类型内部都使用了该方法。 Atom 暴露了两个 _report_ 方法，用来在以下情况下对 MobX 进行通知：

-   `reportObserved()`：该 atom 已经开始被观察，并且应被视为由当前 derivation 的依赖所组成的树状结构的一部分。
-   `reportChanged()`: 该 atom 已经改变，并且依赖于它的所有 derivations 都应作废。

### `getAtom`

{🚀} [**用法**](analyzing-reactivity.md#getatom)：`getAtom(thing, property?)`

返回 observable 背后的 atom。

### `transaction`

{🚀} 用法：`transaction(worker: () => any)`

_Transaction 是底层 API. 建议改用 [`action`](#action) 或 [`runInAction`](#runinaction)。_

用于批处理多个更新，直到该 transaction 结束时再通知所有 observers。 跟 [`untracked`](#untracked) 一样，transaction 会被 `action` 自动执行，所以通常情况下，使用 actions 会比直接使用 `transaction` 更加合理。

它只接受一个没有形参的 `worker` 函数作为实参，并返回其返回的任何值。请注意 `transaction` 是完全同步执行的并且可以被嵌套。只有最外层的 `transaction` 完成之后，等待它的 reactions 才会被执行。

```javascript
import { observable, transaction, autorun } from "mobx"

const numbers = observable([])

autorun(() => console.log(numbers.length, "numbers!"))
// Prints: '0 numbers!'

transaction(() => {
    transaction(() => {
        numbers.push(1)
        numbers.push(2)
    })
    numbers.push(3)
})
// Prints: '3 numbers!'
```

### `untracked`

{🚀} 用法：`untracked(worker: () => any)`

_Untracked 是底层 API。 推荐改用 [`reaction`](#reaction) 、 [`action`](#action) 或 [`runInAction`](#runinaction)。_

在不设置 observers 的情况下执行一段代码。跟 `transaction` 一样，`untracked` 会被 `action` 自动执行，所以通常情况下，使用 actions 会比直接使用 `untracked` 更加合理。

```javascript
const person = observable({
    firstName: "Michel",
    lastName: "Weststrate"
})

autorun(() => {
    console.log(
        person.lastName,
        ",",
        // This untracked block will return the person's
        // firstName without establishing a dependency.
        untracked(() => person.firstName)
    )
})
// Prints: 'Weststrate, Michel'

person.firstName = "G.K."
// Doesn't print!

person.lastName = "Chesterton"
// Prints: 'Chesterton, G.K.'
```
