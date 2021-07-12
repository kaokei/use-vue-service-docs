---
author: kaokei
title: 如何使用类组件
---

## 简介

本教程继续介绍下面这个 api，进而掌握如何使用类组件，以及在类组件中使用依赖注入能力。

- Component

整体上来说不太推荐使用类组件，但是有些人比较偏爱类组件，所以本库也支持类组件的依赖注入。

不推荐的原因主要是因为 vue 并不是本身就支持类组件，而是需要借助`vue-class-component`这个库才能实现支持类组件。虽然这个库也是官方维护的。但毕竟不是原生支持的。

其实我本身还是比较喜欢类组件的，因为如果整个项目包括服务和组件都是类，整体是比较一致的。只是类组件毕竟不是原生支持的，感觉还是不够顺手。

不管怎么说，整个项目要不全都用类组件，要不全都用 Option 组件，不要部分组件用类，另一部分组件又用 Option。至少要保持风格统一。

## 类组件与 Option 组件的区别

### setup 的不同

在 Option 组件中，只有一个 setup 函数，意味着只有一个闭包，我可以在这个闭包内基于已有的数据派生出其他数据。

但是在类组件中，虽然也可以使用 setup 函数，但是含义已经不一样了，它是对实例属性的延迟初始化的一种方式。

而且本质也不一样，类组件需要借助`vue-class-component`库才能使用。而且这里的 setup 也是从 vue-class-component 导入的函数。但是在 Option 组件中，setup 只是组件的一个预定义属性而已。

### computed 的不同

在 Option 组件中，我们可以在 setup 闭包中使用`const computedValue = computed(() => {})`，然后导出这个 computedValue 即可。

但是在类组件中，我们则是通过定义 getter 函数来实现 computed 属性的功能。

### watch 的不同

在 Option 组件中，我们可以在 setup 闭包中使用`watchEffect()`来定义 watch 功能。

但是在类组件中，这个已经不在类中定义了，只能在装饰器中定义 watch 属性。

### 类组件转化为 Option 组件

通过观察 vue-class-component 的源码，我们可以发现类组件虽然看上去像是一个类，但是最终还是被转换为 Option 组件了。

而且为了获取类的的实例属性，必须得实例化一次。这意味着类组件的构造函数会被执行两次。所以在 vue 的类组件的构造函数中不能定义有副作用的逻辑，实际上是不建议定义类组件的构造函数的。

## 使用类组件

如何在 vue 中使用类组件的具体官方文档可以[参考这里](https://class-component.vuejs.org/)，当然目前这个文档是 vue2.x 的，vue3.x 的文档还没有出来，可以[参考这里](https://github.com/vuejs/vue-class-component/issues)。

本库在`vue-class-component@next`的基础上新增了一个 api，从而可以实现依赖注入的能力。

```vue
<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name || "defaultName" }}:</span>
    <button class="decrementBtn" type="button" @click="counter.decrement">
      -
    </button>
    <span class="countNum">{{ counter?.count }}</span>
    <button class="incrementBtn" type="button" @click="counter.increment">
      +
    </button>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

import { Component, Inject } from "@kaokei/use-vue-service";

import { COUNTER_THEME } from "@services/service.context.ts";
import { SwitchService } from "@services/switch.service.ts";
import { CounterService } from "@services/counter.service.ts";

class Props {
  name?: string;
  bgColor?: string;
}

@Component({
  providers: [
    {
      provide: COUNTER_THEME,
      useValue: "red"
    },
    CounterService
  ]
})
export default class Person extends Vue.with(Props) {
  @Inject(COUNTER_THEME)
  public theme!: string;

  @Inject(CounterService)
  public counter!: CounterService;

  @Inject(SwitchService)
  public switchService!: SwitchService;

  public get bgTheme() {
    if (this.switchService.counterStatus === 1) {
      return this.bgColor || this.theme;
    } else {
      return "transparent";
    }
  }
}
</script>
```

这份示例代码中有很多可以说一说的地方。

第一点：`export default class Person extends Vue.with(Props)`这行代码是`vue-class-component`规定的模板代码，并不是本库的要求。

第二点：虽然 Person 是一个组件，但是整体上来看也可以理解为一个服务，可以利用`@Inject`注入其他的服务。需要特别注意的地方时，在普通服务中，我们可以在类的构造函数中声明依赖，但是在类组件中则不能通过构造函数声明依赖。只能通过实例属性来声明依赖。这是因为 vue 类组件的构造函数已经定义好了参数`constructor(props: Record<string, any>, ctx: SetupContext)`。而且由于类组件在转化为 Option 组件的时候，实际上会调用两次构造函数，所以是不建议在类组件的构造函数中增加其他逻辑的。

第三点：定义了 bgTheme 这个 getter 函数，其功能相当于 vue 中的 computed 属性。

第四点：也是最重要的一点，使用`@Component()`这个装饰器来定义类组件。这里有一个取巧的地方，就是在 vue-class-component@7.x 及之前的版本中，都是采用的`@Component()`这个装饰器定义类组件的，但是在 vue-class-component@8.x 中，已经改为`@Options()`来定义类组件了。所以本库正好可以占用`@Component`这个 API。本库提供的`@Component`与 vue-class-component@8.x 提供的`@Options`的区别主要有两点：

- @Options 支持的参数，@Component 都是支持的。而且额外支持了 providers 这个参数，这个参数可以代替 declareProviders 函数。

- @Component 是对@Options 的封装，同时支持了依赖注入的能力。

## 参考文章

- [Vue Class Component 官网](https://class-component.vuejs.org/)
