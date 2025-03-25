import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import schoolReducer from "./SchoolSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
