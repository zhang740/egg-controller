# egg-controller

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-controller.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-controller
[travis-image]: https://img.shields.io/travis/zhang740/egg-controller.svg?style=flat-square
[travis-url]: https://travis-ci.org/zhang740/egg-controller
[codecov-image]: https://codecov.io/github/zhang740/egg-controller/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/zhang740/egg-controller?branch=master
[david-image]: https://img.shields.io/david/zhang740/egg-controller.svg?style=flat-square
[david-url]: https://david-dm.org/zhang740/egg-controller
[snyk-image]: https://snyk.io/test/npm/egg-controller/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-controller
[download-image]: https://img.shields.io/npm/dm/egg-controller.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-controller

## Quick View

```ts
export class HomeController extends Controller {
  @route('/')
  hi() {
    return `hi, egg`;
  }
}
```

## 接入

### 安装 egg-controller 插件

```shell
tnpm i -S egg-controller
```

### 配置项目插件（plugin）

```ts
export default {
  ...
  aop: { // 需要同时开启，controller插件依赖
    enable: true,
    package: 'egg-aop',
  },
  controller: {
    enable: true,
    package: 'egg-controller',
  },
  ...
};
```

### 新项目使用

默认配置下，在 app/controller 中创建 controller 文件：

```ts
// 如果不需要访问ctx，则不需要继承
export class HomeController extends Controller {
  @route('/api/xxx', { name: '获取XXX数据' })
  async getXXX(size: number, page: number) {
    return 'homeIndex';
  }
}
```

### 路由定义

支持形式：

```ts
@route('/api/xxx') // 生成 GET /api/xxx
@route('POST /api/xxx') // 生成 POST /api/xxx，支持 GET/POST/PUT/DELETE/PATCH
@route('PUT /api/xxx', { name: '修改xxx' })
@route({ url: '/api/xxx', method: 'GET' name: '获取xxx' }) // 完整配置见下节
```

#### 完整配置：

```ts
export interface RouteMetadataType<ExtType = any> {
  /** 路由名称 */
  name?: string;
  /** 方法 */
  method?: MethodType | MethodType[];
  /** 路径 */
  url?: string | RegExp | string[] | RegExp[] | ((app: Application) => string);
  /** 路由描述，仅收集 */
  description?: string;
  /** 路由中间件 */
  middleware?: MiddlewareType[];
  /** 路由扩展信息，仅收集 */
  extInfo?: ExtType;
  /** 路由方法抛出异常时回调 */
  onError?: (ctx: Context, error: Error) => void;
  /** 是否使用RSA对参数解密，配合相关设置使用 */
  encrypt?: boolean;
}
```

#### 路由级中间件

函数类型跟 egg 定义稍有不同：

`(app: Application, typeInfo: RouteType) => (ctx: any, next: any) => any`

在路由定义的中间件跟全局的中间件区别在于范围，全局中间件更适合大规模的统一处理，用来统一处理特定业务功能接口就大材小用了，还需要设置过滤逻辑，甚至需要在 config 中设置黑白名单。而路由级中间件适合只有部分接口需要的统一处理，配合从 @route 上收集的类型信息处理更佳。

#### 参数解析

函数参数来源按顺序优先级从 param、query、body 获取，目前支持 Number 、 Date 、 Boolean 、 Object/any (自动尝试反序列化)  的格式化，支持 bracket 格式数组 query 传参。

插件还提供了 FromBody , FromParam , FromQuery , FromHeader 注解可限定参数的获取路径，并支持名称映射。

```ts
@route('/api/xxx/:id', { name: '获取xxx' })
async getXXX(
  id: number,
  @FromQuery('filter_type') // filter_type 映射
  filterType: string,
) {
  return this.xxxService.getXXX(id, filterType);
}
```

### 参数校验

有时参数是复杂对象为了防止恶意构造数据，需要对数据格式做深度检测，引入了参数校验库，[parameter](https://github.com/node-modules/parameter)，通过它来解决复杂的校验问题。

```ts
export class HomeController {
  @route('/api/xxx', { name: '获取XXX数据', validateMetaInfo: [{
    name: 'data',
    rule: {
      type: 'object',
      str: { type: 'string', max: 20 },
      count: { type: 'number', max: 10, required: false },
    },
   }] })
  async getXXX(data: { str: string, count?: number }>) {
    return data.str;
  }
}
```

### 方法返回值

不再需要 `this.ctx.body =` 的形式，直接 return 需要返回的结果即可，当返回不为 undefined 将会赋值给 `this.ctx.body` 。其他 `this.render` 等不变。

### 类级声明

使用 `@controller` 可对路由所属的类进行定义，支持类级中间件及 `RESTful` 风格支持。

[详细文档](/docs/controller.md)

## 已有项目接入

- 使用 @route() decorator 形式
- 替换掉原有的路由定义文件，每个 Controller 需要是类形式
- 将路由方法内获取参数代码去除，在函数参数部分声明路由参数
- 直接 return 返回结果替代 `this.ctx.body` 赋值

## 生成前端 SDK

支持模板生成，如果没有找到模板，会在 SDK 生成目录生成默认模板。
开发时
在配置中开启即可，根据需要自定义其他配置。
打包时
在配置中配置开启，则会在启动时生成，也可使用 `egg-controller gensdk` 命令手动生成前端 SDK。

[详细文档](/docs/gensdk.md)

## 运行时数据

应用启动后会在 `run/route_map.json` 写入路由信息，并输出符合 OpenAPI 3.0 标准的接口数据到 `run/openapi_3.json`

## 异常定义

在 `egg-controller/error` 下定义了一些基础异常类型，可直接使用，也可根据需求继承后使用。

| 类型                | 定义                                               |
| ------------------- | -------------------------------------------------- |
| `BadRequestError`   | 状态码 400                                         |
| `ForbiddenError`    | 状态码 403                                         |
| `NotFoundError`     | 状态码 404                                         |
| `UnauthorizedError` | 状态码 401                                         |
| `ServerError`       | 状态码 400(为了前端有错误 message)，realStatus 500 |

## 权限

权限可继承 BaseAuth ，实现自定义的权限拦截

```ts
export class NeedParamAuth extends BaseAuth {
  async has(id: string): Promise<boolean> {
    return id === '123';
  }
}

@controller({ prefix: '/auth' })
export class AuthController extends Controller {
  @route({ auth: [NeedParamAuth] })
  needParamOk(id: string) {}
}
```

## 插件默认配置（config）：

```ts
{
  ...
  controller: {
    /* 是否自动加载controller目录下的文件，require，不会挂载到ctx */
    autoLoad: true,
    /* controller路径，支持数组 */
    ctrlDir: path.join('app', 'controller') as string | string[],
    /* 是否开启参数校验 */
    paramValidate: true,
    /** 是否使用权限拦截 */
    auth: true,
    /* 生成前端SDK配置 */
    genSDK: {
      /* 是否开启，默认关闭 */
      enable: false,
      /* 针对需要生成SDK的路由的过滤正则，可针对路由url过滤 */
      filter: [/^\/api\//g] as RegExp[],

      // 其余继承自 https://github.com/zhang740/openapi-generator
    },
    /** api 信息上报 */
    apiReport: {
      enable: false,
      /** 发送地址, 数据格式 OpenAPI 3.0，PUT请求 */
      url: '',
    },
    /** 请求数据加密，配合 route 中 encrypt 设置 */
    encrypt: {
      publicKey: '',
      privateKey: '',
      /** PKCS8 | PKCS1 (default) */
      type: 'PKCS1',
    },
    /* 兼容选项 */
    compatible: {
      /**
       * 当controller没有修改ctx.body时返回404 (egg default)
       * 如果为false，将会返回204 (default)
       */
      ret404WhenNoBody: false,
    },
    routeRegister: (app: Application, route: RouteType) => {
      // 默认路由注册，可使用数据自定义注册方式，比如使用 egg-socket.io
      app.router.register(
        route.url as any,
        [].concat(route.method),
        [].concat(
          ...route.middleware.map(m => m(app, route)).filter(m => m),
          route.function,
        ) as any,
      );
    },
  },
 ...
}
```
