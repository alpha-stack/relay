/* @flow */

import RelayMetaRoute from 'RelayMetaRoute';
import RelayQuery from 'RelayQuery';

import type { RelayConcreteNode, Variables } from './types';

export default function createSubscriptionQuery(
  concreteNode: RelayConcreteNode,
  variables: Variables
): RelayQuery.Subscription {
  return RelayQuery.Subscription.create(
    concreteNode,
    RelayMetaRoute.get('$createSubscriptionQuery'),
    variables
  );
}
