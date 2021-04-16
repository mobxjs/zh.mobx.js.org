---
title: Understanding reactivity
sidebar_label: Understanding reactivity
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 理解响应性

Mobx 通常会像你所期待的那样对确定的一些事物做出响应，这意味着在 90% 的用例中 Mobx 都应该能正常工作。
但是在不确定的某个时间，你可能会遇到一些情况，Mobx 并没有在这些情况下做出你所预想的响应。
面对这些情况，理解 Mobx 如何确定要对哪些事物做出响应是十分重要的。

> MobX reacts to any _existing_ **observable** _property_ that is read during the execution of a tracked function.
> Mobx 会对跟踪函数执行时读取的任何 _存在的_ **可观测的** _属性_ 做出响应。

-   _"reading"_ is dereferencing an object's property, which can be done through "dotting into" it (eg. `user.name`) or using the bracket notation (eg. `user['name']`, `todos[3]`).
-   _“读取”_ 使用一个对象的属性, “读取”有两种方式。一种是点访问（dotting into），例如 `user.name` 。另一种是方括号访问，例如 `user['name']`、`todos[3]`。
-   _"tracked functions"_ are the expression of `computed`, the _rendering_ of an `observer` React function component, the `render()` method of an `observer` based React class component, and the functions that are passed as the first param to `autorun`, `reaction` and `when`.
-   _“跟踪函数”_ 其可以是计算的表达式、作为观察者的 React 函数式组件的渲染（rendering）、作为观察者的 React 类组件的 render 方法，也可以是作为第一个参数传递给 `autorun` 、 `reaction` 和 `when` 的函数。
-   _"during"_ means that only those observables that are read while the function is executing are tracked. It doesn't matter whether these values are used directly or indirectly by the tracked function. But things that have been 'spawned' from the function won't be tracked (e.g. `setTimeout`, `promise.then`, `await` etc).
-   _“跟踪函数执行时”_ 这意味着只有那些在跟踪函数执行时读取的可观察对象才会被跟踪。这些值在跟踪函数中是直接使用还是间接使用并不重要。但是从函数“引发”出来的东西将不会被跟踪（例如， `setTimeout` `promise.then`， `await` 等）。

换句话说，MobX 将不会对下面的情况做出响应：

-   Values that are obtained from observables, but outside a tracked function
-   从可观察对象中获取到，但是并没有在跟踪函数中使用的值
-   Observables that are read in an asynchronously invoked code block
-   在异步调用的代码块中读取的可观察值

## MobX tracks property access, not values

## MobX 跟踪属性的访问，而不是属性的值本身

To elaborate on the above rules with an example, suppose that you have the following observable instance:

为了用一个例子详细说明上述规则，我们假设您有以下可观察的实例：

```javascript
class Message {
    title
    author
    likes
    constructor(title, author, likes) {
        makeAutoObservable(this)
        this.title = title
        this.author = author
        this.likes = likes
    }

    updateTitle(title) {
        this.title = title
    }
}

let message = new Message("Foo", { name: "Michel" }, ["Joe", "Sara"])
```

In memory this looks as follows. The green boxes indicate _observable_ properties. Note that the _values_ themselves are not observable!

在内存中这个例子将会像下面这样，绿色的块代表的是 **可观察的** 属性，注意 **值本身** 并不是可观察的！

![MobX reacts to changing references](assets/observed-refs.png)

What MobX basically does is recording which _arrows_ you use in your function. After that, it will re-run whenever one of these _arrows_ changes; when they start to refer to something else.

简单来说，MobX 所做的就是记录下你在函数所使用的属性的箭头指向（就像上图中的箭头那样）。在此之后，当这些箭头中的任何一个发生变化（比如该箭头从一个值指向另一个值）时，MobX 都会响应变化，并重新执行相应的跟踪函数。

## Examples
## 实例

Let's show that with a bunch of examples (based on the `message` variable defined above):

让我们通过一组实例还说明上述的内容。（下面的实例还继续使用到上面定义的 `message` 变量）

#### Correct: dereference inside the tracked function

#### 正确的做法：在跟踪函数中使用某个对象的属性

```javascript
autorun(() => {
    console.log(message.title)
})
message.updateTitle("Bar")
```

This will react as expected. The `.title` property was dereferenced by the autorun, and changed afterwards, so this change is detected.

这个例子将会产生符合期待的响应。 `.title` 属性被 autorun 函数使用，并且该属性在后面发生了改变，因此这个变化会被捕捉到。

You can verify what MobX will track by calling [`trace()`](analyzing-reactivity.md) inside the tracked function. In the case of the above function it outputs the following:

你可以通过在跟踪函数中调用 [`trace()`](analyzing-reactivity.md) 来验证 MobX 进行了跟踪，在上面函数所示的情况下，它将输出以下内容：

```javascript
import { trace } from "mobx"

const disposer = autorun(() => {
    console.log(message.title)
    trace()
})
// 打印出：
// [mobx.trace] 'Autorun@2' tracing enabled

message.updateTitle("Hello")
// 打印出：
// [mobx.trace] 'Autorun@2' is invalidated due to a change in: 'Message@1.title'
Hello
```

It is also possible to get the internal dependency (or observer) tree by using `getDependencyTree`:

也可以使用 `getDependencyTree` 获取内部依赖（或观察者）树：

```javascript
import { getDependencyTree } from "mobx"

// Prints the dependency tree of the reaction coupled to the disposer.
console.log(getDependencyTree(disposer))
// Outputs:
// { name: 'Autorun@2', dependencies: [ { name: 'Message@1.title' } ] }
```

#### Incorrect: changing a non-observable reference

#### 不正确的做法：更改一个不可观察引用的值

```javascript
autorun(() => {
    console.log(message.title)
})
message = new Message("Bar", { name: "Martijn" }, ["Felicia", "Marcus"])
```

This will **not** react. `message` was changed, but `message` is not an observable, just a variable which _refers to_ an observable, but the variable (reference) itself is not observable.

这不会使 MobX 响应。`message` 发生了改变，但是 `message` 本身并不是可观察的，它仅仅是一个 **指向** 一个可观察对象的对象，但是其变量（引用）本身是不可观察的。

#### Incorrect: dereference outside of a tracked function

#### 不正确的做法：在跟踪函数外部使用可观察属性

```javascript
let title = message.title
autorun(() => {
    console.log(title)
})
message.updateMessage("Bar")
```

This will **not** react. `message.title` was dereferenced outside of `autorun`, and just contains the value of `message.title` at the moment of dereferencing (the string `"Foo"`). `title` is not an observable so `autorun` will never react.

这不会使 MobX 响应。`message.title` 在 `autorun` 函数的外面被使用了，且 `title` 的值是在使用 `message.title` 时的值 `"Foo"`，`title` 是不可观察的，因此 `autorun` 永远不会对 `title` 的变化做出响应。

#### Correct: dereference inside the tracked function

#### 正确的做法：在跟踪函数内部使用可观察属性

```javascript
autorun(() => {
    console.log(message.author.name)
})

runInAction(() => {
    message.author.name = "Sara"
})
runInAction(() => {
    message.author = { name: "Joe" }
})
```

This reacts to both changes. Both `author` and `author.name` are dotted into, allowing MobX to track these references.

这些变化都将引起 MobX 的响应，`author` 和 `author.name` 都被使用了，这使得 MobX 可以跟踪它们。

Note that we had to use `runInAction` here to be allowed to make changes outside
of an `action`.

注意，我们必须在这里使用 `runInAction` 才能在 `action` 之外进行更改。

#### Incorrect: store a local reference to an observable object without tracking

#### 不正确的做法：在不跟踪的情况下保留一个可观察对象的局部引用

```javascript
const author = message.author
autorun(() => {
    console.log(author.name)
})

runInAction(() => {
    message.author.name = "Sara"
})
runInAction(() => {
    message.author = { name: "Joe" }
})
```

The first change will be picked up, `message.author` and `author` are the same object, and the `.name` property is dereferenced in the autorun.
However, the second change is **not** picked up, because the `message.author` relation is not tracked by the `autorun`. Autorun is still using the "old" `author`.

第一个改变将会被捕捉，`message.author` 和 `author` 是同一个对象，属性 `.name` 在 autorun 中被使用了，可以触发响应。
但是，第二个改变并 **不会** 被捕捉，因为 `message.author` 并没有被 `autorun` 跟踪，`autorun` 跟踪的是 `author.name`，Autorun 依然会继续使用之前定义的“老的” `author`。（这里 `message.author` 被赋予了一个新对象，且和 `author` 不是同一个对象）

#### Common pitfall: console.log

#### 常见陷阱：console.log

```javascript
autorun(() => {
    console.log(message)
})

// 这不会引发 autorun 的重新执行
message.updateTitle("你好，世界！")
```

In the above example, the updated message title won't be printed, because it is not used inside the autorun.
The autorun only depends on `message`, which is not an observable, but a variable. In other words, as far as MobX is concerned, `title` is not used in the `autorun`.

在上面的例子中，更新的信息的标题并不会被打印出来，因为他没有在 autorun 中被使用。
autorun 只会依赖于不可观察的 `message`，`message` 只是一个变量。换句话说，MobX 所关心的 `title` 并没有被 `autorun` 使用。

If you use this in a web browser debugging tool, you may be able to find the
updated value of `title` after all, but this is misleading -- autorun run after all has run once when it was first called. This happens because `console.log` is an asynchronous function and the object is only formatted later in time. This means that if you follow the title in the debugging toolbar, you can find the updated value. But the `autorun` does not track any updates.

如果你在 web 浏览器调试工具中测试该实例，你可能会发现 `title` 更新后的值，但其实这是一种误导 -- autorun 在第一次调用时只运行了一次。这是因为 `console.log` 是一个异步函数，对象只是在稍后格式化。这意味着，如果按照调试工具栏中的标题进行操作，则可以找到更新的值。但 `autorun` 不会跟踪任何更新。

The way to make this work is to make sure to always pass immutable data or defensive copies to `console.log`. So the following solutions all react to changes in `message.title`:

使其能够被正常跟踪的方法是确保将不可变数据或者保护性副本传递给 `console.log`。因此下面的所有方法都能使 `message.title` 的变化被响应。

```javascript
autorun(() => {
    console.log(message.title) // 很明显，可观察的 .title 被使用了。
})

autorun(() => {
    console.log(mobx.toJS(message)) // toJS 创建一个深拷贝的对象，也因此 message.title 被使用
})

autorun(() => {
    console.log({ ...message }) // 创建一个浅拷贝，展开时 message.title 也会被使用
})

autorun(() => {
    console.log(JSON.stringify(message)) // JSON 序列化，也会使用 message.title
})
```

#### Correct: access array properties in tracked function

#### 正确的做法：在跟踪函数中访问数组的属性

```javascript
autorun(() => {
    console.log(message.likes.length)
})
message.likes.push("Jennifer")
```

This will react as expected. `.length` counts towards a property.
Note that this will react to _any_ change in the array.
Arrays are not tracked per index / property (like observable objects and maps), but as a whole.

这将会引发符合期待的响应。`.length` 也会被认为是一个属性。
注意：发生在该数组中的 _任何_ 变化都会引发响应。
数组不是按索引或属性（如可观察对象和 maps）跟踪的，而是作为一个整体跟踪的。

#### Incorrect: access out-of-bounds indices in tracked function

#### 不正确的做法：在跟踪函数中的访问越界的索引

```javascript
autorun(() => {
    console.log(message.likes[0])
})
message.likes.push("Jennifer")
```

This will react with the above sample data because array indexes count as property access. But **only** if the provided `index < length`.
MobX does not track not-yet-existing array indices.
So always guard your array index based access with a `.length` check.

这个实例将会引起响应，因为数组的索引访问也被认为是属性访问，但是 **只有** 当 `index < length` 时才能引发响应。
MobX 不跟踪尚未存在的数组索引，
因此在对数组进行索引访问前，请先进行 `.length` （越界）检查。

#### Correct: access array functions in tracked function

#### 正确的做法：在跟踪函数中访问数组的方法

```javascript
autorun(() => {
    console.log(message.likes.join(", "))
})
message.likes.push("Jennifer")
```

This will react as expected. All array functions that do not mutate the array are tracked automatically.

这将会引发符合期待的响应。所有不改变数组的数组函数都会被自动跟踪。

---

```javascript
autorun(() => {
    console.log(message.likes.join(", "))
})
message.likes[2] = "Jennifer"
```

This will react as expected. All array index assignments are detected, but only if `index <= length`.

这将会引发符合期待的响应。所有的数组索引赋值，除了越界情况（比如 `index > length`），都会被捕捉到。

#### Incorrect: "use" an observable but without accessing any of its properties

#### 不正确的做法：“使用”可观察对象但是没有访问其任何的属性

```javascript
autorun(() => {
    message.likes
})
message.likes.push("Jennifer")
```

This will **not** react. Simply because the `likes` array itself is not being used by the `autorun`, only the reference to the array.
So in contrast, `messages.likes = ["Jennifer"]` would be picked up; that statement does not modify the array, but the `likes` property itself.

这将不会引发响应，仅仅是因为 `likes` 数组本身并没有被 `autorun` 使用，使用的仅仅是该数组的引用。
相比之下，`messages.likes = ['Jennifer']` 将会被捕捉并响应，该语句不修改likes数组，修改的是 `likes` 数组本身。

#### Correct: using not yet existing map entries

#### 正确的做法：使用尚不存在的字典的键

```javascript
const twitterUrls = observable.map({
    Joe: "twitter.com/joey"
})

autorun(() => {
    console.log(twitterUrls.get("Sara"))
})

runInAction(() => {
    twitterUrls.set("Sara", "twitter.com/horsejs")
})
```

This **will** react. Observable maps support observing entries that may not exist.
Note that this will initially print `undefined`.
You can check for the existence of an entry first by using `twitterUrls.has("Sara")`.
So in an environment without Proxy support for dynamically keyed collections always use observable maps. If you do have Proxy support you can use observable maps as well,
but you also have the option to use plain objects.

这 **会引发** 响应。可观察字典（map）支持观察可能还不存在键值对。
注意：当不存在时得到的值是 undefined。
你也可以通过使用 `twitterUrls.has("Sara")` 检查键值对在字典中是否存在。
因此，在没有代理支持的情况中，动态的键值对集合总是使用可观察字典来实现。如果你有代理，也可以使用可观察字典，当然你也可以选择使用普通对象。

#### MobX does not track asynchronously accessed data

#### MobX 不跟踪异步访问的数据

```javascript
function upperCaseAuthorName(author) {
    const baseName = author.name
    return baseName.toUpperCase()
}
autorun(() => {
    console.log(upperCaseAuthorName(message.author))
})

runInAction(() => {
    message.author.name = "Chesterton"
})
```

This will react. Even though `author.name` is not dereferenced by the function passed to `autorun` itself, MobX will still track the dereferencing that happens in `upperCaseAuthorName`, because it happens _during_ the execution of the autorun.

这将会引发响应。尽管 `author.name` 并没有被接收了 `upperCaseAuthorName` 的 `autorun` 函数所使用，MobX 依然会跟踪发生在 `upperCaseAuthorName` 中的使用，因为这个使用发生在 autorun 的执行过程中。

---

```javascript
autorun(() => {
    setTimeout(() => console.log(message.likes.join(", ")), 10)
})

runInAction(() => {
    message.likes.push("Jennifer")
})
```

This will **not** react because during the execution of the `autorun` no observables were accessed, only during the `setTimeout`, which is an asynchronous function.

这 **会引发** 响应。因为在 autorun 的执行过程中，没有任何的可观察对象被访问使用了，只是在 `setTimeout` 中使用了可观察对象，但是 `setTimeout` 是异步函数，不可跟踪。

Check out the [Asynchronous actions](actions.md#asynchronous-actions) section as well.

看看[异步行为](actions.md#asynchronous-actions)章节获得更多理解。

#### Using non-observable object properties

#### 使用不可观察的对象属性

```javascript
autorun(() => {
    console.log(message.author.age)
})

runInAction(() => {
    message.author.age = 10
})
```

This **will** react if you run React in an environment that supports Proxy.
Note that this is only done for objects created with `observable` or `observable.object`. New properties on class instances will not be made observable automatically.

当你在一个支持代理的环境中运行 React 时，这 **会引发** 响应
注意：这仅适用于使用 `observable` 或 `observable.object` 创建的对象。类实例上后面增加的新属性将不会自动成为可观察的。

_Environments without Proxy support_

_不支持代理的环境_

This will **not** react. MobX can only track observable properties, and 'age' has not been defined as observable property above.

这将 **不会** 引发响应，MobX 只能跟踪可观察属性，上面实例中的 `age` 并没有被定义为可观察属性。

However, it is possible to use the `get` and `set` methods as exposed by MobX to work around this:

但是，可以通过使用 MobX 暴露出的 `get` 和 `set` 方法解决这个问题：

```javascript
import { get, set } from "mobx"

autorun(() => {
    console.log(get(message.author, "age"))
})
set(message.author, "age", 10)
```

#### [Without Proxy support] Incorrect: using not yet existing observable object properties

#### [无代理支持] 不正确的做法：使用尚不存在的对象属性

```javascript
autorun(() => {
    console.log(message.author.age)
})
extendObservable(message.author, {
    age: 10
})
```

This will **not** react. MobX will not react to observable properties that did not exist when tracking started.
If the two statements are swapped, or if any other observable causes the `autorun` to re-run, the `autorun` will start tracking the `age` as well.

这将 **不会** 引发响应，MobX 不会在跟踪开始时对不存在的可观察属性做出响应。如果这两个语句被交换，或者任何其他可观察的语句导致 `autorun` 重新运行，`autorun` 也将开始跟踪 `age`。

#### [Without Proxy support] Correct: using MobX utilities to read / write to objects

#### [无代理支持] 正确的做法：使用 MobX 实用工具读/写对象

If you are in an environment without proxy support and still want to use observable
objects as a dynamic collection, you can handle them using the MobX `get` and `set`
API.

如果你的环境不支持代理，但是仍然希望将可观察对象用作一个动态集合，那么可以使用 MobX 的 `get` 和 `set` API 来处理它们。

The following will react as well:

下面的例子也将会引发响应：

```javascript
import { get, set, observable } from "mobx"

const twitterUrls = observable.object({
    Joe: "twitter.com/joey"
})

autorun(() => {
    console.log(get(twitterUrls, "Sara")) // `get` 可以跟踪尚不存在的属性
})

runInAction(() => {
    set(twitterUrls, { Sara: "twitter.com/horsejs" })
})
```

Check out the [Collection utilities API](api.md#collection-utilities-) for more details.

看看 [集合工具API](api.md#collection-utilities-) 获取更多细节。

#### TL;DR

#### 摘要

> MobX reacts to any _existing_ **observable** _property_ that is read during the execution of a tracked function.

> Mobx 会对跟踪函数执行时读取的任何 _存在的_ **可观测的** _属性_ 做出响应。