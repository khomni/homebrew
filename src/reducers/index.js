/* ============================== 
 * Reducers:
 * ============================== */

import { combineReducers } from 'redux'
import {
  SET_USER,
  SET_CHARACTER,
  SET_CAMPAIGN,
} from '../constants/ActionTypes'

import resources from './resources';

const initialState = {
}

const reducers = combineReducers({
  resources,
})

export default reducers 

