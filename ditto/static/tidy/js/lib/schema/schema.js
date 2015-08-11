import * as managers from './proxies';

export function array(item, options) {
  return function _array(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new managers.ArrayManager(question, chain, basePath, name, item, options);
    return chain[name];
  };
}

export function shape(args) {
  return function _shape(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new managers.ShapeManager(question, chain, basePath, name, args);
    return chain[name];
  };
}

export function string(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new managers.StringManager(question, basePath, options);
    return chain[name];
  };
}

export function bool(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new managers.BoolManager(question, basePath, options);
    return chain[name];
  };
}

export * from './Question';
