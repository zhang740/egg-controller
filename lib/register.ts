import * as fs from 'fs';
import * as path from 'path';
import { Application } from 'egg';
import { getRoutes } from './route';
import { convertToOpenAPI } from './openapi';

export function registerRoute(app: Application) {
  const routeDatas: any = {};
  getRoutes()
    .sort((a, b) => {
      if (a.url === b.url) {
        return 0;
      }
      if (a.url === '/*') {
        return 1;
      }
      return a.url > b.url ? -1 : 1;
    })
    .forEach(route => {
      const routeData: any[] = routeDatas[route.typeGlobalName] = routeDatas[route.typeGlobalName] || [];

      // can't get params in url, when url is array. (chair? egg? koa?)
      const finalUrl = typeof route.url === 'function' ? route.url(app) : route.url;
      route.url = finalUrl;
      [].concat(finalUrl)
        .forEach(url => {
          const methods = [].concat(route.method || 'all');
          (app as any).register(
            url,
            methods,
            [].concat(
              ...route.middleware.map(m => m(app, route)).filter(m => m),
              route.call(),
            ).filter(m => typeof m === 'function'),
          );

          routeData.push({
            url: `${methods.map((m: string) => m.toUpperCase()).join('|')} ${url}`,
            path: `${route.typeGlobalName} -> ${route.functionName}`,
            name: route.name
          });
        });
    });

  fs.writeFileSync(
    path.join(app.baseDir, 'run', 'route_map.json'),
    JSON.stringify(routeDatas, null, 2), { encoding: 'utf8' }
  );

  const pkg = app.config.pkg;
  fs.writeFileSync(
    path.join(app.baseDir, 'run', 'openapi_3.json'),
    JSON.stringify(convertToOpenAPI({
      base: {
        title: pkg.name || app.config.name,
        version: pkg.version,
      },
      contact: {
        name: pkg.author,
        url: pkg.homepage,
        email: undefined,
      },
    }, getRoutes()), null, 2), { encoding: 'utf8' }
  );
}
