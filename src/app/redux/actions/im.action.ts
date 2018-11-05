import { Action } from '@ngrx/store';

export const REPLACE = '[Im] REPLACE';


// 替换原先的 ImBadage
export class ImReplaceBadageAction implements Action {
  readonly type = REPLACE;
  constructor(public payload: string) {}
}

export type ImActions = ImReplaceBadageAction
