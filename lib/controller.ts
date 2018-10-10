import { getValue } from './util';

export interface CtrlMetadata {
  name?: string;
  description?: string;
  /** prefix for @route url */
  prefix?: string;
}

const CtrlMetaSymbol = Symbol('CtrlMetaSymbol');

export function controller(meta: CtrlMetadata = {}) {
  return (target) => {
    Object.defineProperty(target, CtrlMetaSymbol, {
      enumerable: false,
      configurable: false,
      value: meta,
    });
  };
}

export function getControllerMetadata(CtrlType: any) {
  return getValue<CtrlMetadata>(
    () => Object.getOwnPropertyDescriptor(CtrlType, CtrlMetaSymbol).value
  );
}
