module.exports = {
  production: {
    name:process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    forcesync: false,
    options: {
      dialect: "postgres",
      host: "127.0.0.1",
      logging: false
    }
  },
  default: {
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    forcesync: false,
    options: {
      dialect: "postgres",
      host: "127.0.0.1",
      logging: false
    }
  }
}
