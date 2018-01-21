const { Dictionary, Generator } = require('../index');

module.exports = new Dictionary({
	description: 'Alignment',
	options: [
		'Lawful Good',
		'Neutral Good',
		'Chaotic Good',
		'Lawful Neutral',
		'True Neutral',
		'Chaotic Neutral',
		'Lawful Evil',
		'Neutral Evil',
		'Chaotic Evil'
	]
})
