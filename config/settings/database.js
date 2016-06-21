module.exports = {
	production: {
		name: "database_production",
		username: "root",
    password: null,
		forcesync: false,
		options: {
			dialect: "postgres",
			host: "127.0.0.1",
			logging: false
		}
	},
	default: {
		forcesync: false,
		options: {
			dialect: "sqlite",
			storage: "/data/development.sqlite",
			logging: false
		}
	}
}
