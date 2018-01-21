const { Dictionary, Generator } = require('../index');
// const { hashString } = require('../../../common');

const hashString = function(string){
  if (Array.prototype.reduce){
    return string
      .split('')
      .reduce((a,b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
      }, 0);
  }
  var hash = 0;
  if (string.length === 0) return hash;
  for (var i = 0; i < this.length; i++) {
      var character  = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + character;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const condition = require('./conditions')
const { itemType, fullItem } = require('./item-type');
const dice = require('./dice');
const curse = require('./curses');

let damageType = new Dictionary({
	// description: 'Bonus damage type',
	options: [
		{weight: 10, value: 'fire'},
		{weight: 10, value: 'lightning'},
		{weight: 10, value: 'ice'},
		{weight: 10, value: 'acid'},
		{weight: 1, value: 'positive energy', mod: 5},
		{weight: 1, value: 'negative energy', mod: 5},
		{weight: 5, value: 'force', mod: 5},
	]
});

let perDay = new Dictionary({
	options: [
		{ weight: 4, value: 'once per month', mod: -20},
		{ weight: 8, value: 'once per week', mod: -5},
		{ weight: 16, value: 'once per day', mod: 0},
		{ weight: 8, value: 'twice per day', mod: 1},
		{ weight: 4, value: 'thrice per day', mod: 3},
		{ weight: 2, value: 'five times per day', mod: 5},
		{ weight: 1, mod: 10},
	]
});

const creatureType = new Dictionary({ 
	description: 'Specific Creature Type',
	options: [
		{weight: 10},
		{weight: 1, mod: -10, value: new Generator([
			'against',
			new Dictionary({ options: [
				'humans',
				'outsiders',
				'dragons',
				'orcs',
				'aberrations',
				'monstrous humanoids',
				'fey',
				'undead',
				'constructs'
			]})
		])},
	]
})

let magicalItem = new Generator([
	fullItem,
	condition,
	curse
], {join: '. '})

module.exports = {
	magicalItem
}
