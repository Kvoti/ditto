import expect from 'expect';
import * as s from '../schema';

describe('StringManager', () => {
  describe('#set()', () => {
    it('should set the internal state', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.text.set('hello world');
      expect(q.state.text).toBe('hello world');
    });

    it('should check the value is a string', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      expect(() => q.text.set({})).toThrow(/must be a string/);
    });

    it('should have an error if the string is too long', () => {
      let spec = s.question({
        text: s.string({maxLength: 5})
      });
      let q = new s.Question(spec);
      q.text.set('hello world');
      expect(q.text.errors.length).toBe(1);
      expect(q.text.errors[0]).toEqual('String is too long');
      
    });
    
  });

  describe('#get()', () => {
    it('should get the internal state', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.text.set('hello world');
      expect(q.text.get()).toBe('hello world');
    });
  });

  describe('#getPending()', () => {
    it('should return the pending value', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.text.set('hello world');
      q.pend().text.set('pending change').unpend();
      expect(q.text.getPending()).toBe('pending change');
    });
  });
  
});


describe('Question', () => {
  describe('pending mode', () => {
    it('should not change the state', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(q.state.text).toBe(undefined);
    });
    
    it('should store the pending change', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(q.pendingChange).toEqual({path: ['text'], value: 'hello world'});
    });
    
    it('can only be entered once', () => {
      let spec = s.question({
        text: s.string()
      });
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(
        () => {
          q.pend().text.set('not allowed');
        }
      ).toThrow('Already pending');
    });

    it('should only allow one pending change', () => {
      let spec = s.question({
        text: s.string(),
        otherText: s.string()
      });
      let q = new s.Question(spec);
      q.pend().text.set('hello world');
      expect(
        () => {
          q.otherText.set('not allowed');
        }
      ).toThrow(/Cannot pend more than one/);
    });
    
    it('should not allow changes to other state while change is pending', () => {
      let spec = s.question({
        text: s.string(),
        otherText: s.string()
      });
      let q = new s.Question(spec);
      q.pend().text.set('hello world').unpend();
      expect(
        () => {
          q.otherText.set('not allowed');
        }
      ).toThrow(/while change is pending/);
    });

  });
});
