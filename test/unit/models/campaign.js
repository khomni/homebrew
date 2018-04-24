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

describe('Campaign', ()=>{

  schemaTests(db.Campaign)

  describe('Static Methods', () => {
  
  })

  describe('Instance Methods', () => {
  })

  describe('Associations', () => {
    let campaign

    const sampleCampaign = {
      name: 'Test Campaign',
    }

    it('lets a user create an owned campaign', () => {
      return db.User.create({
        name:'testuser', 
        password:'testpassword', 
        email: 'test@example.com'
      })
      .then(user => user.createCampaignPermission(sampleCampaign, {own: true, write: true, read: true}))
      .then(campaign => {
        console.log(campaign);
        return;
      })
    })
  })
})

