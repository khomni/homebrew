const User = {
  // Associations
  character: user => {
    return user.MainChar || user.getMainChar();
  },

  characters: (user, args, context) => {
    return user.characters || user.getCharacterPermission()
  },

}

module.exports = User
