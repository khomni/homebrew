const data = require('./data');
const _ = require('lodash');
const CreatureTypes = require('./type');
const { getModifier } = require('./utilities');
const SIZES = require('./data');

const WEIGHTED_CR_ATTRIBUTES = {
  hitPoints: 1,
  armorClass: 1,
  highAttack: 1,
  lowAttack: 0.75,
  averageDamageHigh: 1,
  averageDamageLow: 0.75,
  primaryAbilityDC: 1,
  secondaryAbilityDC: 0.75,
  goodSave: 0.5,
  poorSave: 0.5,
}

const STR = 'str';
const DEX = 'dex';
const CON = 'con';
const INT = 'int';
const WIS = 'wis';
const CHA = 'cha';



class Creature {
  constructor(attributes) {
    this.baseAttributes = {};
    const {
      type,
      ...baseAttributes
    } = attributes;
    this.type = CreatureTypes[type] || CreatureTypes.humanoid;
    Object.assign(this.baseAttributes, {
      hitDice: 1,
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      size: 'medium'
    }, baseAttributes);
    console.log(JSON.stringify(this, null, 2));
  }

  get hitDice() {
    return this.baseAttributes.hitDice;
  }

  set str(value) {
    this.baseAttributes.str = value;
  }

  get str() {
    return _.get(this.baseAttributes, STR, 10);
  }

  set dex(value) {
    this.baseAttributes.dex = value;
  }

  get dex() {
    return _.get(this.baseAttributes, DEX, 10);
  }

  set con(value) {
    this.baseAttributes.con = value;
  }

  get con() {
    return _.get(this.baseAttributes, CON, 10)
  }

  set int(value) {
    this.baseAttributes.int = value;
  }

  get int() {
    return _.get(this.baseAttributes, INT, 10)
  }

  set wis(value) {
    this.baseAttributes.wis = value;
  }

  get wis() {
    return _.get(this.baseAttributes, WIS, 10)
  }

  set cha(value) {
    this.baseAttributes.cha = value;
  }

  get cha() {
    return _.get(this.baseAttributes, CHA, 10)
  }

  get highAttack() {
    return this.baseAttack
  }

  get goodSave() {
    return undefined;
  }

  get poorSave() {
    return undefined;
  }

  get experience() {
    return data.REWARD_BY_CR[this.challengeRating].experience;
  }

  get hitPoints() {
    return (this.type.hitDie / 2 + getModifier(this.con)) * this.hitDice
  }

  /*
   * @returns {number}
   */
  get challengeRating() {
    let knownAttributes = 0;
    let crs = Object.keys(WEIGHTED_CR_ATTRIBUTES)
      .filter(attribute => 
        attribute in this &&
        this[attribute] !== undefined)
      .map(attribute => {
        knownAttributes += WEIGHTED_CR_ATTRIBUTES[attribute];
        return WEIGHTED_CR_ATTRIBUTES[attribute] * Creature
          .getChallengeByAttribute(attribute, this[attribute]);
      })
    const rawCR = crs.reduce((a, b) => a + b, 0) / knownAttributes;
    return Object.keys(data.REWARD_BY_CR)
      .filter(n => !isNaN(convertCrToNumber(n)))
      .sort((a, b) => convertCrToNumber(a) - convertCrToNumber(b))
      .reduce((a, b) => convertCrToNumber(b) > rawCR && a || b, 0)
  }

  toJSON() {
    return {
      ...this,
      experience: this.experience,
      challengeRating: this.challengeRating,
      [STR]: this[STR],
      [DEX]: this[DEX],
      [CON]: this[CON],
      [INT]: this[INT],
      [WIS]: this[WIS],
      [CHA]: this[CHA],
      hitPoints: this.hitPoints,
    }
  }
}

function convertCrToNumber(string) {
  let [, numerator, denominator] = string.match(/^(\d+)\/(\d+)$/) || [];
  if (numerator && denominator) {
    return parseInt(numerator, 10) / parseInt(denominator, 10);
  }
  return Number(string);

}

/*
 * @param {string} attribute - 
 * @param {number} value - 
 * @return {number}
 */
Creature.getChallengeByAttribute = function(attribute, value) {
  const table = data.STATS_BY_CR;

  return Object.keys(table)
    .sort((a, b) => table[a][attribute] - table[b][attribute])
    .map(key => table[key])
    .reduce((cr, row) => {
      return value >= row[attribute] 
        ? row.cr 
        : cr
    }, 0);
}

module.exports = Creature;
