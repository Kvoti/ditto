import * as managers from './proxies';

export function array(item, options={}) {
  return function _array(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ArrayManager(managedObject, parent, basePath, item, options);
    return parent[key];
  };
}

export function shape(args) {
  return function _shape(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ShapeManager(managedObject, parent, basePath, args);
    return parent[key];
  };
}

export function string(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.StringManager(managedObject, parent, basePath, options);
    return parent[key];
  };
}


export function scoregroup(labels, noOfItems, options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ScoreGroupManager(
      managedObject, parent, basePath, labels, noOfItems, options
    );
    return parent[key];
  };
}

export function choice(choices, options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.ChoiceManager(managedObject, parent, basePath, choices, options);
    return parent[key];
  };
}

export function multichoice(choices, options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.MultiChoiceManager(managedObject, parent, basePath, choices, options);
    return parent[key];
  };
}

export function bool(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.BoolManager(managedObject, parent, basePath, options);
    return parent[key];
  };
}

export function integer(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  return function _string(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.IntegerManager(managedObject, parent, basePath, options);
    return parent[key];
  };
}

export function nullValue() {
  return function _null(managedObject, parent, basePath) {
    let key = basePath[basePath.length - 1];
    parent[key] = new managers.NullManager(managedObject, parent, basePath, options);
    return parent[key];
  };
}

export * from './ManagedObject';
