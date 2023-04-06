import {
  FormatAutodetectionFailedError,
  FormatNotFoundError,
  InternalError,
  InvalidArgumentError,
  MissingOptionsError,
  TargetMachineNotFoundError,
  UsageError,
} from '../Exceptions.js';
import {Option} from '../Options.js';

describe('Instantiation of exceptions', () => {
  test('UsageError', () => {
    const e = new UsageError('Example');
  });

  test('InternalError', () => {
    const e = new InternalError('Example');
  });

  test('InternalError', () => {
    const e = new FormatAutodetectionFailedError();
  });

  test('FormatNotFoundError', () => {
    const e = new FormatNotFoundError('exampleformat');
  });

  test('TargetMachineNotFoundError', () => {
    const e = new TargetMachineNotFoundError('examplemachine', 'exampleformat');
  });

  test('MissingOptionsError', () => {
    const e = new MissingOptionsError([new Option('exampleoption', 'Example option label', 'Example option description')]);
  });

  test('InvalidArgumentError', () => {
    const e = new InvalidArgumentError('exampleoption', 'Example error for exampleoption.');
  });
});
