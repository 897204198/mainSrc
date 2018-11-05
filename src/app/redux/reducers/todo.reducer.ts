import { TodoActions, REPLACE } from '../actions/todo.action';

// 请求计数Reducer
export let todoReducer = (state: string = '', action: TodoActions): string => {
  switch (action.type) {
    case REPLACE:
      return action.payload;
    default:
      return state;
  }
};
