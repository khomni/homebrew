'use strict'

// the requests middleware attaches information about the request to req.requestType

module.exports = (req,res,next) => {
  req.requestType = function(args) {
    if(Array.isArray(args)) { // use recursion for arrays
      types = args.map(req.requestType)
      return types.reduce(function(a,b){return a || b})
    }

    if(typeof args == 'object' && ('and' in args || 'or' in args)) {
      orArgs = true
      andArgs = true

      if(Array.isArray(args.or)) {
        orArgs = args['or'].map(req.requestType)
        .reduce(function(a,b){return a || b})
      }
      if(Array.isArray(args.and)) {
        andArgs = args['and'].map(req.requestType)
        .reduce(function(a,b){return a && b})
      }
      return orArgs && andArgs
    }

    switch(args) {
      case 'modal': return req.get('modal') == 'true'
      case 'xhr': return req.xhr
      case 'json': return /application\/json/.test(req.get('accept'))
      default: return false
      // can you think of any other useful ways to test the request object? Add them here!
    }

  }
  return next();
}
