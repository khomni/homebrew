const User = {
  username: user => user.name,
  // Associations
  //
  character: user => {
    return user.MainChar || user.getMainChar();
  },

  characters: (user, args, context) => {
    return user.characters || user.getCharacters()
  },

}

module.exports = User
