import { BaseCustomError } from './base';

export class ServerError extends BaseCustomError {
  get status() { return 400; }
  get realStatus() { return 500; }

}
