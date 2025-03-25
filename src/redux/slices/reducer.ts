import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import schoolReducer from "./schoolSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
