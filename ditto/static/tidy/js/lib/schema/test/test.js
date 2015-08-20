import expect from 'expect';
import * as s from '../schema';

describe('ManagedObject', () => {
  describe('pending mode', () => {
    it('should not change the state', () => {
      let spec = s.string();
      let q = new s.ManagedObject(spec);
      q.pend().managed.set('hello world');
      expect(q._managedObject).toBe(undefined);
    });

    it('should store the pending change', () => {
      let spec = s.string();
      let q = new s.ManagedObject(spec);
      q.pend().managed.set('hello world');
      expect(q._pendingChange).toEqual({path: [], value: 'hello world'});
    });

    it('should only allow one pending change', () => {
      let spec = s.shape({
        text: s.string(),
        otherText: s.string()
      });
      let q = new s.ManagedObject(spec);
      q.pend().managed.text.set('hello world');
      expect(
        () => {
          q.pend().managed.otherText.set('not allowed');
        }
      ).toThrow(/Cannot pend more than one change/);
    });

    it('should not allow changes to other state while change is pending', () => {
      let spec = s.shape({
        text: s.string(),
        otherText: s.string()
      });
      let q = new s.ManagedObject(spec);
      q.pend().managed.text.set('hello world');
      expect(
        () => {
          q.managed.otherText.set('not allowed');
        }
      ).toThrow(/while change is pending/);
    });
  });
});
