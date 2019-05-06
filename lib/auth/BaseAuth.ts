import { Service } from 'egg';
import { getParameterNames } from '../util';

export abstract class BaseAuth extends Service {
  /** 权限名称 */
  static displayName: string;

  /** 判断是否符合角色 */
  abstract has(...args: any[]): Promise<boolean>;
}

export interface RoleMetaInfo {
  /** 需要参数名列表 */
  params: { name: string, required: boolean }[];
}

const infoSymbol = Symbol('InfoSymbol');
export function getRoleInfo(roleType: typeof BaseAuth): RoleMetaInfo {
  const desc = Object.getOwnPropertyDescriptor(roleType, infoSymbol);
  if (!desc) {
    const info: RoleMetaInfo = {
      params: getParameterNames(roleType.prototype.has).map(name => ({ name, required: true })),
    };
    Object.defineProperty(roleType, infoSymbol, {
      value: info,
    });
    return getRoleInfo(roleType);
  }
  return desc.value;
}

/** opt param for BaseAuth */
export function opt() {
  return (target, key, index): any => {
    const info = getRoleInfo(target.constructor);
    info.params[index].required = false;
  };
}
