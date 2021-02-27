---
author: 三棵树
title: FQA 文档
---

## 在类组件中使用 setup

我本以为在类组件中使用 setup，就像在 Option 组件中一样简单，直接在类中定义 setup 方法就可以了。但是实际上这样是行不通的。

如果我们在类组件中定义 setup 方法，那么实际上会被 vue-class-component 覆盖掉。

实际上 vue-class-component 内部会自动生成一个 setup 函数来收集数据。

目前官方推荐使用 vue-class-component 提供的 setup helper 函数来延迟初始化类的属性。

根据官方 issue 来看，不能在类中定义 setup 方法的原因是，我们不能根据 setup 方法的返回值类型来修改类的类型。这里的意思是指 setup 的返回值应该设置为类的成员属性，我们可以在运行时做到这一点，但是在类型提示方面做不到。

## 在类组件中使用 useXXX 函数

我们封装的 useXXX 这些 hooks 函数能不能在类组件中使用

理论上 useXXX 函数只应该调用一次，并且只在 vue-class-component 提供的 setup helper 函数中调用。

但是这种写法比较丑陋，而且臃肿。使用依赖注入功能完全可以避免这个问题。

还是回到最初的问题，useXXX 是状态和逻辑的封装。如果直接使用，具有强耦合性；通过依赖注入服务来降低这种耦合性。

## 类组件是如何收集数据的

当前类组件的依赖注入是在 setup 执行完之后才注入的

这个目前还算不上是缺陷，因为类组件的 setup 函数是 vue-class-component 固定实现的，并不含有业务逻辑。

意味着该 setup 函数中并不会访问类的实例属性。本质是 vue-class-component 提供的 setup 函数本身不能访问`this.$data`。

它只能访问`this.$props $emit $attrs $slots`。

还有，参考缺陷 1，我们知道 setup 不是类组件的合法方法。意味着我们不能像 option 组件一样写 setup 函数。

注意虽然 option 组件中的 setup 函数虽然也是只能访问 props 和 ctx，但是一个组件只有一个 setup 函数，在该 setup 函数内部定义的数据，是可以衍生出新数据的。

但是现在类组件中每个实例属性都对应一个 setup 函数，这些 setup 函数是互相独立的，没有办法做到数据之间的衍生。

## declareProviders 应该在什么地方使用

应该在 container component 中使用

## 什么是 provider

## 什么是依赖注入

## 总结 option 组件，类组件和服务的关系
