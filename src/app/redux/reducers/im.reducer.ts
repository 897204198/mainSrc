import { ImActions, REPLACE } from '../actions/im.action';

// 请求计数Reducer
export let imReducer = (state: string = '', action: ImActions): string => {
  switch (action.type) {
    case REPLACE:
      return action.payload;
    default:
      return state;
  }
};
