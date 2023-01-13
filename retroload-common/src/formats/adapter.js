export class AbstractAdapter {
  static getTargetName() {
    throw new Error('getTargetName() not implemented!');
  }
  static getOptions() {
    return [];
  }
}
