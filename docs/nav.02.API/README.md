---
author: 三棵树
title: API 文档
---

## 简介

当前一共有 7 个 API，具体如下：

- Inject
- Skip
- Namespace
- Injectable
- Component
- declareProviders
- useService

如果整个项目中只有 Option 组件，那么只需要使用这些 API

- Inject
- Skip
- Namespace
- Injectable
- declareProviders
- useService

如果整个项目中只有类组件，那么只需要使用这些 API

- Inject
- Skip
- Namespace
- Injectable
- Component

可以看出来 Inject、Skip、Namespace 和 Injectable 是定义服务的时候使用到的 api，当然在类组件中也会使用到，因为可以把类组件看作一种特殊的服务。

关于 declareProviders 和 useService 则是特意给 Option 组件实现的 api。因为在 Option 组件中不能使用@Inject 的方式来注入服务。只能手动调用 useService 来获取服务实例。实际上@Inject 的背后也是调用的 useService 函数。

关于 Component 这个 api 则是特意给类组件用的。它有三个作用：

- 第一个作用是对 vue-class-component@8.x 中的`@Options`的封装；
- 第二个作用是通过参数 providers 实现了 declareProviders 函数的功能；
- 第三个作用是实现了类组件具有依赖注入的能力。注意类组件只能注入别的服务，而不能把类组件当作服务注入。

@Component 可以看作是@Options、declareProviders 和@Injectable 的结合体。

## Inject 装饰器函数

```ts
import { Injectable } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Inject()
  private logger1: LoggerService,

  @Inject(LoggerService)
  private logger2: LoggerService,

  constructor(
    @Inject(LoggerService) private logger3: LoggerService,
  ) {}
}
```

参考示例代码，可以看出来`@Inject`可以在实例属性以及类的构造函数的参数上作为装饰器使用。

@Inject 有一个可选的参数。

在实例属性上，@Inject 是必须的。如果实例属性的类型是类，那么@Inject 的参数是非必须的。否则是必须的。

在构造函数的参数上，如果参数类型是类，则不需要使用@Inject，否则就需要@Inject(someServiceToken)来指定服务。

## Skip 装饰器函数

```ts
import { Injectable, Skip } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Skip()
  private logger1: LoggerService,

  @Skip(1)
  @Inject()
  private logger2: LoggerService,

  @Skip(true)
  @Inject(LoggerService)
  private logger3: LoggerService,

  constructor(
    @Skip()
    @Inject(LoggerService)
    private logger4: LoggerService,
  ) {}
}
```

参考示例代码，可以看出来`@Skip`和`@Inject`使用的地方是一致的。

@Skip 有一个可选的参数。

```ts
// 接口定义
@Skip(skipNum?: number|boolean)
// 以下三种是等价的
@Skip() === @Skip(true) === @Skip(1)
```

要想了解@skip 的作用，就得知道@Inject 的作用。而@Inject 的作用，则是和 useService 是等价的。

useService 会从当前组件的命名空间中寻找服务的 provider，如果没有找到。就从父组件中寻找，如果还没有找到，还继续从父组件的父组件中寻找，一直找到根组件中。如果寻找到对应服务的 provider，那么就使用该 provider 获取服务的实例对象。如果在根组件的命名空间中也没有找到对应的 provider。那么就把服务类当作默认的 provider，再根据这个默认的 provider 获取服务的实例对象。

整个解析过程非常像 js 中的原型链和 nodejs 中的 node_modules 的解析机制。

那么@Skip 的作用就很明确了，@Skip(num)代表向上解析的过程中跳过的次数。注意这里并不是代表跳过的父组件的次数。而是指跳过解析对应服务的次数。

比如这段代码：

```ts
@Skip()
private logger1: LoggerService
```

这里@Skip()代表向上跳过 1 次，这里的一次并不是向上跳过一次父组件，而是指在向上解析的过程中，如果第一次遇到了 LoggerService 的 provider，那么跳过 1 次。第二次解析到 LoggerService 的 provider，才是真正想要的 provider。

注意：@Skip(999)代表向上解析跳过 999 次，显然正常是不会解析这么多层就已经到根组件了，此时就不再向上跳过了，而是默认使用根组件的默认 provider 了。

## Namespace 装饰器函数

```ts
import { Injectable, Namespace } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Namespace()
  private logger1: LoggerService,

  @Namespace('other')
  @Inject()
  private logger2: LoggerService,

  @Namespace('other2')
  @Inject(LoggerService)
  private logger3: LoggerService,

  constructor(
    @Namespace('other3')
    @Inject(LoggerService)
    private logger4: LoggerService,
  ) {}
}
```

指定根组件中的命名空间的名称。默认值就是 root；其实不使用@Namespace，那么根组件的命名空间也是 root。

```ts
@Namespace() === @Namespace('root')
```

绝大多数时候，我们并不需要手动指定根组件的命名空间。

## Injectable 装饰器函数

```ts
import { Injectable } from "@kaokei/use-vue-service";

@Injectable()
export class LoggerService {
  public log(...msg: any[]) {
    console.log("from logger service ==>", ...msg);
  }
}
```

Injectable 这个 api 是最简单的 api，只需要在定义服务类的时候，作为类的装饰器使用即可。

Injectable 内部的实现是非常简单的，只是利用了 reflect-metadata 库简单的记录了服务类的构造函数的参数的类型信息。以便在后续实例化服务类的时候需要使用这些类型信息。

## Component 装饰器函数

```ts
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
  // ...
}
```

从示例代码中可以看出，@Component 作为类的装饰器，其参数是和`vue-class-component@8.x`中的@Options 函数是一致的。

当然在@Options 的基础上，@Component 还增加了一个参数，就是 providers，其效果就是 declareProviders 函数的作用。

如果当前组件不需要 providers 参数，就可以这样写：

```ts
@Component()
export default class Person extends Vue.with(Props) {
  // ...
}
```

## declareProviders 函数

只能在 setup 函数中使用。

```ts
declareProviders([
  SomeService,
  {
    provide: SomeService,
    useClass: SomeService
  },
  {
    provide: SomeService,
    useClass: SomeOtherService
  },
  {
    provide: SomeService,
    useValue: someServiceInstance
  },
  {
    provide: SomeService,
    useExisting: SomeOtherService
  },
  {
    provide: SomeService,
    useFactory: (dependService1, dependService2, dependService3) => {
      return someServiceInstance;
    },
    deps: [DependService1, DependService2, DependService3]
  }
]);
```

可以一次性定义多个服务的 provider。总共有 5 中形式的 provider。

## useService 函数

只能在 setup 函数中使用。

```ts
const someService = useService(SomeService);

const [someService1, someService2, someService3] = useService([
  SomeService1,
  SomeService2,
  SomeService3
]);

const someService = useService(SomeService, {
  namespace: "root",
  skip: 1
});
```

我们可以一次获取单个服务的实例对象，也可以一次性获取多个服务的实例对象。而且可以指定第二个参数来控制 useService 的解析过程。

<Vssue title="API" />
