let counter = 0;

module.exports = {
  user: () => ({
    name: `test_${counter++ % 256}`,
    password: 'testpassword',
    email: `test-${counter++ % 256}@test.com`
  }),
  character: () => ({
    name: "Drizzt Daermon N'a'shezbaernon"
  }),
  campaign: () => ({
    name: 'Test Campaign',
  })
}
