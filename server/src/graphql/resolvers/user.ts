export const character = user => {
  return user.MainChar || user.getMainChar();
};

export const characters = (user, args, context) => {
  return user.characters || user.getCharacterPermission();
};
