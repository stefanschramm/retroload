import {InternalError} from '../exception.js';

export class AbstractAdapter {
  static getTargetName() {
    throw new InternalError('getTargetName() not implemented!');
  }
  static getOptions() {
    return [];
  }
}
