---
author: kaokei
title: API 文档
---

## 简介

当前一共有 8 个 API，具体如下：

#### 提供依赖注入能力

这些 api 是从`@kaokei/di`中导出的，是用来定义服务的。而且还可以在类组件中使用（除了 Injectable）。

- Inject
- Self
- Skip
- Optional
- Injectable

#### 类组件专用

- Component

#### Option 组件专用

因为在 Option 组件中不能使用@Inject 的方式来注入服务。只能手动调用 useService 来获取服务实例。
同样在类组件中可以使用 Component 来定义 providers，但是在 Option 组件中不能使用装饰器。所以也提供了一个方法 declareProviders。

- declareProviders
- useService

## Inject 装饰器函数

```ts
import { Injectable } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Inject(LoggerService)
  private logger1: LoggerService,

  constructor(
    @Inject(LoggerService) private logger2: LoggerService,
  ) {}
}
```

装饰器目前只能用在类上面，所以可以在类组件和类服务上使用。

参考示例代码，可以看出来`@Inject`装饰器可以在`实例属性`以及类的`构造函数的参数`上使用。

@Inject 的作用是在当前类实例化的时候，Injector 会自动帮助我们注入相应的`实例属性`和`构造函数参数`。

@Inject 有一个必填的参数，作为需要注入的服务标识符。

在实例属性上，@Inject 是必须的。如果没有这个装饰器，那么就是一个普通的属性。

在构造函数的参数上，如果参数类型是类，比如这里的 logger2 的类型是 LoggerService 是一个类。那么这里其实是可以不使用@Inject 的。代码如下：

```ts
constructor(
  private logger2: LoggerService,
) {}
```

**注意**：最初的设计在实例属性上，如果属性的类型是一个类，@Inject 的参数是可以省略的，因为装饰器是可以获取到正确的类型的。最终为了代码一致性，把这个特性去掉了，强制要求@Inject 必须指定参数。总结起来就是只有构造函数中可以不使用@Inject，但是如果使用@Inejct 都必须指定参数。还有一点需要注意，实例属性和构造函数的参数的类型可以是`interface`，但是@Inject 的参数不能是`interface`。

## Skip 装饰器函数

```ts
import { Injectable, Skip } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Skip()
  @Inject(LoggerService)
  private logger1: LoggerService,

  constructor(
    @Skip()
    @Inject(LoggerService)
    private logger2: LoggerService,
  ) {}
}
```

同样是属于装饰器函数，配合@Inject 一起使用。

@Skip 主要是控制@Inject 的行为，在没有@Skip 时，@Inject 会从当前的 Injector 中获取对应的服务，如果找不到则会自动从其父级 Injector 中寻找对应的服务，最终一直到根 Injector 中寻找服务。那么@Skip 的作用就是默认从当前的 Injector 的父级 Injector 开始寻找服务，即跳过当前 Injector。

这样的场景不是很多见，比如当前组件中有一个 Student 服务，代表某个学生，显然我们可以直接@Inject 获取一个 Student 服务。假设其父组件中维护也维护着一个 Student 服务，并且父组件中已经有一个服务实例代表该班级最优秀的学生。那么如果在当前的子组件中想要获取这个最优秀的学生就需要用到@Skip 功能了。

我知道有些同学的脑洞比较大，假设有一个更加复杂的场景，在班级最优秀的学生上面还有年级最优秀、学校最优秀、全市最优秀、全国最优秀、全球最优秀。。。那么如何在最底层的组件中获取以上服务实例呢？答案就是`做不到`。应该说只是借助@Skip 是做不到这个功能的。具体方法可以[参考这里]()。

其实一开始我是有实现@Skip(number)这个功能的，比如@Skip(5)就是向上跳过 5 层。最终考虑到这样的场景毕竟不是很常见的场景，反而因为实现这个功能降低了整个代码的效率。所以最终是去掉了这个功能。

@Skip 有一个缺点，它可能不是从像你理解的那样跳过当前的 Injector。[参考这里]()

## Self 装饰器函数

```ts
import { Injectable, Self } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Self()
  @Inject(LoggerService)
  private logger1: LoggerService,

  constructor(
    @Self()
    @Inject(LoggerService)
    private logger2: LoggerService,
  ) {}
}
```

同样是属于装饰器函数，配合@Inject 一起使用。

根据函数名应该已经猜到其作用了。它控制了@Inject 只会从当前所属的 Injector 中获取服务实例。
咋一看似乎没什么实际用处。仔细一分析还真是没什么实际作用。

因为是借鉴的 Angular 的 API，所以就给实现了。

我的理解它最大的作用应该是起到警告的作用。比如我只想从当前 Injector 中获取 LoggerService，那么我必须要保证当前 Injector 中已经配置了 LoggerService 的 provider。如果我们手动已经保证了这一点，那么有没有@Self 是没有什么影响的。但是如果无意间我们删除了这个 provider，那么@Self 就会报错找不到服务。如果没有@Self 就有可能自动从更父级的 Injector 中寻找到 LoggerService，使得程序没有抛出异常，但是这可能不是我们想要的业务逻辑。

## Optional 装饰器函数

```ts
import { Injectable, Optional, Self, Skip } from "@kaokei/use-vue-service";
import { LoggerService } from "./logger.service.ts";

@Injectable()
export class CountService {
  @Optional()
  @Inject(LoggerService)
  private logger1: LoggerService,

  @Optional()
  @Self()
  @Inject(LoggerService)
  private logger2: LoggerService,

  @Optional()
  @Skip()
  @Inject(LoggerService)
  private logger3: LoggerService,

  constructor(
    @Optional()
    @Inject(LoggerService)
    private logger4: LoggerService,

    @Optional()
    @Self()
    @Inject(LoggerService)
    private logger5: LoggerService,

    @Optional()
    @Skip()
    @Inject(LoggerService)
    private logger6: LoggerService,
  ) {}
}
```

同样是属于装饰器函数，配合@Inject 一起使用。

之前我们有提到当 Injector 找不到对应的服务的 provider 时，会抛出异常。如果认为某个属性可以是非必须的，就可以使用@Optional，这时如果找不到 provider，就会返回`undefined`。

**注意**：因为实例属性可能是 undefined，那么在调用实例属性的方法时就应该判空，像这样`this.logger1?.log('hello world');`

**注意**：默认情况下，如果服务的标识符是一个类，那么在找不到这个服务的 provider 时，就会直接实例化这个类当作服务实例。当然如果有@Self 控制@Inject 的话，就不会自动实例化类了。

**注意**：上面提到的@Self 控制@Inject，所以就不会自动实例化类了。这在本库中是没有问题的。因为本库提供了一个默认的 Injector 作为根 Injector。实际上在`@kaokei/di`这个库中的实现要稍微复杂一些，当你手动实例时一个 Injector，并且没有指定父级 Injector 时，它自己就会作为根 Injector，而根 Injector 则又会自动实例化类了。具体代码可以[参考这里]()。

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

可以理解为在构造函数的参数如果是类的时候，就可以不使用@Inject 的原因就在于@Injectable 已经收集到这些类的信息了。

**注意**：虽然对于没有构造函数的类可以不使用@Injectable，但是为了保持一致性，还是尽量所有的服务类都使用@Injectable。

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

从示例代码中可以看出，@Component 作为类的装饰器，其参数是和[vue-class-component@8.x]()中的@Options 函数基本是一致的。

只不过在@Options 的基础上，@Component 还增加了一个参数，就是 providers，其效果就是 declareProviders 函数的作用，用于声明当前组件关联的 Injector 所需要的 providers。

如果当前组件不需要 providers 参数，就可以这样写：

```ts
@Component()
export default class Person extends Vue.with(Props) {
  // ...
}
```

关于 Component 这个 api 则是特意给类组件用的。它有三个作用：

- 第一个作用是对 vue-class-component@8.x 中的`@Options`的封装；
- 第二个作用是通过参数 providers 实现了 declareProviders 函数的功能；
- 第三个作用是实现了类组件具有依赖注入的能力。
  - 当然这里的注入是有限制的，只能注入实例属性，而不能注入构造函数参数。
  - 类组件只能注入别的服务，而不能把类组件当作服务注入。这点在 Angular 中是被支持的，但是我觉得这个功能过于强大了，不符合数据驱动视图的原则。

**注意**：`vue-class-component`在之前版本中都是使用的`@Component`这个装饰器，只是在版本 8 中修改为`@Options`了，正好本库可以捡个漏。

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

可以一次性定义多个服务的 provider。以上列出了所有 provide 的形式。

在解释其作用之前，我们必须了解 Injector 是类似 dom 树一样的树状结构，每个 Injector 都有一个父级 Injector，直到根 Injector 的父级为 null。

当我们在组件的 setup 函数中调用了 declareProviders，就意味着这个组件关联了一个新的 Injector，这个 Injector 会根据我们刚才配置的 providers 来生成服务实例。

想象一下，如果整个应用中所有的服务都是不同的，都是全局单例的。那么我们可能不需要使用`declareProviders`，把所有服务都放到根 Injector 中即可。

但是如果我们想要实现服务实例的生命周期和某个组件保持一致，最常见的场景就是路由组件。那么显然我们应该把服务定义在对应的路由组件中，而不是在根 Injector 中。

除了控制服务实例的生命周期，另一个功能就是可以实现同一个服务的多例效果。显而易见如果我们在不同的组件中调用`declareProviders`，并且配置了同一个服务。那么在获取服务实例时就能得到同一个服务的不同实例。

**注意**：`declareProviders`在同一个 setup 中只能调用一次，而且应该在最顶部调用。

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
  skip: true,
  optional: true,
  defaultValue: "somwService"
});

const someService = useService(SomeService, {
  self: true,
  optional: true,
  defaultValue: "somwService"
});
```

我们可以一次获取单个服务的实例对象，也可以一次性获取多个服务的实例对象。而且可以指定第二个参数来控制 useService 的解析过程。

useService 的作用非常类似`@Inject`。尤其是第二个参数，支持这些属性：

- self 对应@Self
- skip 对应@Skip
- optional 对应@Optional
- defaultValue 没有对应的装饰器函数，因为可以直接使用`=`来赋值默认值

注意到 useService 非常优秀的一点就是返回值都是自带类型的，所以可以非常方便的使用`.`来知道这个类有哪些属性和方法。

另外一点就是其返回值已经是 reactive 的，可以直接在 vue 模版中绑定。
