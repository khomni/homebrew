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

describe('Character', ()=>{

  schemaTests(db.Character)

  describe('Unique Slug Generation', () => {

    let generatedSlugs = []

    it('Generates a unique URL without duplicates', () => {
      return Promise.mapSeries(Array(15), () => {
        return db.Character.create({name: "Drizzt Daermon N'a'shezbaernon"})
        .then(character => {
          expect(generatedSlugs).to.not.include(character.url);
          generatedSlugs.push(character.getDataValue('url'));
        })
      })
    });

    it('Generates a slug that is URL-safe', () => {
      generatedSlugs.map(slug => expect(slug).to.match(/^[a-zA-Z0-9_-]+$/));
    })
  });

})
