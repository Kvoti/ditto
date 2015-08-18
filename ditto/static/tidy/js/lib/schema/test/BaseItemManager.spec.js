import expect from 'expect';

import * as s from '../schema';

describe('BaseItemManager', () => {
  describe('#_validateUnique()', () => {
    it('should return an error if item is not unique', () => {
      let q = new s.Question({
        items: s.array(s.string({unique: true}))
      });
      q.items.set(['a', 'a']);
      let errors = q.items[0]._validateUnique();
      expect(errors).toEqual(['This is a duplicate value']);
    });

    it('should return an error if nested item is not unique', () => {
      let q = new s.Question({
        items: s.array(
          s.shape({
            text: s.string({unique: true})
          })
        )
      });
      q.items.set([{text: 'a'}, {text: 'a'}]);
      let errors = q.items[0].text._validateUnique();
      expect(errors).toEqual(['This is a duplicate value']);
    });

  });
});
