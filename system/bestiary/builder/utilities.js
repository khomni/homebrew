function getModifier(abilityScore) {
  return Math.floor((abilityScore - 10) / 2);
}

module.exports = { getModifier }
