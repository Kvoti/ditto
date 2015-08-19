import expect from 'expect';

import * as s from '../schema';

describe('ArrayManager', () => {
  describe('#reorder()', () => {
    it('should reorder simple items', () => {
      let q = new s.ManagedObject(
        s.array(s.string())
      );
      q.managed.set(['a', 'b', 'c']);
      expect(q._objectSpec).toEqual(['a', 'b', 'c']);
      q.managed.reorder([2, 1, 0]);
      expect(q._objectSpec).toEqual(['c', 'b', 'a']);
    });

    it('should reorder composite items', () => {
      let q = new s.ManagedObject(
        s.array(s.shape({text: s.string()}))
      );
      q.managed.set([{text: 'hello'}, {text: 'world'}]);
      q.managed.reorder([1, 0]);
      expect(q._objectSpec).toEqual([
        {text: 'world'},
        {text: 'hello'}
      ]);
    });
  });
});
