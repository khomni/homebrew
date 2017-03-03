'use strict';
// Campaign Calendar
/*
{
  kind: "Year",
  comprisedOf: {
    kind: "Month",
    max: 12,
    labels: ["January","February","March","April","May","June","July","August","September","October","November","December"],

    comprisedOf: {
      kind: "Day",
      max: 28,
      labels: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],

      comprisedOf: {
        kind: "Hour",
        max: 24,

        comprisedOf: {
          kind: "Minute",
          max: 60,
        }
      }
    }
  }
}
*/

const Schema = require('js-schema');

var TimeIncrement = {}

// turn a flat object into a nested TimeIncrement schema
/*
{
  calendar.$.kind: String
  calendar.$.value: String
  calendar.$.labels: String (comma delimited)
}
*/
TimeIncrement.construct = function(flatObject) {
  
}

TimeIncrement.schema = Schema({
  'kind' : String, // e.g. 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'
  '?max': [Number, Array.of(String)], // either a number indicating the max of a range of integers, or an array of acceptable values
  '?comprisedOf' : [Schema.self, Array.of(Schema.self)],
  '?format' :
})

module.exports = TimeIncrement
