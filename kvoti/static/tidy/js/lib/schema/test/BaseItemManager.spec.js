import expect from 'expect';

import * as s from '../schema';

describe('BaseItemManager', () => {
  describe('#_validateUnique()', () => {
    it('should return an error if item is not unique', () => {
      let q = new s.ManagedObject(
        s.array(s.string({unique: true}))
      );
      q.managed.set(['a', 'a']);
      let errors = q.managed[0]._validateUnique();
      expect(errors).toEqual(['This is a duplicate value']);
    });

    it('should return an error if number item is not unique', () => {
      let q = new s.ManagedObject(
        s.array(s.integer({unique: true}))
      );
      q.managed.set([1, 1]);
      let errors = q.managed[0]._validateUnique();
      expect(errors).toEqual(['This is a duplicate value']);
    });
    
    it('should return an error if nested item is not unique', () => {
      let q = new s.ManagedObject(
        s.array(
          s.shape({
            text: s.string({unique: true})
          })
        )
      );
      q.managed.set([{text: 'a'}, {text: 'a'}]);
      let errors = q.managed[0].text._validateUnique();
      expect(errors).toEqual(['This is a duplicate value']);
    });

  });
});
