const { Dictionary, Generator } = require('../index');

let dice = new Generator([
	new Dictionary({
		options: [
			{weight: 1000, value: 1, mod: 0},
			{weight: 100, value: 2, mod: 10},
			{weight: 10, value: 3, mod: 25},
			{weight: 1, value: 4, mod: 50},
		]
	}),
	new Dictionary({
		options: [
			{weight: 1, value: 'd2', mod: -15},
			{weight: 2, value: 'd3', mod: -10},
			{weight: 4, value: 'd4', mod: -5},
			{weight: 6, value: 'd6', mod: 0},
			{weight: 4, value: 'd8', mod: 5},
			{weight: 2, value: 'd10', mod: 10},
			{weight: 1, value: 'd12', mod: 15},
		]
	}),
], {join: ''})

module.exports = dice;
