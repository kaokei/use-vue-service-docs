---
home: true
title: "@kaokei/use-vue-service"
icon: home
heroImage: /logo.png
heroText: "@kaokei/use-vue-service"
tagline: 基于vue3.x的轻量级依赖注入库
action:
  - text: 快速上手 💡
    link: /nav.01.guide/
    type: primary

features:
  - title: 数据管理 🔐
    details: 通过服务来管理数据，可以代替vuex的

  - title: 依赖注入 🎨
    details: 通过typescript的decorator实现依赖注入

  - title: 支持类组件 🔧
    details: 同时支持vue composition api和类组件

  - title: 致敬angular 📡
    details: 参考并实现了部分类似angular的服务解析机制

  - title: 易上手 🌙
    details: 核心api只有3个，非常容易上手

  - title: 更多特性 ✨
    details: 更多特性开发中。。。

footer: MIT Licensed | Copyright © 2019-present 三棵树
copyrightText: false
---

## 安装

```sh
npm install -S reflect-metadata @kaokei/use-vue-service
```

## 示例代码

```ts
import { useService } from "@kaokei/use-vue-service";
import { SomeService } from "./some.service.ts";

const someService = useService(SomeService);
```

<Vssue title="About use-vue-service library" />
