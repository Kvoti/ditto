import expect from 'expect';
import * as s from '../schema';

describe('Question', () => {
  describe('pending mode', () => {
    it('should not change the state', () => {
      let spec = {
        text: s.string()
      };
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(q.questionSpec.text).toBe(undefined);
    });
    
    it('should store the pending change', () => {
      let spec = {
        text: s.string()
      };
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(q.pendingChange).toEqual({path: ['text'], value: 'hello world'});
    });

    it('should only allow one pending change', () => {
      let spec = {
        text: s.string(),
        otherText: s.string()
      };
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(
        () => {
          q.pend().otherText.set('not allowed');
        }
      ).toThrow(/Cannot pend more than one change/);
    });
    
    it('should not allow changes to other state while change is pending', () => {
      let spec = {
        text: s.string(),
        otherText: s.string()
      };
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(
        () => {
          q.otherText.set('not allowed');
        }
      ).toThrow(/while change is pending/);
    });

  });
});
