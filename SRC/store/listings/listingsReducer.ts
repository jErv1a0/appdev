import { Listing } from '../../api/listingsApi';

export const FETCH_LISTINGS_REQUEST = 'listings/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'listings/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_FAILURE = 'listings/FETCH_LISTINGS_FAILURE';

interface FetchListingsRequestAction {
  type: typeof FETCH_LISTINGS_REQUEST;
}

interface FetchListingsSuccessAction {
  type: typeof FETCH_LISTINGS_SUCCESS;
  payload: Listing[];
}

interface FetchListingsFailureAction {
  type: typeof FETCH_LISTINGS_FAILURE;
  payload: string;
}

export type ListingsAction =
  | FetchListingsRequestAction
  | FetchListingsSuccessAction
  | FetchListingsFailureAction;

export interface ListingsState {
  items: Listing[];
  loading: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  items: [],
  loading: false,
  error: null,
};

export function fetchListingsRequest(): FetchListingsRequestAction {
  return { type: FETCH_LISTINGS_REQUEST };
}

export function fetchListingsSuccess(payload: Listing[]): FetchListingsSuccessAction {
  return { type: FETCH_LISTINGS_SUCCESS, payload };
}

export function fetchListingsFailure(payload: string): FetchListingsFailureAction {
  return { type: FETCH_LISTINGS_FAILURE, payload };
}

export default function listingsReducer(
  state: ListingsState = initialState,
  action: ListingsAction,
): ListingsState {
  switch (action.type) {
    case FETCH_LISTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LISTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload,
      };
    case FETCH_LISTINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
