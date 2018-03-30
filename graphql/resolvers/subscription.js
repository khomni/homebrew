
// the pubsub implementation is stored in its own file in case the 
//      implementation is changed at a later date
const pubsub = require('../pubsub');

/* ==============================
 * Publishing Subscription data:
 *      1. subscriptionName = { subscribe: () => pubsub.asyncIterator('topic_of_event') }
 *      2. pubsub.publish('topic_of_event', {subscriptionName: { VALUE EXPECTED BY RESOLVER }}
 * ============================== */

const Subscription = {}

Subscription.session = {
  subscribe: () => pubsub.asyncIterator('session_changed')
}

Subscription.test = {
  subscribe: () => pubsub.asyncIterator('test')
}

/*
setInterval(() => {
  let randomNumber = Math.floor(Math.random() * 10) + 1
  pubsub.publish('test', {test: {id: randomNumber}})
}, 5000)
*/

module.exports = Subscription
