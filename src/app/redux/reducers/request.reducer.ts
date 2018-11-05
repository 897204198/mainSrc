import { RequestActions, DECREMENT, INCREMENT, RESET } from '../actions/request.action';

// 请求计数Reducer
export let requestReducer = (state: number = 0, action: RequestActions): number => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state === 0 ? state : state - 1;
    case RESET:
      return 0;
    default:
      return state;
  }
};
