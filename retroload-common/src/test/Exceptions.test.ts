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
    new UsageError('Example');
  });

  test('InternalError', () => {
    new InternalError('Example');
  });

  test('InternalError', () => {
    new FormatAutodetectionFailedError();
  });

  test('FormatNotFoundError', () => {
    new FormatNotFoundError('exampleformat');
  });

  test('TargetMachineNotFoundError', () => {
    new TargetMachineNotFoundError('examplemachine', 'exampleformat');
  });

  test('MissingOptionsError', () => {
    new MissingOptionsError([new Option('exampleoption', 'Example option label', 'Example option description')]);
  });

  test('InvalidArgumentError', () => {
    new InvalidArgumentError('exampleoption', 'Example error for exampleoption.');
  });
});
