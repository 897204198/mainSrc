import { Action } from '@ngrx/store';

export const INCREMENT = '[Request] INCREMENT';
export const DECREMENT = '[Request] DECREMENT';
export const RESET = '[Request] RESET';

// 增加请求计数
export class RequestIncrementAction implements Action {
  readonly type = INCREMENT;
}

// 减少请求计数
export class RequestDecrementAction implements Action {
  readonly type = DECREMENT;
}

// 重置请求计数
export class RequestResetAction implements Action {
  readonly type = RESET;
}

export type RequestActions = RequestIncrementAction
  | RequestDecrementAction
  | RequestResetAction;
