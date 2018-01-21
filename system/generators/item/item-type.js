const { Dictionary, Generator } = require('../index');

const size = new Dictionary({
	description: 'Size',
	options: [
		{weight: 20},
		{weight: 2, value: 'small'},
		{weight: 2, value: 'large'},
		{weight: 2, value: 'slightly undersized'},
		{weight: 2, value: 'slightly oversized'},
	]
});

const description = new Dictionary({
	description: 'Description',
	options: [
		{weight: 20},
		{weight: 2, value: 'antique', mod: 5},
		{weight: 2, value: 'hideous', mod: -5},
		{weight: 2, value: 'ornate', mod: 2},
		{weight: 2, value: 'simple', mod: -2},
		{weight: 2, value: 'plain', mod: -2},
		{weight: 2, value: 'beautiful', mod: 5},
		{weight: 2, value: 'well-balanced', mod: 2},
		{weight: 2, value: 'flawed', mod: -8},
		{weight: 2, value: 'irregular', mod: -4},
		{weight: 2, value: 'utilitarian'},
		{weight: 2, value: 'floral'},
		{weight: 2, value: 'phallic', mod: -2},
		{weight: 2, value: 'bejeweled', mod: 5},
		{weight: 2, value: 'sparkling', mod: 1},
		{weight: 2, value: 'polished'},
		{weight: 2, value: 'well-worn', mod: -1},
		{weight: 2, value: 'refurbished', mod: -1},
	]
});

const hardMaterial = new Dictionary({
	description: 'Hard Material',
	options: [
		{weight: 20},
		{weight: 10, value: 'steel'},
		{weight: 3, value: 'gold', mod: 10},
		{weight: 2, value: 'mithral', mod: 15},
		{weight: 2, value: 'adamantium', mod: 15},
		{weight: 2, value: 'glass', mod: -5},
		{weight: 1, value: 'celestial mithral', mod: 20},
		{weight: 1, value: 'wood', mod: -15},
	],
})

const fabricMaterial = new Dictionary({
	description: 'Fabric Material',
	options: [
		{weight: 20},
		{weight: 5, value: 'cloth'},
		{weight: 3, value: 'silk'},
		{weight: 3, value: 'nylon'},
		{weight: 3, value: 'canvas'},
		{weight: 3, value: 'canvas'},
		{weight: 3, value: 'leather'},
		{weight: 1, value: 'snakeskin'},
	]

})

const color = new Dictionary({
	description: 'Color',
	options: [
		{weight: 20},
		{weight: 5, value: 'white'},
		{weight: 5, value: 'black'},
		{weight: 2, value: 'grey'},
		{weight: 2, value: 'charcoal'},
		{weight: 2, value: 'silvery'},
		{weight: 2, value: 'red'},
		{weight: 2, value: 'crimson'},
		{weight: 2, value: 'scarlet'},
		{weight: 2, value: 'blue'},
		{weight: 2, value: 'azure'},
		{weight: 2, value: 'yellow'},
		{weight: 2, value: 'green'},
		{weight: 1, value: 'beige'},
		{weight: 1, value: 'cyan'},
		{weight: 1, value: 'magenta'},
		{weight: 1, value: 'indigo'},
		{weight: 1, value: 'turquoise'},
	]
})

const gemstone = new Dictionary({
	description: 'Gemstone',
	options: [
		{weight: 50},
		{weight: 5, value: 'ruby'},
		{weight: 5, value: 'sapphire'},
		{weight: 5, value: 'emerald'},
		{weight: 5, value: 'amethyst'},
		{weight: 5, value: 'topaz'},
		{weight: 5, value: 'catseye'},
		{weight: 1, value: 'diamond'},
	]
})

const itemType = new Dictionary({
	description: 'Item Type',
	options: [
		new Generator([hardMaterial, 'Longsword']),
		new Generator([hardMaterial, 'Dagger']),
		new Generator([hardMaterial, 'Katana']),
		new Generator([hardMaterial, 'Morningstar']),
		new Generator([hardMaterial, 'Fullplate']),
		new Generator([hardMaterial, 'Breastplate']),
		new Generator([hardMaterial, gemstone, 'Ring']),
		new Generator([hardMaterial, gemstone, 'Circlet']),
		new Generator([gemstone, 'Gemstone']),
		new Generator([fabricMaterial, 'Armor']),
		new Generator([fabricMaterial, 'Dress']),
		new Generator([fabricMaterial, 'Nobleman\'s Attire']),
		new Generator([fabricMaterial, 'Cape']),
		new Generator([hardMaterial, 'Pocketwatch']),
		new Generator([hardMaterial, 'Gauntlets']),
		new Generator([fabricMaterial, 'Pair of Gloves']),
		new Generator([fabricMaterial, 'Boots']),
		new Generator([hardMaterial, 'Flask']),
		new Generator([hardMaterial, 'Hand Mirror']),
		'Book',
		'Astrolabe',
		'Compass',
		new Generator([hardMaterial, 'Lock']),
		new Generator([hardMaterial, 'Manacles']),
		new Generator([fabricMaterial, 'Belt']),
		new Generator([hardMaterial, 'Chain']),
		new Generator([hardMaterial, 'Lantern']),
		'Glasses',
		new Generator([fabricMaterial, 'Scarf']),
		new Generator([fabricMaterial, 'Rope']),
		new Generator([fabricMaterial, 'Backpack']),
	]
})

const fullItem = new Generator([
	size,
	description,
	color,
	itemType,
])


module.exports = {
	itemType,
	fullItem
}

