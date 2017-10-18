import {
  SET_USER,
  SET_CHARACTER,
  SET_CAMPAIGN,
} from '../constants/ActionTypes';

export * from './resources';

const defaultOptions = {
  headers: {Accept: 'application/json'},
  credentials: 'include'
}

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

/* ============================== 
 * Thunks
 * ============================== */

export const getSession = () => (dispatch, getState) => {

  return fetch(`/?session=${Date.now()}`, defaultOptions)
  .then(response => response.json())
  .then(json => {

    if(json.user) dispatch(setUser(json.user))
    if(json.character) dispatch(setCharacter(json.character))
    if(json.campaign) dispatch(setCampaign(json.campaign))

    // update the user / main character / current campaign
  })

}
