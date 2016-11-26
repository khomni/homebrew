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
    name: "dmtools",
    username: "omni",
    password: "g04tzDATAsource",
    forcesync: true,
    options: {
      dialect: "postgres",
      host: "127.0.0.1",
      logging: false
    }
  }
}
