import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import listingsReducer from './listings/listingsReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  listings: listingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
