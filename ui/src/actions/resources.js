import {
  SET_RESOURCE
} from '../constants/ActionTypes';

const defaultOptions = {
  headers: {Accept: 'application/json'},
  credentials: 'include'
}

/* ============================== 
 * Sync Actions
 * ============================== */

export const setResource = ({key, data}) => ({
  type: SET_RESOURCE,
  key,
  data
})

/* ============================== 
 * Thunks
 * ============================== */

// dispatch this action to get a resource from the server and dispatch the appropriate thunk
export const getResource = ({key, resource}) => (dispatch, getState) => {

  return fetch(resource, defaultOptions)
  .then(response => response.json())
  .then(json => {
    // dispatch an appropriate event based on `name`
    dispatch(setResource({key, data: json}))
  })
}
