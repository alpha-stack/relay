import isEqual from 'IsEqual';

/* @flow */

import PropTypes from 'PropTypes';

import React from 'React';
import RelayPropTypes from 'RelayPropTypes';
import RelayContainer from 'RelayContainer';
import type { RelayContainerSpec } from 'RelayContainer';

import type Subscription from './RelaySubscription';
import type { SubscriptionDisposable } from './types';

type subscriptionFn = (props: Object) => ?Subscription<any>;

type ActiveSubscription = {
  subscription: Subscription<any>,
  disposable: SubscriptionDisposable,
}

function disposeActiveSubscription(activeSubscription) {
  if (!activeSubscription) {
    return;
  }

  activeSubscription.disposable.dispose();
}

function subscribe(
  Component: ReactClass<any>,
  subscriptionsSpec: ?Array<subscriptionFn>,
) {
  const componentName = Component.displayName || Component.name || 'Component';

  return class Subscribe extends React.Component {
    static displayName = `Subscribe(${componentName})`;

    static propTypes = {
      relay: PropTypes.object.isRequired,
    };

    static contextTypes = {
      relay: RelayPropTypes.Environment,
    };

    relayProp: mixed;
    activeSubscriptions: Array<?ActiveSubscription>;

    constructor(props, context) {
      super(props, context);

      this.relayProp = this.makeRelayProp(props);
      this.activeSubscriptions = [];
    }

    componentDidMount() {
      if (subscriptionsSpec) {
        subscriptionsSpec.forEach((createSubscription) => {
          this.activeSubscriptions.push(
            this.makeActiveSubscription(createSubscription(this.props)),
          );
        });
      }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.relay !== this.props.relay) {
        this.relayProp = this.makeRelayProp(nextProps);
      }

      if (subscriptionsSpec) {
        subscriptionsSpec.forEach((createSubscription, index) => {
          const activeSubscription = this.activeSubscriptions[index];
          const nextSubscription = createSubscription(nextProps);

          if (!this.areSubscriptionsEqual(
            activeSubscription,
            nextSubscription,
          )) {
            disposeActiveSubscription(activeSubscription);
            this.activeSubscriptions[index] =
              this.makeActiveSubscription(nextSubscription);
          }
        });
      }
    }

    componentWillUnmount() {
      if (subscriptionsSpec) {
        this.activeSubscriptions.forEach(disposeActiveSubscription);
      }
    }

    makeRelayProp(props) {
      return {
        ...props.relay,
        subscribe: this.context.relay.subscribe,
      };
    }

    makeActiveSubscription(subscription) {
      if (!subscription) {
        return null;
      }

      return {
        subscription,
        disposable: this.context.relay.subscribe(subscription),
      };
    }

    areSubscriptionsEqual(activeSubscription, nextSubscription) {
      if (!nextSubscription && !activeSubscription) {
        // Both old and new are falsy.
        return true;
      }

      if (!nextSubscription || !activeSubscription) {
        // Only one of the pair is falsy.
        return false;
      }

      const subscription = activeSubscription.subscription;

      if (nextSubscription.constructor !== subscription.constructor) {
        // Subscriptions are of different types.
        return false;
      }

      // Need to bind subscription to Relay environment to get variables.
      nextSubscription.bindEnvironment(this.context.relay);

      // Check if variables match.
      return isEqual(
        nextSubscription.getVariables(),
        subscription.getVariables(),
      );
    }

    render() {
      return (
        <Component
          {...this.props}
          relay={this.relayProp}
        />
      );
    }
  };
}

module.exports = function createContainer(
  Component: ReactClass<any>,
  spec: RelayContainerSpec & { subscriptions?: subscriptionFn[] },
) {
  return RelayContainer.create(
    spec.subscriptions && Array.isArray(spec.subscriptions) ?
      subscribe(Component, spec.subscriptions)
    :
      Component,
    spec
  );
}
