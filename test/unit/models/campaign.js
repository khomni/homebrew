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
  db._connection.on('synced', done)
})

let permittedUser, forbiddenUser

before(() => Promise.all([
  db.User.create(sampleUser()).then(u => {permittedUser = u}),
  db.User.create(sampleUser()).then(u => {forbiddenUser = u}),
]))

after(() => db.User.destroy({where:{}}))
after(() => db.Campaign.destroy({where:{}}))

const { 
  campaign: sampleCampaign,
  user: sampleUser
} = require('./fixtures/sample-data')

describe('Campaign', () => {

  schemaTests(db.Campaign)

  describe('Static Methods', () => {
  
  })

  describe('Instance Methods', () => {
  })

  describe('Associations', () => {
    let campaign

    it('has the necessary association methods', () => {

      expect(permittedUser.addCampaignPermissions).to.be.a.function
      expect(permittedUser.createCampaignPermissions).to.be.a.function
      expect(permittedUser.getCampaignPermissions).to.be.a.function
      expect(permittedUser.hasCampaignPermission).to.be.a.function

      expect(permittedUser.addPermissions).to.be.a.function
      expect(permittedUser.createPermission).to.be.a.function
      expect(permittedUser.getPermissions).to.be.a.function
      expect(permittedUser.hasPermission).to.be.a.function
    
    })


    it('lets a user create an owned campaign', () => {
      return permittedUser.createCampaignPermission(sampleCampaign(), {own: true, write: true, read: true})
      .then(campaign => {

        expect(permittedUser.hasCampaignPermission(campaign)).to.eventually.be.true
        expect(forbiddenUser.hasCampaignPermission(campaign)).to.eventually.be.false
        expect(campaign.hasPermission(permittedUser)).to.eventually.be.true
        expect(campaign.hasPermission(forbiddenUser)).to.eventually.be.false
        return;
      })
    })

    it('makes the permission queriable from the instance', () => {

      return permittedUser.getPermissions({where: {permissionType: 'Campaign'}})
      .then(([permission]) => {
        // expect(permissions.length).to.be.above(0)
        expect(permission).to.exist
        expect(permission.permissionType).to.equal('Campaign')
        expect(permission.UserId).to.equal(permittedUser.id)
        // expect([permissions]).to.exist
      })
    })

  })
})

module.exports = { sampleCampaign }
