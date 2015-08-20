import expect from 'expect';

import * as s from '../schema';

describe('ShapeManager', () => {
  it('should throw an error if shape properties clash with api methods', () => {
    expect(
      () => {
        new s.ManagedObject(
          s.shape({members: s.string()})
        );
      }
    ).toThrow('Cannot have property');
  });

  it('should throw an error if shape properties clash with private properties', () => {
    expect(
      () => {
        new s.ManagedObject(
          s.shape({_checkValue: s.string()})
        );
      }
    ).toThrow('Cannot have property');
  });
});
