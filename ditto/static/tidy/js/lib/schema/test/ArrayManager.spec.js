import expect from 'expect';

import * as s from '../schema';

describe('ArrayManager', () => {
  describe('#reorder()', () => {
    it('should reorder simple items', () => {
      let q = new s.Question({
        items: s.array(s.string())
      });
      q.items.set(['a', 'b', 'c']);
      q.items.reorder([2, 1, 0]);
      expect(q.questionSpec.items).toEqual(['c', 'b', 'a']);
    });

    it('should reorder composite items', () => {
      let q = new s.Question({
        items: s.array(s.shape({text: s.string()}))
      });
      q.items.set([{text: 'hello'}, {text: 'world'}]);
      q.items.reorder([1, 0]);
      expect(q.questionSpec.items).toEqual([
        {text: 'world'},
        {text: 'hello'}
      ]);
    });
  });
});
