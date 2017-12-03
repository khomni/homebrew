var Term = require('../../utilities/term')

var terms = {
  CURRENCY: new Term({singular:'gold',abbreviation:'gp'}),
  WEIGHT: new Term({singular:'lb', plural:'lbs', abbreviation:'lb'}),
}

module.exports = terms
