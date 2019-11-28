import {
  SET_RESOURCE,
} from '../constants/ActionTypes'

/* ==============================
 * Resources: Resources fetched by the server to view pages
 *      Characters: 
 *              Character
 *      Inventory:
 *              Item
 *      Campaigns:
 *              Campaign
 *      Journals:
 *              Journal Entry
 *      Quests:
 *              Quest
 *
 * ============================== */

// the state of the resources field should describe every possible viewable resource, probably, including the nested views
let initialState = {

}

const resources = (state = initialState, action) => {
  switch(action.type) {
    /*
    case SET_RESOURCE:
      var resources = {...state};
      resources[action.key] = action.data
      return resources
    */
    default:
      return state
  }
}

export default resources
