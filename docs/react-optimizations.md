---
title: 优化React组件渲染
sidebar_label: React 优化 {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 优化React组件渲染 {🚀}

MobX非常快, [通常比 Redux 更快](https://twitter.com/mweststrate/status/718444275239882753), 但本章节提供一些小贴士，以便充分利用 React 和 MobX。 请注意，大多数小贴士都适用于一般的 React，而非 MobX 特有的。
需要注意的是，虽然这些模式都很好, 但通常应用程序速度都足够快，即使您什么都没有做。

仅当性能存在实际问题时才优先考虑！

## 使用大量的小组件

`observer` 组件将跟踪他们使用的值，并且当它们中任何一个值发生时重新渲染。所以你的组件越小，它们重新渲染产生的变化就越小。这意味着用户界面的更多部分具备彼此独立渲染的可能性。

## 专用组件去渲染列表

这点在渲染大量数据时格外重要。 
React 在渲染大量数据时表现非常糟糕，因为协调器必须评估每个集合变化的集合所产生的组件。 
因此，建议使用专门的组件来映射集合并渲染这个组件，且不再渲染其他组件。

不好的:

```javascript
const MyComponent = observer(({ todos, user }) => (
    <div>
        {user.name}
        <ul>
            {todos.map(todo => (
                <TodoView todo={todo} key={todo.id} />
            ))}
        </ul>
    </div>
))
```

在上面的示例中，当 `user.name` 改变时，React 会不必要地协调所有的 `TodoView` 组件。尽管 `TodoView` 组件不会重新渲染，但是协调的过程本身是非常昂贵的。

好的:

```javascript
const MyComponent = observer(({ todos, user }) => (
    <div>
        {user.name}
        <TodosView todos={todos} />
    </div>
))

const TodosView = observer(({ todos }) => (
    <ul>
        {todos.map(todo => (
            <TodoView todo={todo} key={todo.id} />
        ))}
    </ul>
))
```

## 不要使用数组的索引作为 key

不用使用数组索引或者任何将来可能会改变的值作为 key 。如果需要的话为你的对象生成 ids。 还可以参见这篇 [博客](https://medium.com/@robinpokorny/index-as-a-key-is-an-anti-pattern-e0349aece318)。

## 晚一点使用间接引用值


使用 `mobx-react` 时，推荐尽可能晚的使用间接引用值。
这是因为当使用 observable 间接引用值时 MobX 会自动重新渲染组件。
如果间接引用值发生在组件树的层级越深，那么需要重新渲染的组件就越少。

慢的:

```javascript
<DisplayName name={person.name} />
```

快的:

```javascript
<DisplayName person={person} />
```
在这个快的示例中, 改变 `name` 属性只会触发 `DisplayName` 重新渲染, 在慢的示例中，组件的所有者也必须重新渲染。 前者这没有错, 如果组件的拥有者渲染的足够快(通常是这样!)，这种方式也能很好的运行。

### 尽早绑定函数 {🚀} 

为了获得最佳的性能，你不得不创建大量小的 observer 组件，它们每个都用来渲染特定数据的不同部分，例如：

```javascript
const PersonNameDisplayer = observer(({ person }) => <DisplayName name={person.name} />)

const CarNameDisplayer = observer(({ car }) => <DisplayName name={car.model} />)

const ManufacturerNameDisplayer = observer({ car}) => (
    <DisplayName name={car.manufacturer.name} />
)
```

如果你拥有很多不同的数据，这种快速的方式就会变得很冗长。另一种方式是使用使用函数来返回想要渲染 `Displayer` 的数据。

```javascript
const GenericNameDisplayer = observer(({ getName }) => <DisplayName name={getName()} />)
```

然后，你可以这样来使用组件:

```javascript
const MyComponent = ({ person, car }) => (
    <>
        <GenericNameDisplayer getName={() => person.name} />
        <GenericNameDisplayer getName={() => car.model} />
        <GenericNameDisplayer getName={() => car.manufacturer.name} />
    </>
)
```
这种方式允许 `GenericNameDisplayer` 渲染任何名称的组件，你依然可以保持组件渲染在最低的限度。