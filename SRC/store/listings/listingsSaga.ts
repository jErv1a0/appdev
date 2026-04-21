import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchListingsApi, Listing } from '../../api/listingsApi';
import {
  FETCH_LISTINGS_REQUEST,
  fetchListingsFailure,
  fetchListingsSuccess,
} from './listingsReducer';

function* fetchListingsWorker() {
  try {
    const listings: Listing[] = yield call(fetchListingsApi);
    yield put(fetchListingsSuccess(listings));
  } catch (error: any) {
    const message = error?.body?.error || error?.message || 'Failed to fetch listings';
    yield put(fetchListingsFailure(String(message)));
  }
}

export default function* listingsSaga() {
  yield takeLatest(FETCH_LISTINGS_REQUEST, fetchListingsWorker);
}
