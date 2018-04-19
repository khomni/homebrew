/* ============================== 
 * Reducers:
 * ============================== */

import { combineReducers } from 'redux'
import {
  SET_SESSION, // sets all session information at once
  SET_JWT,
  SET_USER,
  SET_CHARACTER,
  SET_CAMPAIGN,
} from '../constants/ActionTypes'

import resources from './resources';

const initialState = {
  jwt: null,
  user: null,
  character: null,
  campaign: null,
}

const session = (state = initialState, action) => {
  switch(action.type) {
    case SET_SESSION:
      // returns the entire session, without merging to existing state
      return action.session
      // return {...state, ...action.session}
    case SET_JWT:
      return {...state, jwt: action.jwt}
    case SET_USER:
      return {...state, user: action.user}
    case SET_CHARACTER:
      return {...state, character: action.character}
    case SET_CAMPAIGN:
      return {...state, campaign: action.campaign}
    default:
      return state
  }
}

const reducers = combineReducers({
  resources,
  session,
})

export default reducers 

