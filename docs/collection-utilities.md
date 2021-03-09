---
title: Collection utilities
sidebar_label: Collection utilities {🚀}
hide_title: true
---

<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEBD4KQ7&placement=mobxjsorg" id="_carbonads_js"></script>

# 集合工具 {🚀}

可以使用通用的API操作`ObservableArrays`、`ObservableObjects` 和 `ObservableMaps`。
这些API是完全自动响应的，这意味着即使没有[`Proxy`](configuration.md#limitations-without-proxy-support)的支持，如果使用 `set` 添加新的属性声明，并使用`values`或`keys`迭代它们，则Mobx可以检测到新的属性声明。

使用`values`、`keys`和`entries`的另一个好处是它们返回数组而不是迭代器。例如，我们可以直接直接在结果上调用`.map(fn)`。

话虽如此， 一个典型的项目几乎没有理由使用这些API。

访问:

-   `values(collection)` 返回一个包含集合所有值的数组.
-   `keys(collection)` 返回一个包含集合所有键的数组.
-   `entries(collection)` 返回一个包含集合所有键值对的数组.

变更:

-   `set(collection, key, value)` 或 `set(collection, { key: value })` 使用提供的键值更新集合.
-   `remove(collection, key)` 从集合中删除指定子元素. Splicing is used for arrays.
-   `has(collection, key)` 如果集合具有指定的可观察属性，则返回`true`.
-   `get(collection, key)` 返回指定的子元素.

如果你在没有[`Proxy`](configuration.md#limitations-without-proxy-support)支持的环境中使用访问的API，那么也要使用变更的API， 这样它们就可以检测到修改。

```javascript
import { get, set, observable, values } from "mobx"

const twitterUrls = observable.object({
    Joe: "twitter.com/joey"
})

autorun(() => {
    // Get can track not yet existing properties.
    console.log(get(twitterUrls, "Sara"))
})

autorun(() => {
    console.log("All urls: " + values(twitterUrls).join(", "))
})

set(twitterUrls, { Sara: "twitter.com/horsejs" })
```
