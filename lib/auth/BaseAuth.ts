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
  params: string[];
}

const infoSymbol = Symbol('InfoSymbol');
export function getRoleInfo(roleType: typeof BaseAuth): RoleMetaInfo {
  const desc = Object.getOwnPropertyDescriptor(roleType, infoSymbol);
  if (!desc) {
    const info: RoleMetaInfo = {
      params: getParameterNames(roleType.prototype.has).map(name => name),
    };
    Object.defineProperty(roleType, infoSymbol, {
      value: info,
    });
    return getRoleInfo(roleType);
  }
  return desc.value;
}
