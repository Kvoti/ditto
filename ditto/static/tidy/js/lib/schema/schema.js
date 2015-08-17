import * as managers from './proxies';

export function array(item, options={}) {
  return function _array(question, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ArrayManager(question, parent, basePath, key, item, options);
    return parent[key];
  };
}

export function shape(args) {
  return function _shape(question, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ShapeManager(question, parent, basePath, key, args);
    return parent[key];
  };
}

export function string(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(question, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.StringManager(question, parent, basePath, key, options);
    return parent[key];
  };
}

export function bool(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(question, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.BoolManager(question, parent, basePath, key, options);
    return parent[key];
  };
}

export function integer(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(question, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.IntegerManager(question, parent, basePath, key, options);
    return parent[key];
  };
}

export * from './Question';
