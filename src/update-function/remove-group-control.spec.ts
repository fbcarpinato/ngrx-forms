import { cast } from '../state';
import { removeGroupControl } from './remove-group-control';
import { FormGroupValue, INITIAL_STATE } from './test-util';

describe(removeGroupControl.name, () => {
  it('should call reducer for groups', () => {
    const resultState = removeGroupControl<FormGroupValue>('inner3')(INITIAL_STATE);
    expect(resultState).not.toBe(cast(INITIAL_STATE));
  });

  it('should call reducer for groups uncurried', () => {
    const resultState = removeGroupControl<FormGroupValue>('inner3', INITIAL_STATE);
    expect(resultState).not.toBe(cast(INITIAL_STATE));
  });

  it('should throw if curried and no state', () => {
    expect(() => removeGroupControl<FormGroupValue>('inner3')(undefined as any)).toThrowError();
  });
});
