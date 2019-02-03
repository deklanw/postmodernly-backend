import jsc from 'jsverify';
import { glue, portmanteau } from './portmanteau';

describe('Portmanteau glue', () => {
  it('Works for basic cases', () => {
    const output1 = glue('funhouse', 'housemaking');
    expect(output1).toMatchObject({
      maxN: 5,
      result: 'funhousemaking'
    });

    const output2 = glue('polar', 'larson');
    expect(output2).toMatchObject({
      maxN: 3,
      result: 'polarson'
    });

    const output3 = glue('', '');
    expect(output3).toMatchObject({
      maxN: 0,
      result: ''
    });

    const output4 = glue('unrelated', 'stuff');
    expect(output4).toMatchObject({
      maxN: 0,
      result: 'unrelatedstuff'
    });
  });

  it('Resulting length should be less than or equal to length of both strings combined.', () => {
    const lengthPropertyGlue = jsc.forall(
      'string',
      'string',
      (a: string, b: string) => {
        const { result } = glue(a, b);
        return result.length <= a.length + b.length;
      }
    );

    jsc.assert(lengthPropertyGlue);
  });
});

describe('Portmanteau proper', () => {
  it('Works for basic cases', () => {
    const output1 = portmanteau('', '');
    expect(output1).toEqual('');

    const output2 = portmanteau('abc', 'xyz');
    expect(output2).toEqual('abcxyz');

    const output3 = portmanteau('aab', 'baab');
    expect(output3).toEqual('baab');

    const output4 = portmanteau('funhouses', 'zhousemaking');
    expect(output4).toEqual('funhousemaking');

    const output5 = portmanteau('funhousess', 'fjhousemaking');
    expect(output5).toEqual('funhousemaking');
  });

  it('Resulting length should be less than or equal to length of both strings combined.', () => {
    const lengthPropertyMultiGlue = jsc.forall(
      'string',
      'string',
      (a: string, b: string) => {
        const result = portmanteau(a, b);
        return result.length <= a.length + b.length;
      }
    );
    jsc.assert(lengthPropertyMultiGlue);
  });
});
