---
author: kaokei
title: 最佳实践指导
---

## 最佳实践

declareProviders 一定要在 setup 的顶部使用。如果先调用了 useService，然后再调用 declareProviders，就会导致获取的服务可能不是我们期望的。

虽然基于服务的依赖注入用起来很方便，但是也不应该滥用，还是需要考虑使用场景。我建议在容器组件中使用服务是比较适合的。但是在受控组件中还是推荐使用 props/emit 的方式进行交互。

建议自己基于 axios/superagent 封装自己的 HttpClientService
然后基于 HttpClientService 封装自己的 DaoService
我个人建议是一个项目只需要一个 DaoService，并不需要按照模块划分成多个。当然你也可以按照领域划分成不同的 DaoService，只是我认为过于繁琐了。
我理解一个项目大多数情况下很难超过 200 条接口。维护在一个服务中是可以接受的。
再然后 StudentService，TeacherService，ClassService 这些业务 Service 直接注入 DaoService 即可。

数据的生命周期应该和组件的生命周期一致，当组件销毁时，数据也应该跟着销毁。
子组件的生命周期应该受到父组件的生命周期的约束。当父组件销毁时，子组件也要跟着销毁。
如果子组件的销毁完全只受父组件控制，那么可以把所有数据都放在父组件中即可。因为这样也可以保证父子组件和数据的生命周期是一致的。
如果子组件也会绑定到子路由，则相应的数据也可以绑定到该子组件。还是在保证子组件的数据和子组件的生命周期一致。
目前来看，数据默认会绑定到全局。其他情况数据应该绑定到路由组件，以及子路由组件上。

不建议通过 props 传递 service

## @skip 只能跳过一层 Injector

目前我们只实现了@Skip 向上跳过一层 Injector。

其实一开始我是打算实现@Skip(number)来指定向上跳过若干层。后来发现实现这个功能增加很多的复杂度，又考虑到这个功能的使用场景不是很多，所以给废弃了。

那么如果确实需要跳过多层来获取服务呢？应该怎么实现呢？

其实可以借助 useClass 来实现，比如现在有一个服务是 UserService。那么我们可以在各个组件中这样定义 provider。

```
//爷爷组件中
{
  provide: 'aUserService',
  useClass: UserService
}
// 父亲组件中
{
  provide: 'bUserService',
  useClass: UserService
}
// 儿子组件中
{
  provide: 'cUserService',
  useClass: UserService
}
```

那么我们在最底层组件中随时可以获取任意的服务，因为他们的 provide 都不一样。比如这样：

```
// 孙子组件中可以直接获取到爷爷组件中的服务。
const aUserService = useService('aUserService');
```

## @Skip 和@Self 本身的缺陷

这个问题解释起来还比较复杂，主要是涉及到 provide/inject 的实现机制。也就是 vue 中 context 是如何工作的。最好是自己看源码，这里稍微解释一下。

每个组件实例上都有一个属性是`provides`，这个对象默认是指向父组件的`provides`属性，根组件的`provides`属性是 null。

当在某个组件中调用 provide 方法时，则会把其父组件的`provides`属性当作原型创建一个空对象`Object.create(parent.provides);`，然后给这个空对象设置刚才调用 provide 方法的数据。

按照这个逻辑，其实整个 provides 对象是构成一条完整的原型链的。但是问题就在于，如果一个子组件中没有调用 provide 方法，那么其`provides`属性是直接等于父组件的`provides`属性的。

翻译一下上面的话的含义就是，如果在父组件中调用了`declareProviders()`，但是子组件中没有调用这个方法，那么在子组件中通过`useService`获取服务时，是直接从父组件所关联的 Injector 开始查找服务的。这样就导致`@Skip`和`@Self`和我们正常理解的意思稍微有一些偏差。

这里确实需要人为的注意一下，当你使用@Skip 和@Self 时，当前组件一定是调用了`declareProviders()`的，否则除非你明确的知道你在做什么。

**注意**：declareProviders 是依赖 provide 实现的，useService 是依赖 inject 来实现的。

## @kaokei/di 支持默认值

依赖注入框架并没有单独实现一个@DefaultValue 这样的装饰器，因为可以直接使用赋值语句来设置默认值。

但是需要注意默认值只有在设置@Optional 装饰器，并且确实没有找到该服务时才会生效，其余情况下是不会起作用的。

## useExisting vs useClass

[参考 Angular 的文档](https://angular.cn/guide/dependency-injection-providers)，可以更好的了解他两的区别。

解释 useExisting 和 useClass 的区别。

使用 useClass，只要 provide 的名字不一样，就算 useClass 指向的服务相同。那么也算是不同的服务，最终相当于得到了同一个服务的多个实例。

useExisting 则是刚好相反，即使 provide 不相同，但是只要 useExisting 指向的服务是存在的，则立即返回这个服务实例。并不会创建一个新的实例。

## 使用 InjectionKey 保留类型信息

[参考 Angular 的文档](https://angular.cn/guide/dependency-injection-providers#using-an-injectiontoken-object)

只不过语法稍微有些区别。

```ts
import { InjectionKey } from "@kaokei/use-vue-service";
type SomeServiceKey = InjectionKey<SomeService>;
const someServiceKey: SomeServiceKey = symbol();

// someService的类型就是SomeService
// 这就是InjectionKey所起到的作用
// 如果SomeService是一个类的话，其实是没有必要这样做的
// 但是如果SomeService是一个接口的话，则只能这样做才能保留类型信息
const someService = useService(someServiceKey);
```

## 根组件和根 Injector 的关系

前面的文章中一直有说到根组件和根 Injector 是绑定的，实际上这么描述是不够准确的。

本库自带了一个全局唯一的根 Injector，如果整个应用只有一个根组件，可以理解为根组件和根 Injector 是绑定的。

但是整个应用是可能有多个根组件的，在 vue 中，我们可以多次调用 createApp 来创建多个根组件。每个根组件都是独立的。这样就导致根 Injector 还是处在最顶层。我们可以手动调用

```
app1.use(本库);
app2.use(本库);
```

上面的代码的作用是手动给每个根组件绑定一个 Injector。这样就能做到某些服务只给某个 app 使用。

实际上我到现在都没有遇到过一个应用中有多个根组件的场景。所以也不用太关心这个问题。

## 禁止使用 watch

watch 有两个优势。

第一，watch 某个属性，属性变化时更新 10 个属性。如果通过 computed 来实现的话，就需要重复 10 遍代码。

第二，watch 某个属性，属性变化时执行某些副作用，比如请求某个 api、输出日志等。这种功能显然是不能通过 computed 来实现的。

既然如此，为什么还是不建议使用 watch 呢？

因为第一点出现的场景不会特别夸张，就算有 2，3 个属性共同依赖某个属性，那也是建议都写成 computed，而不是把更新逻辑放在 watch 中。

第二点我建议是在触发事件的地方去手动调用更新逻辑，而不是依赖数据驱动副作用。

总结以上两点的本质原因在于，我们可以利用数据驱动模版更新，但是我们不应该利用数据驱动其他副作用。

这涉及到心智模型的问题，我期望的心智模型是数据驱动模版，模版响应事件，在事件中修改数据，数据反过来又驱动模版更新。

这中间最多可以接受 computed 对数据层做一层聚合，但是仍然可以看作是数据层的一部分。

但是如果引入了 watch 就不一样了。因为它破坏了这个简单的心智模型。

第一点、数据变化了不仅仅会驱动模版更新，还会触发 watch 中定义的副作用，谁也不知道这个副作用最终又是怎么影响数据和模版的。

第二点、原本的逻辑是模版响应事件，我们直接在事件中更新数据，数据再反应到模版上。但是引入 watch 之后，我们可能会写出这样的代码：我们在事件中只会更新某个数据，然后在 watch 中观察这个数据，然后执行相应的副作用，最终修改了我们想要的数据，数据驱动模版更新。

很明显我们发现心智模型不一样了，变得更加复杂了。
