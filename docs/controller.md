# 类级中间件

## 普通用法

可对类下所有路由方法生效。

```ts
@controller({ name: 'Test for @controller', prefix: '/api/ctrl', middleware: [ctrlMiddleware] })
export class CtrlController extends Controller {
  @route()
  hi(type: string) {
    return type;
  }
}
```

## RESTful 路由定义

路由规则参照：
[https://eggjs.org/zh-cn/basics/router.html](https://eggjs.org/zh-cn/basics/router.html)

使用 `@controller` 装饰器，配置参数 `restful: true`。

简单模式：

```ts
@controller({ name: 'Test rest for @controller', prefix: '/api/rest', restful: true })
export class RESTSimpleController extends Controller {
  index() {
    return 'index';
  }

  // 非约定名称将不会生成路由，只作为普通成员函数
  no() {
    return 'no';
  }
}
```

完整形式也可以继承 `RESTfulController`，会自动提示补全方法。

```ts
@controller({ name: 'Test rest for @controller', prefix: '/api/rest2', restful: true })
export class RESTFullController extends RESTfulController {
  @route({ url: '/api/rest2/custom' }) // 可覆盖路由定义
  index() {
    return 'index';
  }

  @route({ url: 'sub' }) // 相对路径，/api/test2/sub
  subRoute() {
    return 'subRoute';
  }

  new() {
    return 'new';
  }

  show(id: string) {
    return `show_${id}`;
  }

  edit(id: string) {
    return `edit_${id}`;
  }

  @route({ name: '创建' }) // 可写可不写，可提供其他路由信息
  create() {
    return 'create';
  }

  update(id: string) {
    return `update_${id}`;
  }

  destroy(id: string) {
    return `destroy_${id}`;
  }
}
```
