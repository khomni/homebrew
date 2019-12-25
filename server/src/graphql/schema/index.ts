const schema = require("./schema.gql");
const user = require("./user.gql");
const session = require("./session.gql");
const character = require("./character.gql");
const campaign = require("./campaign.gql");
const image = require("./image.gql");
const item = require("./item.gql");
const journal = require("./journal.gql");
const lore = require("./lore.gql");
const quest = require("./quest.gql");
const events = require("./events.gql");
const comment = require("./comment.gql");
const permission = require("./permission.gql");

// TODO: automatically load schema configuration files for any supported rule sets

module.exports = [
  schema,
  user,
  session,
  campaign,
  character,
  image,
  item,
  journal,
  lore,
  quest,
  events,
  comment,
  permission
];
