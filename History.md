# 0.3.33 / 2019-11-29

- update: support index type for OAS.

# 0.3.32 / 2019-11-28

- update: transfomer support Set<?>

# 0.3.31 / 2019-10-09

- fix: parameter data to schema.

# 0.3.30 / 2019-09-03

- update: support circular dependencies for transform.

# 0.3.28 / 2019-06-27

- fix: oas3 data with reference type.

# 0.3.26 / 2019-06-25

- fix: response parse type.

# 0.3.25 / 2019-06-22

- update: warn -> log when validate info is invalid.

# 0.3.24 / 2019-06-17

- update: filter invalid param validate info.

# 0.3.23 / 2019-05-23

- fix: param location infer fail, openapi.
- test: update openapi test.

# 0.3.22 / 2019-05-06

- update: split before/after function of transformer.
- update: export @opt of BaseAuth.

# 0.3.21 / 2019-05-05

- feat: opt param for auth.

# 0.3.19 / 2019-03-19

- feat: auth intercept.

# 0.3.18 / 2019-03-07

- update: gen all controller when someone changed. (typings for API need scan all controllers.)

# 0.3.17 / 2019-02-23

- update: fork support config.

# 0.3.15 / 2019-02-23

- fix: getSchemaByType.

# 0.3.14 / 2019-02-19

- update: add all schemas for openapi data.

# 0.3.13 / 2019-02-19

- fix: response type parse.

# 0.3.11 / 2019-02-19

- update: response schema parse.

# 0.3.10 / 2019-02-13

- feat: @controller support sub route.

# 0.3.9 / 2019-01-04

- update: response transformer support 'required' info.

# 0.3.8 / 2018-12-28

- fix: param type format of 'boolean' type.

# 0.3.7 / 2018-12-27

- fix: param type format.

# 0.3.6 / 2018-12-24

- feat: add transformer to provide response schema data.

# 0.3.5 / 2018-12-12

- update: OpenAPI, can't create ReqType.
- chore: add prettier

# 0.3.4 / 2018-11-20

- fix: required info for OpenAPI schema data.

# 0.3.3 / 2018-11-19

- feat: expose route register function.

# 0.3.2 / 2018-11-15

- update: support OpenAPI body type.

# 0.3.1 / 2018-11-14

- fix: not remove file when watch file change.
- feat: support openapi-generator hook.

# 0.3.0 / 2018-11-14

- feat: use openapi-generator for gensdk.

# 0.2.13 / 2018-10-18

- fix: parse path error, when path is a function.

# 0.2.12 / 2018-10-18

- feat: complete param from path.

# 0.2.11 / 2018-10-16

- feat: route sort in the same controller.

# 0.2.10 / 2018-10-16

- test: add open api test.
- feat: OpenAPI data add operationId.

# 0.2.9 / 2018-10-15

- docs: update.
- feat: controller level middleware & RESTful style controller.
- feat: api info report.

# 0.2.8 / 2018-10-10

- feat: add @controller, lazy complete route url.
- feat: improve param info for OpenAPI.

# 0.2.7 / 2018-10-10

- feat: add gen OpenAPI json schema data.
- update: refactor formatArg.
- fix: gen sdk when ctrlDir is array.
- refactor: name and method detect.
- feat: upgrade parameter.

# 0.2.6 / 2018-09-05

- update: load config without app.
- feat: add encrypt for api.

# 0.2.5 / 2018-08-22

- update: split gen sdk to api-gensdk.

# 0.2.4 / 2018-08-20

- init: split from egg-typed.
