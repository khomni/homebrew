'use strict'

// the requests middleware attaches information about the request to req.requestType

module.exports = (req, res, next) => {
  req.json = /application\/json/.test(req.get('accept'))
  // req.modal means the invocation of the request is equipped to handle a modal response
  req.modal = req.get('modal') == 'true'
  // req.isTab means the request was initiated by the tab system
  req.isTab = req.get('x-tab-content') == 'true'

  return next();
}
