module.exports = {
  production: {
    directory: 'production'
  },
  development: {
    directory: 'dev'
  },
  test: {
    directory: 'test'
  },
  default: {
    directory: '/',
    region: 'us-west-1',
    bucket: process.env.S3_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    logs: true,
  }
}
