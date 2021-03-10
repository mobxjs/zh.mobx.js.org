---
title: MobX API 参考
sidebar_label: MobX API 参考
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# MobX API 参考

用 {🚀} 标记的函数是进阶部分，通常不需要使用。
请考虑下载我们的速查表，它用一页篇幅解释了所有重要的 API:

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

可用于在`target`对象上引入新属性并立即把它们全都变得可观察。基本上就是`Object.assign(target, properties); makeAutoObservable(target, overrides, options);`的简写。但它不会变动`target`上已有的属性。

老式的构造器函数可以很好跟`extendObservable`结合起来使用:

```javascript
function Person(firstName, lastName) {
  extendObservable(this, { firstName, lastName });
}

const person = new Person('Michel', 'Weststrate');
```

使用`extendObservable`在一个对象实例化之后再为其添加可观察字段也是可以的，但要注意，以这种方式添加可观察属性这一行为本身并不能被观察到。

### `observable`

[**用法**](observable-state.md#observable)：`observable(source, overrides?, options?)`或`observable`_（注解）_

克隆一个对象并使其可观察。`source`可以是一个普通的对象、数组、Map 或 Set。默认情况下，`observable`会被递归调用。如果遇到的值中有一个是对象或数组，那么那个值也会被传入`observable`。

### `observable.object`

{🚀} [**用法**](observable-state.md#observable)：`observable.object(source, overrides?, options?)`

`observable(source, overrides?, options?)`的别名。创建一个被传入对象的副本并使它的所有属性可观察。

### `observable.array`

{🚀} 用法：`observable.array(initialValues?, options?)`

根据被传入的`initialValues`创建一个新的可观察的数组。
如果要把可观察的数组转化回普通的数组，就请使用`.slice()`方法，或者参阅 [toJS](#tojs) 进行递归转化。
除了语言中内置的所有数组方法之外，可观察的数组中还有以下好东西可用：

- `clear()` 删除数组中所有现存的元素。
- `replace(newItems)` 用新元素替换数组中所有现存的元素。
- `remove(value)` 从数组中删除一个值为`value`的元素，在找到并删除该元素后返回`true`。

如果数组中的值不能被自动转化为 observable，则可使用`{ deep: false }`选项对该数组进行浅转化。

### `observable.map`

{🚀} 用法：`observable.map(initialMap?, options?)`

根据被传入的`initialMap`创建一个新的可观察的 [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)。
如果你不仅想对特定值的改变作出反应，还想对其添加和删除做出反应的话，那么它们就会变得非常有用。
如果你没有[启用代理](configuration.md#代理支持)，那么推荐你使用创建可观察的 Maps 的方式来创建动态键控集合。

除了语言内置的所有 Map 方法之外，可观察的 Maps 中还有以下好东西可用：

- `toJSON()`返回该 Map 的浅层纯对象表示（使用 [toJS](#tojs) 进行深拷贝）。
- `merge(values)`将被传入的`values`(普通的对象、数组或以字符串为键的 ES6 Map )的所有条目复制到该 Map 中。
- `replace(values)`用被传入的`values`替换该 Map 的全部内容。

如果 Map 中的值不能被自动转化为 observable，则可使用`{ deep: false }`选项对该 Map 进行浅转化。

### `observable.set`

{🚀} 用法：`observable.set(initialSet?, options?)`

根据提供的`initialSet`创建一个新的可观察的 [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)。每当你想创建一个动态集合，并需要观察值的添加和删除，但每个值在整个集合中只能出现一次时，就可以使用它。

如果 Set 中的值不能被自动转化为 observable，则可使用`{ deep: false }`选项对该 Set 进行浅转化。

### `observable.ref`

[**用法**](observable-state.md#可用的注解)：`observable.ref`_（注解）_

和`observable`注解类似，但只会追踪重新赋值。所赋的值本身并不会被自动转化为 observable。比如你可以在想要在一个可观察字段中储存不可变数据时使用它。

### `observable.shallow`

[**用法**](observable-state.md#可用的注解)：`observable.shallow`_（注解）_

和`observable.ref`注解类似，但它是用于集合的。所赋的所有集合都会被转为 observable，但是集合本身的内容不会变为 observable。

### `observable.struct`

{🚀} [**用法**](observable-state.md#可用的注解)：`observable.struct`_（注解）_

除了会忽略所赋的值中所有在结构上与当前值相等的值之外，其他方面都和`observable`注解类似。

### `observable.deep`

{🚀} [**用法**](observable-state.md#可用的注解)：`observable.deep`_（注解）_

[`observable`](#observable) 注解的别名。

### `observable.box`

{🚀} 用法：`observable.box(value, options?)`

JavaScript 中的所有原始值都是不可变的，因而它们当然也都是不可观察的。
这一点通常没问题，因为 MobX 可以使包含该值的 _属性_ 变成 observable。
在少数情况下，如果能有不属于对象的可观察的 _原始值_ 的话会很方便。
对于这种情况，可以创建一个可观察的 _box_ 来管理这种 _原始值_。

`observable.box(value)`接受任意值并将其存储在一个 box 中。当前值可以通过`.get()`访问到，并使用`.set(newValue)`进行更新。

```javascript
import { observable, autorun } from 'mobx';

const cityName = observable.box('Vienna');

autorun(() => {
  console.log(cityName.get());
});
// Prints: 'Vienna'

cityName.set('Amsterdam');
// Prints: 'Amsterdam'
```

如果 box 中的值不能被自动转化为 observable，则可使用`{ deep: false }`对该 box 进行浅转化。

---

## Actions

_Action 就是任何一段修改状态的代码。_

### `action`

[**用法**](actions.md)：`action(fn)`或`action`_(注解)_

在打算修改状态的函数上使用。

### `runInAction`

{🚀} [**用法**](actions.md#runinaction)：`runInAction(fn)`

创建一个立即被调用的一次性 action。

### `flow`

[**用法**](actions.md#使用-flow-代替-async--await-)：`flow(fn)`or`flow`_（注解）_

对 MobX 友好的`async`/`await`替代品，支持取消。

### `flowResult`

[**用法**](actions.md#使用-flow-代替-async--await-)：`flowResult(flowFunctionResult)`

This is just a type-wise correction for the promise wrapping done by `flow`. At runtime it directly returns the inputted value.
仅供 TypeScript 用户使用。将 generator 的输出结果转化为 promise 的实用程序。
这只是一个对于`flow`所做的 promise 包装进行的类型上的更正。它在运行时会直接返回被输入的值。

---

## 计算值

_计算值可以用来从其他 observables 中派生出数据。_

### `computed`

[**用法**](computeds.md)：`computed(fn, options?)`or `computed(options?)`_（注解）_

创建一个从其他 observables 中派生出来的可观察值。但只要底层 observables 不变，就这个值就不会被重新计算。

## 与 React 的整合

_来自`mobx-react`或`mobx-react-lite`包。_

### `observer`

[**用法**](react-integration.md)：`observer(component)`

一个高阶组件，你可以用它来使一个函数式或基于类的 React 组件在 observables 发生改变时重新渲染。

### `Observer`

[**用法**](react-integration.md#回调组件可能需要观察者)：`<Observer>{() => rendering}</Observer>`

渲染被传入的 render 函数，并在 render 函数使用的 observables 之一发生改变时将其重新渲染。

### `useLocalObservable`

[**用法**](react-integration.md#在观察者组件中使用局部可观察状态)：`useLocalObservable(() => source, annotations?)`

用`makeObservable`创建一个新的可观察对象

---

## Reactions

_The goal of reactions is to model side effects that happen automatically._

### `autorun`

[**用法**](reactions.md#autorun)：`autorun(() => effect, options?)`

Reruns a function every time anything it observes changes.

### `reaction`

[**用法**](reactions.md#reaction)：`reaction(() => data, data => effect, options?)`

Reruns a side effect when any selected data changes.

### `when`

[**用法**](reactions.md#when)：`when(() => condition, () => effect, options?)` or `await when(() => condition, options?)`

Executes a side effect once when a observable condition becomes true.

---

## Utilities

_Utilities that might make working with observable objects or computed values more convenient. Less trivial utilities can also be found in the [mobx-utils](https://github.com/mobxjs/mobx-utils) package._

### `onReactionError`

{🚀} 用法：`onReactionError(handler: (error: any, derivation) => void)`

Attaches a global error listener, which is invoked for every error that is thrown from a _reaction_. This can be used for monitoring or test purposes.

### `intercept`

{🚀} [**用法**](intercept-and-observe.md#intercept)：`intercept(propertyName|array|object|Set|Map, listener)`

Intercepts changes before they are applied to an observable API. Returns a disposer function that stops the interception.

### `observe`

{🚀} [**用法**](intercept-and-observe.md#observe)：`observe(propertyName|array|object|Set|Map, listener)`

Low-level API that can be used to observe a single observable value. Returns a disposer function that stops the interception.

### `onBecomeObserved`

{🚀} [**用法**](lazy-observables.md)：`onBecomeObserved(observable, property?, listener: () => void)`

Hook for when something becomes observed.

### `onBecomeUnobserved`

{🚀} [**用法**](lazy-observables.md)：`onBecomeUnobserved(observable, property?, listener: () => void)`

Hook for when something stops being observed.

### `toJS`

[**用法**](observable-state.md#把-observables-转化回原生JavaScript集合)：`toJS(value)`

Recursively converts an observable object to a JavaScript _structure_. Supports observable arrays, objects, Maps and primitives.
Computed values and other non-enumerable properties won't be part of the result.
For more complex (de)serialization scenarios, it is recommended to give classes a (computed) `toJSON` method, or use a serialization library like [serializr](https://github.com/mobxjs/serializr).

```javascript
const obj = mobx.observable({
  x: 1
});

const clone = mobx.toJS(obj);

console.log(mobx.isObservableObject(obj)); // true
console.log(mobx.isObservableObject(clone)); // false
```

---

## Configuration

_Fine-tuning your MobX instance._

### `configure`

[**用法**](configuration.md)：sets global behavior settings on the active MobX instance.
Use it to change how MobX behaves as a whole.

---

## Collection utilities {🚀}

_They enable manipulating observable arrays, objects and Maps with the same generic API. This can be useful in [environments without `Proxy` support](configuration.md#没有代理支持的限制), but is otherwise typically not needed._

### `values`

{🚀} [**用法**](collection-utilities.md)：`values(array|object|Set|Map)`

Returns all values in the collection as an array.

### `keys`

{🚀} [**用法**](collection-utilities.md)：`keys(array|object|Set|Map)`

Returns all keys / indices in the collection as an array.

### `entries`

{🚀} [**用法**](collection-utilities.md)：`entries(array|object|Set|Map)`

Returns a `[key, value]` pair of every entry in the collection as an array.

### `set`

{🚀} [**用法**](collection-utilities.md)：`set(array|object|Map, key, value)`

Updates the collection.

### `remove`

{🚀} [**用法**](collection-utilities.md)：`remove(array|object|Map, key)`

Removes item from the collection.

### `has`

{🚀} [**用法**](collection-utilities.md)：`has(array|object|Map, key)`

Checks for membership in the collection.

### `get`

{🚀} [**用法**](collection-utilities.md)：`get(array|object|Map, key)`

Gets value from the collection with key.

---

## Introspection utilities {🚀}

_Utilities that might come in handy if you want to inspect the internal state of MobX, or want to build cool tools on top of MobX._

### `isObservable`

{🚀} 用法：`isObservable(array|object|Set|Map)`

Is the object / collection made observable by MobX?

### `isObservableProp`

{🚀} 用法：`isObservableProp(object, propertyName)`

Is the property observable?

### `isObservableArray`

{🚀} 用法：`isObservableArray(array)`

Is the value an observable array?

### `isObservableObject`

{🚀} 用法：`isObservableObject(object)`

Is the value an observable object?

### `isObservableSet`

{🚀} 用法：`isObservableSet(set)`

Is the value an observable Set?

### `isObservableMap`

{🚀} 用法：`isObservableMap(map)`

Is the value an observable Map?

### `isBoxedObservable`

{🚀} 用法：`isBoxedObservable(value)`

Is the value an observable box, created using `observable.box`?

### `isAction`

{🚀} 用法：`isAction(func)`

Is the function marked as an `action`?

### `isComputed`

{🚀} 用法：`isComputed(boxedComputed)`

Is this a boxed computed value, created using `computed(() => expr)`?

### `isComputedProp`

{🚀} 用法：`isComputedProp(object, propertyName)`

Is this a computed property?

### `trace`

{🚀} [**用法**](analyzing-reactivity.md)：`trace()`, `trace(true)` _(enter debugger)_ or `trace(object, propertyName, enterDebugger?)`

Should be used inside an observer, reaction or computed value. Logs when the value is invalidated, or sets the debugger breakpoint if called with _true_.

### `spy`

{🚀} [**用法**](analyzing-reactivity.md#spy)：`spy(eventListener)`

Registers a global spy listener that listens to all events that happen in MobX.

### `getDebugName`

{🚀} [**用法**](analyzing-reactivity.md#getdebugname)：`getDebugName(reaction|array|Set|Map)` or `getDebugName(object|Map, propertyName)`

Returns the (generated) friendly debug name for an observable or reaction.

### `getDependencyTree`

{🚀} [**用法**](analyzing-reactivity.md#getdependencytree)：`getDependencyTree(object, computedPropertyName)`

Returns a tree structure with all observables the given reaction / computation currently depends upon.

### `getObserverTree`

{🚀} [**用法**](analyzing-reactivity.md#getobservertree)：`getObserverTree(array|Set|Map)` or `getObserverTree(object|Map, propertyName)`

Returns a tree structure with all reactions / computations that are observing the given observable.

---

## Extending MobX {🚀}

_In the rare case you want to extend MobX itself._

### `createAtom`

{🚀} [**用法**](custom-observables.md)：`createAtom(name, onBecomeObserved?, onBecomeUnobserved?)`

Creates your own observable data structure and hooks it up to MobX. Used internally by all observable data types. Atom exposes two _report_ methods to notify MobX with when:

- `reportObserved()`: the atom has become observed, and should be considered part of the dependency tree of the current derivation.
- `reportChanged()`: the atom has changed, and all derivations depending on it should be invalidated.

### `getAtom`

{🚀} [**用法**](analyzing-reactivity.md#getatom)：`getAtom(thing, property?)`

Returns the backing atom.

### `transaction`

{🚀} 用法：`transaction(worker: () => any)`

_Transaction is a low-level API. It is recommended to use [`action`](#action) or [`runInAction`](#runinaction) instead._

Used to batch a bunch of updates without notifying any observers until the end of the transaction. Like [`untracked`](#untracked), it is automatically applied by `action`, so usually it makes more sense to use actions than to use `transaction` directly.

It takes a single, parameterless `worker` function as an argument, and returns any value that was returned by it.
Note that `transaction` runs completely synchronously and can be nested. Only after completing the outermost `transaction`, the pending reactions will be run.

```javascript
import { observable, transaction, autorun } from 'mobx';

const numbers = observable([]);

autorun(() => console.log(numbers.length, 'numbers!'));
// Prints: '0 numbers!'

transaction(() => {
  transaction(() => {
    numbers.push(1);
    numbers.push(2);
  });
  numbers.push(3);
});
// Prints: '3 numbers!'
```

### `untracked`

{🚀} 用法：`untracked(worker: () => any)`

_Untracked is a low-level API. It is recommended to use [`reaction`](#reaction), [`action`](#action) or [`runInAction`](#runinaction) instead._

Runs a piece of code without establishing observers. Like `transaction`, `untracked` is automatically applied by `action`, so usually it makes more sense to use actions than to use `untracked` directly.

```javascript
const person = observable({
  firstName: 'Michel',
  lastName: 'Weststrate'
});

autorun(() => {
  console.log(
    person.lastName,
    ',',
    // This untracked block will return the person's
    // firstName without establishing a dependency.
    untracked(() => person.firstName)
  );
});
// Prints: 'Weststrate, Michel'

person.firstName = 'G.K.';
// Doesn't print!

person.lastName = 'Chesterton';
// Prints: 'Chesterton, G.K.'
```
