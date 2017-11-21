import {
  SET_USER,
  SET_CHARACTER,
  SET_CAMPAIGN,
} from '../constants/ActionTypes';

export * from './resources';

/* ============================== 
 * Sync Actions
 * ============================== */

export const setUser = user => ({
  type: SET_USER,
  user
})

export const setCharacter = character => ({
  type: SET_CHARACTER,
  character
})

export const setCampaign = campaign => ({
  type: SET_CAMPAIGN,
  campaign
})
