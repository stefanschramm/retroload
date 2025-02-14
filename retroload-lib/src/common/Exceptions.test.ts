import {
  FormatNotFoundError,
  InternalError,
  InvalidArgumentError,
  MissingOptionsError,
  UsageError,
} from './Exceptions.js';
import {describe, expect, test} from 'vitest';
import {type ArgumentOptionDefinition} from '../encoding/Options.js';

describe('Instantiation of exceptions', () => {
  test('UsageError', () => {
    const e = new UsageError('Example');
    expect(e).toBeInstanceOf(UsageError);
  });

  test('InternalError', () => {
    const e = new InternalError('Example');
    expect(e).toBeInstanceOf(InternalError);
  });

  test('FormatNotFoundError', () => {
    const e = new FormatNotFoundError('exampleformat');
    expect(e).toBeInstanceOf(FormatNotFoundError);
  });

  test('MissingOptionsError', () => {
    const optionDefinition: ArgumentOptionDefinition<string> = {
      name: 'exampleoption',
      label: 'Example option label',
      description: 'example option description',
      type: 'text',
      common: false,
      parse: (v) => v,
      required: false,
    };
    const e = new MissingOptionsError([optionDefinition]);
    expect(e).toBeInstanceOf(MissingOptionsError);
  });

  test('InvalidArgumentError', () => {
    const e = new InvalidArgumentError('exampleoption', 'Example error for exampleoption.');
    expect(e).toBeInstanceOf(InvalidArgumentError);
  });
});
