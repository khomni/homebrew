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
});

let permittedUser, forbiddenUser

before(() => Promise.all([
  db.User.create(sampleUser()).then(u => {permittedUser = u}),
  db.User.create(sampleUser()).then(u => {forbiddenUser = u}),
]))


after(() => db.User.destroy({where:{}}))
after(() => db.Character.destroy({where:{}}))

const { 
  character: sampleCharacter,
  user: sampleUser
} = require('./fixtures/sample-data')


describe('Character', () => {

  schemaTests(db.Character)


  describe('Associations', () => {

    it('has the necessary association methods', () => {

      expect(permittedUser.addCharacterPermissions).to.be.a.function
      expect(permittedUser.createCharacterPermissions).to.be.a.function
      expect(permittedUser.getCharacterPermissions).to.be.a.function
      expect(permittedUser.hasCharacterPermission).to.be.a.function

      expect(permittedUser.addPermissions).to.be.a.function
      expect(permittedUser.createPermission).to.be.a.function
      expect(permittedUser.getPermissions).to.be.a.function
      expect(permittedUser.hasPermission).to.be.a.function
    
    })

    it('lets a user create an owned character', () => {
      return permittedUser.createCharacterPermission(sampleCharacter(), {own: true, write: true, read: true})
      .then(character => {

        expect(permittedUser.hasCharacterPermission(character)).to.eventually.be.true
        expect(forbiddenUser.hasCharacterPermission(character)).to.eventually.be.false
        expect(character.hasPermission(permittedUser)).to.eventually.be.true
        expect(character.hasPermission(forbiddenUser)).to.eventually.be.false
        return;
      })
    })

    it('makes the permission queriable from the instance', () => {

      return permittedUser.getPermissions({where: {permissionType: 'Character'}})
      .then(([permission]) => {
        // expect(permissions.length).to.be.above(0)
        expect(permission).to.exist
        expect(permission.permissionType).to.equal('Character')
        expect(permission.UserId).to.equal(permittedUser.id)
        // expect([permissions]).to.exist
      })
    })
  })

  describe('Unique Slug Generation', () => {

    let generatedSlugs = []

    it('Generates a unique URL without duplicates', () => {
      return Promise.mapSeries(Array(15), () => {
        return db.Character.create(sampleCharacter())
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

