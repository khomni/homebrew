const User = {
  // Associations

  characters: (user, args, context) => {
    return user.characters || user.getCharacters()
  },

}

module.exports = User
