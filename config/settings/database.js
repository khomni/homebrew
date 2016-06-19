module.exports = {
	production: {
		name: "database_production",
		username: "root",
    password: null,
		options: {
			dialect: "postgres",
			host: "127.0.0.1",
			logging: false
		}
	},
	default: {
		options: {
			dialect: "sqlite",
			storage: "/data/development.sqlite",
			logging: false
		}
	}
}
