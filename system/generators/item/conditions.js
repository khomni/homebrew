const { Dictionary, Generator } = require('../index');

const alignment = new Dictionary({
	description: 'Alignment Restriction',
	options: [
		{ weight: 10, mod: -5, value: 'Good'},
		{ weight: 10, mod: -5, value: 'Neutral'},
		{ weight: 10, mod: -5, value: 'Evil'},
		{ weight: 10, mod: -5, value: 'Lawful'},
		{ weight: 10, mod: -5, value: 'Chaotic'},
		{ weight: 1, mod: -15, value: 'Lawful Good'},
		{ weight: 1, mod: -15, value: 'Neutral Good'},
		{ weight: 1, mod: -15, value: 'Chaotic Good'},
		{ weight: 1, mod: -15, value: 'Lawful Neutral'},
		{ weight: 1, mod: -15, value: 'True Neutral'},
		{ weight: 1, mod: -15, value: 'Chaotic Neutral'},
		{ weight: 1, mod: -15, value: 'Lawful Evil'},
		{ weight: 1, mod: -15, value: 'Neutral Evil'},
		{ weight: 1, mod: -15, value: 'Chaotic Evil'}
	]
})

const race = new Dictionary({
	description: 'Race Restriction',
	options: [
		{ weight: 20, mod: -5, value: 'a Human'},
		{ weight: 20, mod: -5, value: 'a non-human'},
		{ weight: 8, mod: -6, value: 'an Elf'},
		{ weight: 8, mod: -6, value: 'a Dwarf'},
		{ weight: 6, mod: -7, value: 'a Gnome'},
		{ weight: 6, mod: -7, value: 'a Halfling'},
		{ weight: 2, mod: -15, value: 'a Goblin'},
	]
})

const conditions = new Dictionary({
	description: 'Conditional Operations',
	options: [
		// no conditions
		{ weight: 90 }, 
		// Can only be wielded by
		{ weight: 6, mod: -20, value: new Generator([
			'This item can only be used by someone who is',
			alignment,
			'aligned'
		])},
		{ weight: 3, mod: -20, value: new Generator([
			'This item can only be used by',
			race
		])},
		{ weight: 1, mod: -100, value: new Generator([
			'This item can only be used by',
			race, 
			'who is',
			alignment
		])},
		{ mod: -20, value: 'This item\'s magic only functions in natural sunlight'},
		{ mod: -50, value: 'This item\'s magic only functions under moonlight'},
	]
})

module.exports = conditions
