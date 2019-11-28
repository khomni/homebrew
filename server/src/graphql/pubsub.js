const { PubSub } = require('graphql-subscriptions');

/* ==============================
 * graphql-subscriptions:
 *      this implementation will not work on distributed systems
 * ============================== */

const pubsub = new PubSub();

module.exports = pubsub;
