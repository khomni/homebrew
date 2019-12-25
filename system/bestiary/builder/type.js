const {
  CREATURE_TYPES,
  SAVES: { FORT, WILL, REF }
} = require('./constants');

class CreatureType {
  constructor(attributes = {}) {
    this.hitDie = attributes.hitDie;
    this.baseAttackProgression = attributes.baseAttackProgression;
    this.goodSaves = attributes.goodSaves || [];
    this.poorSaves = attributes.goodSaves || [];
  }
}

const creatureTypes = {
  __constants: CREATURE_TYPES,
  [CREATURE_TYPES.ABERRATION]: undefined,
  [CREATURE_TYPES.ANIMAL]: undefined,
  [CREATURE_TYPES.CONSTRUCT]: undefined,
  [CREATURE_TYPES.DRAGON]: undefined,
  [CREATURE_TYPES.FEY]: undefined,
  [CREATURE_TYPES.HUMANOID]: new CreatureType({
    hitDie: 8,
    baseAttackProgression: 0.75
  }),
  [CREATURE_TYPES.MAGICAL_BEAST]: undefined,
  [CREATURE_TYPES.MONSTROUS_HUMANOID]: undefined,
  [CREATURE_TYPES.OOZE]: undefined,
  [CREATURE_TYPES.OUTSIDER]: new CreatureType({
    hitDie: 10,
    baseAttackProgression: 1
  }),
  [CREATURE_TYPES.PLANT]: undefined,
  [CREATURE_TYPES.UNDEAD]: undefined,
  [CREATURE_TYPES.VERMIN]: undefined
}

module.exports = creatureTypes;
