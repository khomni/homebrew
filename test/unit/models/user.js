'use strict';

require('../../../config/globals');
const db = require(APPROOT+'/models');

const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect

const Sequelize = require('sequelize');
let schemaTests = require('./fixtures/schema')

before(done => {
  if(db._connection.synced) return done()
  db._connection.on('synced',done)
})

describe('User', ()=>{

  schemaTests(db.User)

  describe('Static Methods', () => {

    let createData = {username:'test', password:'testpassword', email:'test@test.com'}
    let user

    it('User.create()', () => {
      return db.User.create(createData)
      .then(u => {
        user = u
        expect(user).to.exist
        expect(user.$modelOptions).to.exist
      })
    })

    describe('User.validPassword()', () => {

      it('returns the user when provided the correct password', () => {
        expect(db.User.validPassword(createData.password, user.password, user)).to.eventually.equal(user)
      })

      it('returns false when provided the incorrect password', () => {
        expect(db.User.validPassword('hunter2', user.password, user)).to.eventually.equal(false)
      })

    })

    it('User.destroy()', () => {
      return db.User.destroy({where:{id:user.id}})
    })

  })

})
