// the pubsub implementation is stored in its own file in case the
//      implementation is changed at a later date
import pubsub from '../pubsub';

/* ==============================
 * Publishing Subscription data:
 *      1. subscriptionName = { subscribe: () => pubsub.asyncIterator('topic_of_event') }
 *      2. pubsub.publish('topic_of_event', {subscriptionName: { VALUE EXPECTED BY RESOLVER }}
 * ============================== */

export const session = () => pubsub.asyncIterator('session_changed');

export const subscribe = () => pubsub.asyncIterator('test');
