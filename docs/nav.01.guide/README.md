---
author: 三棵树
title: 指南
---

## 简介

本库基于 vue3.x 的 reactive 特性，借鉴了 angular 的 service 的实现机制，在 vue 环境中实现了基于服务的依赖注入，可以替代 vuex 更加方便的管理数据。

## 快速搭建项目

1. 建议使用`@vue/cli`来初始化项目。

```sh
npm install -g @vue/cli
vue create projectName
```

**注意**：手动选择 vue 版本 vue3 以及 typescript 选项，取消 vuex 选项，我们不再需要 vuex。

2. 在 tsconfig.json 文件中新增以下两行

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true,
```

3. 安装 npm 包

```sh
npm install -S reflect-metadata @kaokei/use-vue-service
```

如果还没有安装 vue-class-component

```sh
npm install -S vue-class-component@next
```

本库的定位是一个轻量级的依赖注入实现，它并不是一个框架。而且对项目的侵入性比较小。本库所有的依赖包括：

- typescript：依赖装饰器特性
  - 需要 tsc 编译器，而不能是 esbuild 编译器
  - 需要开启实验特性
- vue3.x：依赖 provide/inject/reactive 等特性
- reflect-metadata：获取类型信息
- vue-class-component：支持类组件

4. 定义服务

接下来就是开始写代码了，第一步就是定义服务，我们采用类来定义服务，并使用`@Injectable()`来表明服务可注入

5. 组织服务

第二步是组织这些定义好的服务，所谓组织服务其实就是定义这些服务的作用域。组织方式参考了 angular 的实现方式。

6. 使用服务

第三步就是通过 api 获取服务实例，拿到服务实例后，就能读取服务的状态以及调用服务的方法更新服务的状态。

这里再回顾一下我们定义服务的时候采用的是类的形式。服务的实例就是类的实例。所以服务的状态就是类的实例的属性，所以可以调用类的实例的方法更新属性。
同时服务已经被`reactive`处理过，vue 模版可以直接渲染服务的状态。当服务的状态变化时，vue 模版也会自动更新。

```ts
import { useService } from "@kaokei/use-vue-service";
import { SomeService } from "./some.service.ts";

const someService = useService(SomeService);
```

```vue
<template>
  <div>{{ someService.name }}: {{ someService.age }}</div>
  <button type="button" @click="someService.agePlusOne">年龄+1</button>
</template>
```

## 注意

虽然 vue 官网比较推荐使用 vite 搭建项目，但是这里暂时还不能使用 vite 搭建项目。

因为 vite 使用的是 esbuild 而不是 tsc 编译 ts 代码。而 esbuild 暂时还不支持装饰器特性，本库最大的特点就是依赖注入，它是通过装饰器来实现的。
