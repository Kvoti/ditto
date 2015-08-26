import objectWalk from 'object-walk';

export function strToUnderscore(str) {
  return str.replace(/([A-Z])/, (m, p1) => '_' + p1.toLowerCase());
}

export function strToCamelCase(str) {
  return str.replace(/_([a-z])/, (m, p1) => p1.toUpperCase());
}

export function objToCamelCase(obj) {
  walk(obj, strToCamelCase);
}

export function objToUnderscore(obj) {
  console.log('underscore', obj);
  walk(obj, strToUnderscore);
  console.log('underscore', obj);
}

function walk(obj, convert) {
  objectWalk(
    obj,
    function down(val, prop, child) {
      let converted = convert(prop);
      if (converted !== prop) {
        child[converted] = child[prop];
        delete child[prop];
      }
    }
  );
}
