import { Action } from '@ngrx/store';

export const REPLACE = '[Todo] REPLACE';


// 替换原先的 TodoBadage
export class TodoReplaceBadageAction implements Action {
  readonly type = REPLACE;
  constructor(public payload: string) {}
}

export type TodoActions = TodoReplaceBadageAction
