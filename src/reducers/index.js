/* ============================== 
 * Reducers:
 * ============================== */

import { combineReducers } from 'redux'
import {
  SET_USER,
  SET_CHARACTER,
  SET_CAMPAIGN,
} from '../constants/ActionTypes'

// const reducers = combineReducers({ })
const initialState = {
  user: null,
  character: null,
  campaign: null,
}

const reducers = (state = initialState, action) => {
  switch(action.type) {
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

export default reducers 

