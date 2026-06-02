import { stringifyBigInt } from './bigint.util';

describe('stringifyBigInt', () => {
  it('recursively converts bigint values to strings', () => {
    expect(stringifyBigInt({ id: 1n, list: [{ id: 2n }] })).toEqual({
      id: '1',
      list: [{ id: '2' }],
    });
  });
});
