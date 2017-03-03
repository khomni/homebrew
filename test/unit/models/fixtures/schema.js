'use strict';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect

const Sequelize = require('sequelize');
const db = require(APPROOT+'/models');

module.exports = function(schema) {

  describe('Schema Tests', () => {

    it('is an instantiation of Sequelize.Model', () => {
      expect(schema).to.exist
      expect(schema).to.be.an.instanceof(Sequelize.Model)
    })

    it('queries without error', () => {
      return schema.findOne()
    })

  })


}
