// store.ts
import { createStore } from "redux";
import { User } from "./model"; // import User interface from model.ts

// Define the state type using User interface or null
interface RootState {
  user: User | null;
}

// Define action types using User interface for payloads
interface SetUserAction {
  type: "SET_USER";
  payload: User;
}

interface ClearUserAction {
  type: "CLEAR_USER";
}

type Action = SetUserAction | ClearUserAction;

// Initial state
const defaultState: RootState = {
  user: null,
};

// Reducer function with proper types
const rootReducer = (state = defaultState, action: Action): RootState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "CLEAR_USER":
      return { ...state, user: null };
    default:
      return state;
  }
};

// Create the Redux store with the typed reducer
const store = createStore(rootReducer);

export default store;