import schema from './schema.gql';
import user from './user.gql';
import session from './session.gql';
import character from './character.gql';
import campaign from './campaign.gql';
import image from './image.gql';
import item from './item.gql';
import journal from './journal.gql';
import lore from './lore.gql';
import quest from './quest.gql';
import events from './events.gql';
import comment from './comment.gql';
import permission from './permission.gql';

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
