# 生成前端 SDK

既然我们已经收集到了足够的信息，我们可以根据这些信息轻松的生成前端调用 SDK。

这个功能默认是关闭的，开启相关配置：

```ts
{
  controller: {
    genSDK: {
      enable: true,
      /** 生成SDK的位置 */
      sdkDir: path.join('app', 'assets', 'service'),
      /** 路由过滤方法，默认只生成 '/api' 开头的路由 */
      filter: [/^\/api\//g],
      /** 默认使用ts，会生成类型定义，可选js */
      type: 'ts',
      /** service 生成风格，支持 class | function */
      serviceType: 'class',
      /** 类、文件名风格，支持大驼峰、下划线连字符、小驼峰 true | false | lower */
      camelCase: true,
      hook: {
        /** 替换名称 */
        customClassName: name => name.replace('Controller', 'Service'),
      },
      /** 其余属性参见 https://github.com/zhang740/openapi-generator */
      ...
    },
    ...
  }
  ...
}
```

可根据需要在不同环境下配置开启，由于是自动生成代码，推荐在 `config.local.ts` 配置中开启，并将除模板、基础代码以外的自动生成代码加入 git ignore。在编译打包环境可加入 `egg-controller gensdk` 手动全量生成 SDK。

## 注意事项

- 生成代码时会 `require` 相关 `controller` 文件，请确保在相应环境下不会报错（尽量不要写文件模块级别执行代码）。
