import { all } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import listingsSaga from './listings/listingsSaga';

export default function* rootSaga() {
  yield all([authSaga(), listingsSaga()]);
}
