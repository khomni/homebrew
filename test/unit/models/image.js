'use strict';

require('../../../config/globals');
const db = require(APPROOT+'/models');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const Sequelize = require('sequelize');
let schemaTests = require('./fixtures/schema')

before(done => {
  if(db._connection.synced) return done()
  db._connection.on('synced',done)
})

describe('Image', ()=>{

  schemaTests(db.User)

  describe('Static Methods', () => {
    let fakeFile = {
      originalname: 'testfile.svg',
      buffer: new Buffer('<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>')
    }

    let createData = {path: 'testdirectory', file:fakeFile}
    let image

    it('Image.create()', () => {
      return db.Image.create(createData)
      .then(i => {
        image = i
        expect(image).to.exist
      })
    })

    it('Image.destroy()', () => {
      return db.Image.destroy({where:{}})
    })

  })

})
