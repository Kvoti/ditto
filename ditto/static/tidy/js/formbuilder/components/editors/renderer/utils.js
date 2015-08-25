import classNames from 'classnames';

export function controlRowErrorClassNames(errors, extraClassNames) {
  let validationStatus;
  if (errors !== null) {
    validationStatus = errors.length ? 'error' : 'success';
  }
  return classNames(
    {
      'has-feedback': validationStatus,
      [`has-${validationStatus}`]: validationStatus,
      ...extraClassNames
    }
  );
}
