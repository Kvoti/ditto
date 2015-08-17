import expect from 'expect';

import * as proxies from '../proxies';
import * as s from '../schema';

describe('Item managers', () => {

  let tests = [
    {
      managerName: 'StringManager',
      mangagerClass: proxies.StringManager,
      schema: {value: s.string()},
      listSchema: {values: s.array(s.string())},
      validValue: 'hello world',
      invalidValue: null
    },
    {
      managerName: 'BoolManager',
      mangagerClass: proxies.BoolManager,
      schema: {value: s.bool()},
      listSchema: {values: s.array(s.bool())},
      validValue: true,
      invalidValue: 'hello world'
    },
    {
      managerName: 'IntegerManager',
      mangagerClass: proxies.IntegerManager,
      schema: {value: s.integer()},
      listSchema: {values: s.array(s.integer())},
      validValue: 10,
      invalidValue: 'hello world'
    },
    {
      managerName: 'ArrayManager',
      mangagerClass: proxies.ArrayManager,
      schema: {value: s.array(s.string())},
      listSchema: {values: s.array(s.array(s.integer()))},
      validValue: ['hi'],
      invalidValue: {}
    },
    {
      managerName: 'ShapeManager',
      mangagerClass: proxies.shapeManager,
      schema: {value: s.shape({text: s.string()})},
      listSchema: {values: s.array(s.shape({text: s.string()}))},
      validValue: {
        text: 'hello world'
      },
      invalidValue: 'hello'
    }
  ];

  tests.forEach(test => {
    describe(test.managerName, () => {

      describe('#set()', () => {
        it('should set the internal state', () => {
          let q = new s.Question(test.schema);
          q.value.set(test.validValue);
          expect(q.questionSpec.value).toEqual(test.validValue);
        });

        it('should throw an error if the value is not valid', () => {
          let q = new s.Question(test.schema);
          expect(() => q.value.set(test.invalidValue)).toThrow(/must be/);
        });

      });

      describe('#get()', () => {
        it('should get the internal state', () => {
          let q = new s.Question(test.schema);
          q.value.set(test.validValue);
          expect(q.value.get()).toEqual(test.validValue);
        });
      });
      
      describe('#remove()', () => {
        it('should throw an error if item not in a list', () => {
          let q = new s.Question(test.schema);
          q.value.set(test.validValue);
          expect(q.value.remove).toThrow(/not in a list/);
        });

        it('should remove item from parent list', () => {
          let q = new s.Question(test.listSchema);
          q.values.set([test.validValue]);
          expect(q.questionSpec.values).toEqual([test.validValue]);
          q.values[0].remove();
          expect(q.questionSpec.values.length).toBe(0);
        });
        
      });
      
    });
  });

  let pendingValueTests = [
    {
      managerName: 'StringManager',
      mangagerClass: proxies.StringManager,
      schema: {value: s.string()},
      listSchema: {values: s.array(s.string())},
      validValue: 'hello world',
      pendingValue: 'pending',
      invalidValue: null
    },
    {
      managerName: 'BoolManager',
      mangagerClass: proxies.BoolManager,
      schema: {value: s.bool()},
      validValue: true,
      pendingValue: false
    },
    {
      managerName: 'IntegerManager',
      mangagerClass: proxies.IntegerManager,
      schema: {value: s.integer()},
      validValue: 10,
      pendingValue: 15
    }
  ];

  pendingValueTests.forEach(test => {
    describe(test.managerName, () => {
      describe('#getPending()', () => {
        it('should return the pending value', () => {
          let q = new s.Question(test.schema);
          q.value.set(test.validValue);
          q.pend().value.set(test.pendingValue);
          expect(q.value.getPending()).toEqual(test.pendingValue);
        });
      });
    });
    
    describe(test.managerName, () => {
      describe('pending mode', () => {
        it('should not change the state', () => {
          let q = new s.Question(test.schema);
          q.pend().value.set(test.validValue);
          expect(q.questionSpec.value).toBe(undefined);
        });
        
        it('should store the pending change', () => {
          let q = new s.Question(test.schema);
          q.pend().value.set(test.validValue);
          expect(q.pendingChange).toEqual({path: ['value'], value: test.validValue});
        });

        it('should only allow one pending change', () => {
          let spec = {
              ...test.schema,
            otherText: s.string()
          };
          let q = new s.Question(spec);
          q.pend().value.set(test.validValue);
          expect(
            () => {
              q.pend().otherText.set('not allowed');
            }
          ).toThrow(/Cannot pend more than one change/);
        });
        
        it('should not allow changes to other state while change is pending', () => {
          let spec = {
              ...test.schema,
            otherText: s.string()
          };
          let q = new s.Question(spec);
          q.pend().value.set(test.validValue);
          expect(
            () => {
              q.otherText.set('not allowed');
            }
          ).toThrow(/while change is pending/);
        });
      });
    });
  });
});
