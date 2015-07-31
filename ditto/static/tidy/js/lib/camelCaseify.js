/**
* Recursively convert object keys to camelCase
*
* Python prefers underscores, javascript prefers camelCase.
* This utilty recursively converts object keys to camelCase for, say,
* passing API responses to React components.
*
*/
import objectWalk from 'object-walk';

export default function camelCaseify(obj) {
  objectWalk(obj, down);
}

function down(val, prop, obj) {
  if (prop.indexOf('_') !== -1) {
    obj[_camelCaseify(prop)] = obj[prop];
    delete obj[prop];
  }
}

function _camelCaseify(str) {
  return str.replace(/_([a-z])/, (m, p1) => p1.toUpperCase());
}
