import expect from 'expect';

import * as proxies from '../proxies';
import * as s from '../schema';

describe('Item managers', () => {

  let tests = [
    {
      managerName: 'StringManager',
      mangagerClass: proxies.StringManager,
      schema: s.string(),
      listSchema: s.array(s.string()),
      validValue: 'hello world',
      invalidValue: null
    },
    {
      managerName: 'BoolManager',
      mangagerClass: proxies.BoolManager,
      schema: s.bool(),
      listSchema: s.array(s.bool()),
      validValue: true,
      invalidValue: 'hello world'
    },
    {
      managerName: 'IntegerManager',
      mangagerClass: proxies.IntegerManager,
      schema: s.integer(),
      listSchema: s.array(s.integer()),
      validValue: 10,
      invalidValue: 'hello world'
    },
    {
      managerName: 'ArrayManager',
      mangagerClass: proxies.ArrayManager,
      schema: s.array(s.string()),
      listSchema: s.array(s.array(s.integer())),
      validValue: ['hi'],
      invalidValue: {}
    },
    {
      managerName: 'ShapeManager',
      mangagerClass: proxies.shapeManager,
      schema: s.shape({text: s.string()}),
      listSchema: s.array(s.shape({text: s.string()})),
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
          let q = new s.ManagedObject(test.schema);
          q.managed.set(test.validValue);
          expect(q._managedObject).toEqual(test.validValue);
        });

        it('should throw an error if the value is not valid', () => {
          let q = new s.ManagedObject(test.schema);
          expect(() => q.managed.set(test.invalidValue)).toThrow(/must be/);
        });

      });

      describe('#get()', () => {
        it('should get the internal state', () => {
          let q = new s.ManagedObject(test.schema);
          q.managed.set(test.validValue);
          expect(q.managed.get()).toEqual(test.validValue);
        });
      });
      
      describe('#remove()', () => {
        it('should throw an error if item not in a list', () => {
          let q = new s.ManagedObject(test.schema);
          q.managed.set(test.validValue);
          expect(q.managed.remove).toThrow(/not in a list/);
        });

        it('should remove item from parent list', () => {
          let q = new s.ManagedObject(test.listSchema);
          q.managed.set([test.validValue]);
          expect(q._managedObject).toEqual([test.validValue]);
          q.managed[0].remove();
          expect(q._managedObject.length).toBe(0);
        });
        
      });
      
    });
  });

  let pendingValueTests = [
    {
      managerName: 'StringManager',
      mangagerClass: proxies.StringManager,
      schema: s.string(),
      validValue: 'hello world',
      pendingValue: 'pending',
      invalidValue: null
    },
    {
      managerName: 'BoolManager',
      mangagerClass: proxies.BoolManager,
      schema: s.bool(),
      validValue: true,
      pendingValue: false
    },
    {
      managerName: 'IntegerManager',
      mangagerClass: proxies.IntegerManager,
      schema: s.integer(),
      validValue: 10,
      pendingValue: 15
    }
  ];

  pendingValueTests.forEach(test => {
    describe(test.managerName, () => {
      describe('#getPending()', () => {
        it('should return the pending value', () => {
          let q = new s.ManagedObject(test.schema);
          q.managed.set(test.validValue);
          q.pend().managed.set(test.pendingValue);
          expect(q.managed.getPending()).toEqual(test.pendingValue);
        });
      });
    });
    
    describe(test.managerName, () => {
      describe('pending mode', () => {
        it('should not change the state', () => {
          let q = new s.ManagedObject(test.schema);
          q.pend().managed.set(test.validValue);
          expect(q._managedObject).toBe(undefined);
        });
        
        it('should store the pending change', () => {
          let q = new s.ManagedObject(test.schema);
          q.pend().managed.set(test.validValue);
          expect(q._pendingChange).toEqual({path: [], value: test.validValue});
        });

        it('should only allow one pending change', () => {
          let spec = s.shape({
            orig: test.schema,
            otherText: s.string()
          });
          let q = new s.ManagedObject(spec);
          q.pend().managed.orig.set(test.validValue);
          expect(
            () => {
              q.pend().managed.otherText.set('not allowed');
            }
          ).toThrow(/Cannot pend more than one change/);
        });

        it('should not allow changes to other state while change is pending', () => {
          let spec = s.shape({
            orig: test.schema,
            otherText: s.string()
          });
          let q = new s.ManagedObject(spec);
          q.pend().managed.orig.set(test.validValue);
          expect(
            () => {
              q.managed.otherText.set('not allowed');
            }
          ).toThrow(/while change is pending/);
        });
      });
    });
  });
});
