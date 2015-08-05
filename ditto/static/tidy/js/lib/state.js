// Wrap React.addons.update for common operations
//
// Use as follows
//
//   <input onChange={state.set.bind(this, ['some', 'part', 'of', 'state'])}
//
//
import React from 'react';

export const Arg = '__arg__';

export function set(...args) {
  let [path, e] = getChangePath(args);
  let value;
  if (!e.target) {
    value = e;
  } else if (e.target.type === 'checkbox' || e.target.type === 'radio') {
    value = e.target.checked;
  } else {
    value = e.target.value;
  }
  const change = getChangeSpec(path, '$set', value);
  console.log('change', change);
  this.setState((state) => {
    return React.addons.update(state, change);
  });
}

export function add(...args) {
  let [path, value] = getChangePath(args);
  const change = getChangeSpec(path, '$push', [value]);
  const newState = React.addons.update(this.state, change);
  this.setState(newState);
}

export function remove(...args) {
  let [path, index] = getChangePath(args);
  const change = getChangeSpec(path, '$splice', [[index, 1]]);
  const newState = React.addons.update(this.state, change);
  this.setState(newState);
}

function getChangePath(args) {
  console.log('path', args);
  let path = args[0];
  const last = args.pop();
  const params = args.slice(1);
  console.log(path, params, last);
  path = replaceParamsInPath(path, params);
  return [path, last];
}

function replaceParamsInPath(path, params) {
  console.log('replacing', path, params);
  let replaced = path.map(part => {
    if (part === Arg) {
      let replacement = params[0];
      params = params.slice(1);
      return replacement;
    }
    return part;
  });
  console.log('replaced', replaced, 'remaining', params);
  return replaced.concat(params);
}

function getChangeSpec(path, operation, value) {
  const change = {};
  let tmp = change;
  path.forEach(key => {
    tmp[key] = {};
    tmp = tmp[key];
  });
  tmp[operation] = value;
  console.log('change', change);
  return change;
}
