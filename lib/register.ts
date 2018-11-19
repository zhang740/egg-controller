import * as fs from 'fs';
import * as path from 'path';
import { Application } from 'egg';
import { getRoutes, getControllers } from './controller';
import { convertToOpenAPI } from './openapi';
import * as request from 'request';

export function registerRoute(app: Application) {
  const config = app.config.controller;

  const routeDatas: any = {};
  getControllers(app.config)
    .forEach(ctrl => {
      ctrl.routes.sort((a, b) => {
        return a.url > b.url ? -1 : 1;
      }).forEach(route => {
        const routeData: any[] = routeDatas[route.typeGlobalName] = routeDatas[route.typeGlobalName] || [];

        [].concat(route.url)
          .forEach(url => {
            config.routeRegister(app, route);

            routeData.push({
              url: `${[].concat(route.method).map((m: string) => m.toUpperCase()).join('|')} ${url}`,
              function: `${route.typeGlobalName} -> ${route.functionName}`,
              path: `${ctrl.filePath}`,
              name: route.name
            });
          });
      });
    });

  fs.writeFileSync(
    path.join(app.baseDir, 'run', 'route_map.json'),
    JSON.stringify(routeDatas, null, 2), { encoding: 'utf8' }
  );

  const pkg = app.config.pkg;

  const openAPIInfo = convertToOpenAPI({
    base: {
      title: pkg.name || app.config.name,
      version: pkg.version,
    },
    contact: {
      name: pkg.author,
      url: pkg.homepage,
      email: undefined,
    },
  }, getRoutes(app.config));

  fs.writeFileSync(
    path.join(app.baseDir, 'run', 'openapi_3.json'),
    JSON.stringify(openAPIInfo, null, 2), { encoding: 'utf8' }
  );

  if (config.apiReport.enable) {
    if (!config.apiReport.url) {
      throw new Error('[egg-controller] no apiReport url.');
    }

    request({
      url: config.apiReport.url,
      method: 'PUT',
      json: true,
      headers: {
        'accepts': 'applicaton/json',
        'content-type': 'application/json',
      },
      body: { data: openAPIInfo },
    }, (err, res, body) => {
      if (err || `${res.statusCode}`[0] !== '2') {
        console.warn('[egg-controller] API info report fail.', res.statusCode, body, err);
      } else {
        console.log('[egg-controller] API info report success.', res.statusCode);
      }
    });

  }

}
