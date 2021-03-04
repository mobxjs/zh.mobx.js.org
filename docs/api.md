---
title: MobX API Reference
sidebar_label: MobX API Reference
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# MobX API 参考

用 {🚀} 标记的函数是进阶概念，通常不需要使用。
请考虑下载我们的小抄，它用一页纸解释了所有重要的 API:

<div class="cheat"><a href="https://gum.co/fSocU"><button title="Download the MobX 6 cheat sheet and sponsor the project">下载 MobX 6 小抄</button></a></div>

## 核心 API

_这些是 MobX 中最重要的 API。_

> 理解 [`observable`](#observable), [`computed`](#computed), [`reaction`](#reaction) 和 [`action`](#action) 就足够你掌握 MobX 并在你的应用中使用它了！

## 创建 observables (可观察对象)

_把事物变得可观察。_

### `makeObservable`

[**用法**](observable-state.md#makeobservable): `makeObservable(target, annotations?, options?)`

属性、完整的对象、数组、Maps 和 Sets 都可以被变得可观察。

### `makeAutoObservable`

[**用法**](observable-state.md#makeautoobservable): `makeAutoObservable(target, overrides?, options?)`

自动使属性、对象、数组、Maps 和 Sets 可观察。

### `extendObservable`

{🚀} 用法: `extendObservable(target, properties, overrides?, options?)`

可用于在 `target` 对象上引入新属性并立即使它们可观察。 基本上也就是 `Object.assign(target, properties); makeAutoObservable(target, overrides, options);` 的简写。 但不会动 `target` 上已有的属性。

老式的构造器函数可以很好地跟 `extendObservable` 结合使用:

```javascript
function Person(firstName, lastName) {
  extendObservable(this, { firstName, lastName });
}

const person = new Person("Michel", "Weststrate");
```

在一个对象实例化之后使用 `extendObservable` 在该对象上添加可观察字段也是可以的，但要注意，以这种方式添加可观察属性，这一行为本身并不能被观察到。

### `observable`

[**用法**](observable-state.md#observable): `observable(source, overrides?, options?)` 或 `observable` _(annotation)_

克隆一个对象并使其可观察。`source` 可以是一个普通的对象、数组、 Map 或 Set 。默认情况下， `observable` 会递归运行。如果遇到的值中有一个是对象或数组，那么那个值也会被传入 `observable` 。

### `observable.object`

{🚀} [**用法**](observable-state.md#observable): `observable.object(source, overrides?, options?)`

`observable(source, overrides?, options?)` 的另一种写法。创建一个被传入对象的副本并它的所有属性可观察。

### `observable.array`

{🚀} 用法: `observable.array(initialValues?, options?)`

根据被所提供的 `initialValues` 创建一个新的可观察的数组。
如果要把可观察的数组转化回普通数组，就请使用 `.slice()` 方法，或者参阅 [toJS](#tojs) 进行递归转化。
除了语言中内置的所有数组方法之外，可观察的数组还提供了以下好东西供你使用：

-   `clear()` 删除数组中所有现存的元素。
-   `replace(newItems)` 用新元素替换数组中所有现存的元素。
-   `remove(value)` 从数组中删除一个值为 `value` 的元素，在找到并删除该元素后返回 `true`.

如果数组中的值不能被自动转化为 observable ，则可使用 `{ deep: false }` 选项对该数组进行浅转化。

### `observable.map`

{🚀} Usage: `observable.map(initialMap?, options?)`

根据所提供的 `initialMap` 创建一个新的可观察的 [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 。
如果你想不只对特定值的改变作出反应，还想对它们的添加和删除做出反应，那么它们就会非常有用。
如果你没有[启用代理](configuration.md#proxy-support)，那么创建可观察的 Maps 是创建动态键控集合的推荐方法。

除了语言内置的所有 Map 方法之外，可观察的 Maps 还提供了以下好东西供你使用：

-   `toJSON()` 返回该 Map 的浅层纯对象表示（使用 [toJS](#tojs) 进行深拷贝）。
-   `merge(values)` 将所提供的`values` (普通对象、数组或以字符串为键的 ES6 Map )的所有条目复制到该地图中。
-   `replace(values)` 用所提供的 `values` 替换该 Map 的全部内容。

如果 Map 中的值不能被自动转化为 observable ，则可使用 `{ deep: false }` 选项对该 Map 进行浅转化。

### `observable.set`

{🚀} Usage: `observable.set(initialSet?, options?)`

Creates a new observable [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) based on the provided `initialSet`. Use it whenever you want to create a dynamic set where the addition and removal of values needs to be observed, but where values can appear only once in the entire collection.

If the values in the Set should not be turned into observables automatically, use the `{ deep: false }` option to make the Set shallowly observable.

### `observable.ref`

[**Usage**](observable-state.md#available-annotations): `observable.ref` _(annotation)_

Like the `observable` annotation, but only reassignments will be tracked. The assigned values themselves won't be made observable automatically. For example, use this if you intend to store immutable data in an observable field.

### `observable.shallow`

[**Usage**](observable-state.md#available-annotations): `observable.shallow` _(annotation)_

Like the `observable.ref` annotation, but for collections. Any collection assigned will be made observable, but the contents of the collection itself won't become observable.

### `observable.struct`

{🚀} [**Usage**](observable-state.md#available-annotations): `observable.struct` _(annotation)_

Like the `observable` annotation, except that any assigned value that is structurally equal to the current value will be ignored.

### `observable.deep`

{🚀} [**Usage**](observable-state.md#available-annotations): `observable.deep` _(annotation)_

Alias for the [`observable`](#observable) annotation.

### `observable.box`

{🚀} Usage: `observable.box(value, options?)`

All primitive values in JavaScript are immutable and hence per definition not observable.
Usually that is fine, as MobX can just make the _property_ that contains the value observable.
In rare cases, it can be convenient to have an observable _primitive_ that is not owned by an object.
For such cases, it is possible to create an observable _box_ that manages such a _primitive_.

`observable.box(value)` accepts any value and stores it inside a box. The current value can be accessed through `.get()` and updated using `.set(newValue)`.

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

If the values in the box should not be turned into observables automatically, use the `{ deep: false }` option to make the box shallowly observable.

---

## Actions

_An action is any piece of code that modifies the state._

### `action`

[**Usage**](actions.md): `action(fn)` or `action` _(annotation)_

Use on functions that intend to modify the state.

### `runInAction`

{🚀} [**Usage**](actions.md#runinaction): `runInAction(fn)`

Create a one-time action that is immediately invoked.

### `flow`

[**Usage**](actions.md#using-flow-instead-of-async--await-): `flow(fn)` or `flow` _(annotation)_

MobX friendly replacement for `async` / `await` that supports cancellation.

### `flowResult`

[**Usage**](actions.md#using-flow-instead-of-async--await-): `flowResult(flowFunctionResult)`

For TypeScript users only. Utility that casts the output of the generator to a promise.
This is just a type-wise correction for the promise wrapping done by `flow`. At runtime it directly returns the inputted value.

---

## Computeds

_Computed values can be used to derive information from other observables._

### `computed`

[**Usage**](computeds.md): `computed(fn, options?)` or `computed(options?)` _(annotation)_

Creates an observable value that is derived from other observables, but won't be recomputed unless one of the underlying observables changes.

---

## React integration

_From the `mobx-react` / `mobx-react-lite` packages._

### `observer`

[**Usage**](react-integration.md): `observer(component)`

A higher order component you can use to make a functional or class based React component re-render when observables change.

### `Observer`

[**Usage**](react-integration.md#callback-components-might-require-observer): `<Observer>{() => rendering}</Observer>`

Renders the given render function, and automatically re-renders it once one of the observables used in the render function changes.

### `useLocalObservable`

[**Usage**](react-integration.md#using-local-observable-state-in-observer-components): `useLocalObservable(() => source, annotations?)`

Creates a new observable object using `makeObservable`, and keeps it around in the component for the entire life-cycle of the component.

---

## Reactions

_The goal of reactions is to model side effects that happen automatically._

### `autorun`

[**Usage**](reactions.md#autorun): `autorun(() => effect, options?)`

Reruns a function every time anything it observes changes.

### `reaction`

[**Usage**](reactions.md#reaction): `reaction(() => data, data => effect, options?)`

Reruns a side effect when any selected data changes.

### `when`

[**Usage**](reactions.md#when): `when(() => condition, () => effect, options?)` or `await when(() => condition, options?)`

Executes a side effect once when a observable condition becomes true.

---

## Utilities

_Utilities that might make working with observable objects or computed values more convenient. Less trivial utilities can also be found in the [mobx-utils](https://github.com/mobxjs/mobx-utils) package._

### `onReactionError`

{🚀} Usage: `onReactionError(handler: (error: any, derivation) => void)`

Attaches a global error listener, which is invoked for every error that is thrown from a _reaction_. This can be used for monitoring or test purposes.

### `intercept`

{🚀} [**Usage**](intercept-and-observe.md#intercept): `intercept(propertyName|array|object|Set|Map, listener)`

Intercepts changes before they are applied to an observable API. Returns a disposer function that stops the interception.

### `observe`

{🚀} [**Usage**](intercept-and-observe.md#observe): `observe(propertyName|array|object|Set|Map, listener)`

Low-level API that can be used to observe a single observable value. Returns a disposer function that stops the interception.

### `onBecomeObserved`

{🚀} [**Usage**](lazy-observables.md): `onBecomeObserved(observable, property?, listener: () => void)`

Hook for when something becomes observed.

### `onBecomeUnobserved`

{🚀} [**Usage**](lazy-observables.md): `onBecomeUnobserved(observable, property?, listener: () => void)`

Hook for when something stops being observed.

### `toJS`

[**Usage**](observable-state.md#converting-observables-back-to-vanilla-javascript-collections): `toJS(value)`

Recursively converts an observable object to a JavaScript _structure_. Supports observable arrays, objects, Maps and primitives.
Computed values and other non-enumerable properties won't be part of the result.
For more complex (de)serialization scenarios, it is recommended to give classes a (computed) `toJSON` method, or use a serialization library like [serializr](https://github.com/mobxjs/serializr).

```javascript
const obj = mobx.observable({
    x: 1
})

const clone = mobx.toJS(obj)

console.log(mobx.isObservableObject(obj)) // true
console.log(mobx.isObservableObject(clone)) // false
```

---

## Configuration

_Fine-tuning your MobX instance._

### `configure`

[**Usage**](configuration.md): sets global behavior settings on the active MobX instance.
Use it to change how MobX behaves as a whole.

---

## Collection utilities {🚀}

_They enable manipulating observable arrays, objects and Maps with the same generic API. This can be useful in [environments without `Proxy` support](configuration.md#limitations-without-proxy-support), but is otherwise typically not needed._

### `values`

{🚀} [**Usage**](collection-utilities.md): `values(array|object|Set|Map)`

Returns all values in the collection as an array.

### `keys`

{🚀} [**Usage**](collection-utilities.md): `keys(array|object|Set|Map)`

Returns all keys / indices in the collection as an array.

### `entries`

{🚀} [**Usage**](collection-utilities.md): `entries(array|object|Set|Map)`

Returns a `[key, value]` pair of every entry in the collection as an array.

### `set`

{🚀} [**Usage**](collection-utilities.md): `set(array|object|Map, key, value)`

Updates the collection.

### `remove`

{🚀} [**Usage**](collection-utilities.md): `remove(array|object|Map, key)`

Removes item from the collection.

### `has`

{🚀} [**Usage**](collection-utilities.md): `has(array|object|Map, key)`

Checks for membership in the collection.

### `get`

{🚀} [**Usage**](collection-utilities.md): `get(array|object|Map, key)`

Gets value from the collection with key.

---

## Introspection utilities {🚀}

_Utilities that might come in handy if you want to inspect the internal state of MobX, or want to build cool tools on top of MobX._

### `isObservable`

{🚀} Usage: `isObservable(array|object|Set|Map)`

Is the object / collection made observable by MobX?

### `isObservableProp`

{🚀} Usage: `isObservableProp(object, propertyName)`

Is the property observable?

### `isObservableArray`

{🚀} Usage: `isObservableArray(array)`

Is the value an observable array?

### `isObservableObject`

{🚀} Usage: `isObservableObject(object)`

Is the value an observable object?

### `isObservableSet`

{🚀} Usage: `isObservableSet(set)`

Is the value an observable Set?

### `isObservableMap`

{🚀} Usage: `isObservableMap(map)`

Is the value an observable Map?

### `isBoxedObservable`

{🚀} Usage: `isBoxedObservable(value)`

Is the value an observable box, created using `observable.box`?

### `isAction`

{🚀} Usage: `isAction(func)`

Is the function marked as an `action`?

### `isComputed`

{🚀} Usage: `isComputed(boxedComputed)`

Is this a boxed computed value, created using `computed(() => expr)`?

### `isComputedProp`

{🚀} Usage: `isComputedProp(object, propertyName)`

Is this a computed property?

### `trace`

{🚀} [**Usage**](analyzing-reactivity.md): `trace()`, `trace(true)` _(enter debugger)_ or `trace(object, propertyName, enterDebugger?)`

Should be used inside an observer, reaction or computed value. Logs when the value is invalidated, or sets the debugger breakpoint if called with _true_.

### `spy`

{🚀} [**Usage**](analyzing-reactivity.md#spy): `spy(eventListener)`

Registers a global spy listener that listens to all events that happen in MobX.

### `getDebugName`

{🚀} [**Usage**](analyzing-reactivity.md#getdebugname): `getDebugName(reaction|array|Set|Map)` or `getDebugName(object|Map, propertyName)`

Returns the (generated) friendly debug name for an observable or reaction.

### `getDependencyTree`

{🚀} [**Usage**](analyzing-reactivity.md#getdependencytree): `getDependencyTree(object, computedPropertyName)`

Returns a tree structure with all observables the given reaction / computation currently depends upon.

### `getObserverTree`

{🚀} [**Usage**](analyzing-reactivity.md#getobservertree): `getObserverTree(array|Set|Map)` or `getObserverTree(object|Map, propertyName)`

Returns a tree structure with all reactions / computations that are observing the given observable.

---

## Extending MobX {🚀}

_In the rare case you want to extend MobX itself._

### `createAtom`

{🚀} [**Usage**](custom-observables.md): `createAtom(name, onBecomeObserved?, onBecomeUnobserved?)`

Creates your own observable data structure and hooks it up to MobX. Used internally by all observable data types. Atom exposes two _report_ methods to notify MobX with when:

-   `reportObserved()`: the atom has become observed, and should be considered part of the dependency tree of the current derivation.
-   `reportChanged()`: the atom has changed, and all derivations depending on it should be invalidated.

### `getAtom`

{🚀} [**Usage**](analyzing-reactivity.md#getatom): `getAtom(thing, property?)`

Returns the backing atom.

### `transaction`

{🚀} Usage: `transaction(worker: () => any)`

_Transaction is a low-level API. It is recommended to use [`action`](#action) or [`runInAction`](#runinaction) instead._

Used to batch a bunch of updates without notifying any observers until the end of the transaction. Like [`untracked`](#untracked), it is automatically applied by `action`, so usually it makes more sense to use actions than to use `transaction` directly.

It takes a single, parameterless `worker` function as an argument, and returns any value that was returned by it.
Note that `transaction` runs completely synchronously and can be nested. Only after completing the outermost `transaction`, the pending reactions will be run.

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

{🚀} Usage: `untracked(worker: () => any)`

_Untracked is a low-level API. It is recommended to use [`reaction`](#reaction), [`action`](#action) or [`runInAction`](#runinaction) instead._

Runs a piece of code without establishing observers. Like `transaction`, `untracked` is automatically applied by `action`, so usually it makes more sense to use actions than to use `untracked` directly.

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
